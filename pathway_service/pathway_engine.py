"""
=============================================================================
  CITY AIR WATCH — PATHWAY REAL-TIME STREAMING ENGINE
=============================================================================
  Architecture:
  1. Ingestion Layer  : Simulated AQI sensor stream (5-second updates)
  2. Streaming Engine : Rolling average, spike detection, threshold alerts
  3. AI Layer         : LLM xPack context + Document Store for RAG
  4. Output Layer     : FastAPI REST + SSE endpoint -> Node.js -> Frontend
=============================================================================
"""

from __future__ import annotations

import asyncio
import json
import math
import random
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence

from fastapi import FastAPI  # type: ignore[import-untyped]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[import-untyped]
from fastapi.responses import StreamingResponse  # type: ignore[import-untyped]
import uvicorn  # type: ignore[import-untyped]

# ─────────────────────────────────────────────
#  DOCUMENT STORE  (Simulated Pathway Doc Store)
#  Stores WHO guidelines, Govt rules, advisories
# ─────────────────────────────────────────────
DOCUMENT_STORE: Dict[str, Any] = {
    "who_guidelines": {
        "good":        {"range": "0-50",   "desc": "Air quality is satisfactory. No risk."},
        "satisfactory":{"range": "51-100", "desc": "Minor discomfort for sensitive people."},
        "moderate":    {"range": "101-200","desc": "Breathing discomfort for heart/lung disease patients, children and older adults."},
        "poor":        {"range": "201-300","desc": "Breathing discomfort for most people on prolonged exposure."},
        "very_poor":   {"range": "301-400","desc": "Respiratory illness on prolonged exposure. Effect on healthy people."},
        "severe":      {"range": "401-500","desc": "Health impacts even on healthy people. SERIOUS impact on sensitive groups."},
    },
    "govt_rules": [
        "Industries must halt operations when AQI > 300 (GRAP Stage III)",
        "Construction banned when AQI > 200 in Delhi NCR",
        "Odd-even vehicle scheme activated when AQI > 400",
        "Schools & colleges close when AQI > 350",
        "Emergency health advisory issued when AQI > 400",
    ],
    "heatwave_advisory": "During heatwave + high AQI: Stay indoors 12PM-4PM, use N95 masks, avoid strenuous activity, keep hydrated.",
    "elderly_advice": {
        "aqi_100": "Limit prolonged outdoor exertion.",
        "aqi_150": "Avoid outdoor activity during peak hours.",
        "aqi_200": "Stay indoors. Use air purifiers.",
        "aqi_300": "Emergency level. Seek medical attention if respiratory symptoms occur.",
    },
}

# ─────────────────────────────────────────────
#  WARD CONFIGURATION
# ─────────────────────────────────────────────
WARDS: List[Dict[str, Any]] = [
    {"id": "ward_1", "name": "Ward 1 - Central",    "base_aqi": 85,  "type": "residential"},
    {"id": "ward_2", "name": "Ward 2 - North",       "base_aqi": 45,  "type": "park"},
    {"id": "ward_3", "name": "Ward 3 - Traffic Hub", "base_aqi": 156, "type": "traffic"},
    {"id": "ward_4", "name": "Ward 4 - East",        "base_aqi": 120, "type": "mixed"},
    {"id": "ward_5", "name": "Ward 5 - West",        "base_aqi": 98,  "type": "commercial"},
    {"id": "ward_6", "name": "Ward 6 - Industrial",  "base_aqi": 210, "type": "industrial"},
    {"id": "ward_7", "name": "Ward 7 - South",       "base_aqi": 112, "type": "residential"},
    {"id": "ward_8", "name": "Ward 8 - Market Area", "base_aqi": 145, "type": "commercial"},
]

# ─────────────────────────────────────────────
#  IN-MEMORY STREAMING STATE
# ─────────────────────────────────────────────
aqi_history: Dict[str, deque[Dict[str, Any]]] = defaultdict(lambda: deque(maxlen=20))
stream_events: deque[Dict[str, Any]] = deque(maxlen=500)
latest_readings: Dict[str, Dict[str, Any]] = {}
active_alerts: Dict[str, Dict[str, Any]] = {}
stream_listeners: List[asyncio.Queue[str]] = []
stream_lock: threading.Lock = threading.Lock()
event_counter: int = 0
pipeline_stats: Dict[str, int | str] = {
    "total_events": 0,
    "spikes_detected": 0,
    "alerts_triggered": 0,
    "windows_processed": 0,
}
PIPELINE_STARTED_AT: str = datetime.now(timezone.utc).isoformat()


# ─────────────────────────────────────────────
#  PATHWAY STREAMING ENGINE
#  Step 1: AQI Stream Generator (Ingestion Layer)
# ─────────────────────────────────────────────
def generate_aqi_reading(ward: Dict[str, Any], tick: int) -> Dict[str, Any]:
    """
    Simulates a Pathway connector streaming AQI sensor data.
    Uses sinusoidal pattern + random noise + spikes to mimic real air quality variations.
    """
    base: int = int(ward["base_aqi"])
    hour: int = datetime.now().hour

    # Time-of-day variation (morning/evening rush hours are worse)
    time_factor: float = 1.0
    if 7 <= hour <= 9:
        time_factor = 1.25
    elif 17 <= hour <= 20:
        time_factor = 1.20
    elif 0 <= hour <= 5:
        time_factor = 0.75

    # Sinusoidal drift + random noise
    drift: float = math.sin(tick * 0.3) * 12.0
    noise: float = float(random.gauss(0, 8))
    aqi_val: int = int(float(base) * time_factor + drift + noise)
    aqi_val = max(10, min(500, aqi_val))

    # Random spike event (5% chance for industrial/traffic wards)
    spike: bool = False
    if ward["type"] in ("industrial", "traffic") and random.random() < 0.05:
        aqi_val += random.randint(40, 80)
        aqi_val = min(500, aqi_val)
        spike = True

    # Derived pollutants — explicit float() so Pylance resolves round() overload
    pm25: float = round(float(aqi_val) * 0.6 + float(random.gauss(0, 3)), 1)  # type: ignore[call-overload]
    pm10: float = round(float(aqi_val) * 0.9 + float(random.gauss(0, 5)), 1)  # type: ignore[call-overload]
    no2: float = round(float(aqi_val) * 0.3 + float(random.gauss(0, 2)), 1)  # type: ignore[call-overload]
    co: float = round(float(aqi_val) * 0.02 + float(random.gauss(0, 0.5)), 2)  # type: ignore[call-overload]

    return {
        "ward_id":   ward["id"],
        "ward_name": ward["name"],
        "ward_type": ward["type"],
        "aqi":       aqi_val,
        "pm25":      pm25,
        "pm10":      pm10,
        "no2":       no2,
        "co":        co,
        "spike":     spike,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "_tick":     tick,
    }


# ─────────────────────────────────────────────
#  Step 2: Streaming Transformations (Engine Layer)
# ─────────────────────────────────────────────
def get_aqi_level(aqi: int) -> str:
    if aqi <= 50:  return "Good"
    if aqi <= 100: return "Satisfactory"
    if aqi <= 200: return "Moderate"
    if aqi <= 300: return "Poor"
    if aqi <= 400: return "Very Poor"
    return "Severe"


def compute_rolling_average(ward_id: str) -> float:
    """Pathway window function: tumbling 60s window -> rolling average AQI."""
    history: List[Dict[str, Any]] = list(aqi_history[ward_id])
    if not history:
        return 0.0
    total: float = float(sum(int(r["aqi"]) for r in history))
    return round(total / float(len(history)), 1)  # type: ignore[call-overload]


def detect_spike(ward_id: str, current_aqi: int) -> Optional[Dict[str, Any]]:
    """
    Pathway incremental transformation: spike detection.
    Detects if current AQI is > 30% above rolling average.
    """
    history: List[Dict[str, Any]] = list(aqi_history[ward_id])
    if len(history) < 3:
        return None
    recent: List[Dict[str, Any]] = history[-5:]  # type: ignore[index]
    total: float = float(sum(int(r["aqi"]) for r in recent))
    avg: float = total / float(min(5, len(history)))
    if float(current_aqi) > avg * 1.30:
        return {
            "type":         "SPIKE",
            "ward_id":      ward_id,
            "current_aqi":  current_aqi,
            "rolling_avg":  round(avg, 1),  # type: ignore[call-overload]
            "increase_pct": round(((float(current_aqi) - avg) / avg) * 100.0, 1),  # type: ignore[call-overload]
        }
    return None


def check_threshold_alert(ward_id: str, ward_name: str, aqi: int) -> Optional[Dict[str, Any]]:
    """
    Pathway filter: aqi_stream.filter(pw.this.aqi > 150)
    Generates automatic alerts for critical AQI threshold crosses.
    """
    prev_reading: Dict[str, Any] = latest_readings.get(ward_id, {})
    prev: int = int(prev_reading.get("aqi", 0))
    thresholds: List[tuple[int, str, str, str]] = [
        (300, "EMERGENCY", "🚨", "Immediate action required. Industrial halt mandatory."),
        (200, "CRITICAL",  "🔴", "High pollution. Vulnerable groups must stay indoors."),
        (150, "WARNING",   "🟠", "Elevated AQI. Limit outdoor activities."),
    ]
    for level_aqi, severity, icon, action in thresholds:
        if aqi >= level_aqi and prev < level_aqi:
            return {
                "type":      "THRESHOLD_ALERT",
                "severity":  severity,
                "icon":      icon,
                "ward_id":   ward_id,
                "ward_name": ward_name,
                "aqi":       aqi,
                "threshold": level_aqi,
                "action":    action,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
    return None


def rag_context(ward_name: str, aqi: int) -> Dict[str, Any]:
    """
    Pathway Document Store + RAG:
    Retrieves relevant guidelines from Document Store based on current AQI.
    """
    level: str = get_aqi_level(aqi)
    level_key: str = level.lower().replace(" ", "_")

    guideline: Any = DOCUMENT_STORE["who_guidelines"].get(
        level_key,
        DOCUMENT_STORE["who_guidelines"].get("moderate"),
    )

    # Retrieve applicable govt rules
    govt: List[str] = DOCUMENT_STORE["govt_rules"]
    applicable_rules: List[str] = []
    if aqi > 300:
        applicable_rules = govt[0:3]
    elif aqi > 200:
        applicable_rules = govt[0:2]
    elif aqi > 150:
        applicable_rules = govt[0:1]

    # Elderly advice lookup
    elderly_key: str
    if aqi >= 300:
        elderly_key = "aqi_300"
    elif aqi >= 200:
        elderly_key = "aqi_200"
    elif aqi >= 150:
        elderly_key = "aqi_150"
    else:
        elderly_key = "aqi_100"

    return {
        "who_guideline":  guideline,
        "govt_rules":     applicable_rules,
        "elderly_advice": DOCUMENT_STORE["elderly_advice"][elderly_key],
        "heatwave":       DOCUMENT_STORE["heatwave_advisory"] if aqi > 150 else None,
    }


# ─────────────────────────────────────────────
#  Logging helper
# ─────────────────────────────────────────────
def log_event(event_type: str, data: Dict[str, Any], level: str = "info") -> None:
    global event_counter  # noqa: PLW0603
    event_counter = event_counter + 1
    stream_events.append({
        "id":        event_counter,
        "type":      event_type,
        "level":     level,
        "data":      data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


# ─────────────────────────────────────────────
#  Broadcast helper  (thread-safe -> asyncio queue)
# ─────────────────────────────────────────────
def broadcast(event: Dict[str, Any]) -> None:
    """Put event into every active SSE client queue (thread-safe)."""
    payload: str = json.dumps(event)
    dead: List[asyncio.Queue[str]] = []
    with stream_lock:
        for q in stream_listeners:
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                dead.append(q)
        for q in dead:
            stream_listeners.remove(q)


# ─────────────────────────────────────────────
#  Step 3: Stream Processor (Main Pipeline Loop)
#  Runs in a daemon thread alongside uvicorn
# ─────────────────────────────────────────────
def pathway_pipeline() -> None:
    """
    Main Pathway pipeline loop.
    Mimics: aqi_stream -> transformations -> output connector
    Runs every 5 seconds (simulated real-time ingestion).
    """
    tick: int = 0
    print("🚀 [Pathway Engine] Starting AQI Streaming Pipeline...")
    print("📡 [Pathway Engine] Ingesting AQI sensor streams from 8 wards...")

    while True:
        ward_updates: List[Dict[str, Any]] = []
        city_aqis: List[int] = []

        for ward in WARDS:
            # ── STEP 1: Ingestion Layer ──────────────────────
            reading: Dict[str, Any] = generate_aqi_reading(ward, tick)
            aqi_history[ward["id"]].append(reading)
            pipeline_stats["total_events"] = int(pipeline_stats["total_events"]) + 1

            # ── STEP 2: Streaming Transformations ────────────
            rolling_avg: float = compute_rolling_average(ward["id"])
            spike_info: Optional[Dict[str, Any]] = detect_spike(ward["id"], int(reading["aqi"]))
            alert: Optional[Dict[str, Any]] = check_threshold_alert(
                ward["id"], str(ward["name"]), int(reading["aqi"])
            )
            rag_ctx: Dict[str, Any] = rag_context(str(ward["name"]), int(reading["aqi"]))

            if spike_info:
                pipeline_stats["spikes_detected"] = int(pipeline_stats["spikes_detected"]) + 1
                log_event("SPIKE_DETECTED", spike_info, "warning")
                print(f"⚡ [Pathway Spike] {ward['name']}: AQI {reading['aqi']} (+{spike_info['increase_pct']}% above avg)")

            if alert:
                pipeline_stats["alerts_triggered"] = int(pipeline_stats["alerts_triggered"]) + 1
                active_alerts[ward["id"]] = alert
                log_event("THRESHOLD_ALERT", alert, "critical")
                print(f"🚨 [Pathway Alert] {alert['severity']} in {ward['name']}: AQI={reading['aqi']}")

            # Update latest
            latest_readings[ward["id"]] = {
                **reading,
                "aqi_level":   get_aqi_level(int(reading["aqi"])),
                "rolling_avg": rolling_avg,
                "spike":       spike_info is not None or bool(reading.get("spike", False)),
                "alert":       alert,
                "rag_context": rag_ctx,
            }
            city_aqis.append(int(reading["aqi"]))
            ward_updates.append(latest_readings[ward["id"]])

        # ── Window Aggregation (tumbling window) ──────────────
        city_avg: float = round(float(sum(city_aqis)) / float(len(city_aqis)), 1)  # type: ignore[call-overload]
        city_max: int = max(city_aqis)
        pipeline_stats["windows_processed"] = int(pipeline_stats["windows_processed"]) + 1
        critical_count: int = sum(1 for a in city_aqis if a > 150)

        # ── STEP 3: Output Connector -> SSE ────────────────────
        output_event: Dict[str, Any] = {
            "event":     "aqi_update",
            "tick":      tick,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "pipeline": {
                "layer": "Pathway Streaming Engine",
                "tick":  tick,
                "stats": {
                    "total_events":      int(pipeline_stats["total_events"]),
                    "spikes_detected":   int(pipeline_stats["spikes_detected"]),
                    "alerts_triggered":  int(pipeline_stats["alerts_triggered"]),
                    "windows_processed": int(pipeline_stats["windows_processed"]),
                    "started_at":        PIPELINE_STARTED_AT,
                },
            },
            "city_summary": {
                "avg_aqi":        city_avg,
                "max_aqi":        city_max,
                "aqi_level":      get_aqi_level(int(city_avg)),
                "critical_wards": critical_count,
                "total_wards":    len(WARDS),
            },
            "wards":         ward_updates,
            "active_alerts": list(active_alerts.values()),
        }

        broadcast(output_event)
        log_event("PIPELINE_TICK", {
            "tick":           tick,
            "city_avg":       city_avg,
            "city_max":       city_max,
            "critical_wards": critical_count,
        }, "info")

        print(
            f"✅ [Pathway] Tick {tick}: CityAvgAQI={city_avg} | "
            f"Max={city_max} | Critical={critical_count} | "
            f"Clients={len(stream_listeners)}"
        )
        tick = tick + 1  # type: ignore[operator]
        time.sleep(5)


# ─────────────────────────────────────────────
#  FastAPI App — Output Layer
# ─────────────────────────────────────────────
app = FastAPI(title="CityAirWatch Pathway Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/stream")
async def stream_endpoint() -> StreamingResponse:
    """SSE endpoint — Pathway output connector -> Dashboard."""
    client_queue: asyncio.Queue[str] = asyncio.Queue(maxsize=100)
    with stream_lock:
        stream_listeners.append(client_queue)

    async def event_generator():  # type: ignore[no-untyped-def]
        # Send current state immediately as snapshot
        if latest_readings:
            city_aqis_snap: List[int] = [int(v["aqi"]) for v in latest_readings.values()]
            avg_snap: float = round(float(sum(city_aqis_snap)) / float(len(city_aqis_snap)), 1)  # type: ignore[call-overload]
            snapshot: Dict[str, Any] = {
                "event":     "snapshot",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "city_summary": {
                    "avg_aqi":        avg_snap,
                    "max_aqi":        max(city_aqis_snap),
                    "aqi_level":      get_aqi_level(int(avg_snap)),
                    "critical_wards": sum(1 for a in city_aqis_snap if a > 150),
                    "total_wards":    len(WARDS),
                },
                "wards":         list(latest_readings.values()),
                "active_alerts": list(active_alerts.values()),
                "pipeline":      {
                    "stats": {
                        "total_events":      int(pipeline_stats["total_events"]),
                        "spikes_detected":   int(pipeline_stats["spikes_detected"]),
                        "alerts_triggered":  int(pipeline_stats["alerts_triggered"]),
                        "windows_processed": int(pipeline_stats["windows_processed"]),
                        "started_at":        PIPELINE_STARTED_AT,
                    }
                },
            }
            yield f"data: {json.dumps(snapshot)}\n\n"

        try:
            while True:
                try:
                    payload: str = await asyncio.wait_for(client_queue.get(), timeout=3.0)
                    yield f"data: {payload}\n\n"
                except asyncio.TimeoutError:
                    hb: str = json.dumps({
                        "event":     "heartbeat",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                    yield f"data: {hb}\n\n"
        except GeneratorExit:
            pass
        finally:
            with stream_lock:
                if client_queue in stream_listeners:
                    stream_listeners.remove(client_queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":               "no-cache",
            "X-Accel-Buffering":           "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


@app.get("/status")
async def status() -> Dict[str, Any]:
    """Pathway pipeline status endpoint."""
    return {
        "status":        "running",
        "pipeline":      "Pathway Streaming Engine v1.0",
        "stats": {
            "total_events":      int(pipeline_stats["total_events"]),
            "spikes_detected":   int(pipeline_stats["spikes_detected"]),
            "alerts_triggered":  int(pipeline_stats["alerts_triggered"]),
            "windows_processed": int(pipeline_stats["windows_processed"]),
            "started_at":        PIPELINE_STARTED_AT,
        },
        "wards":         len(latest_readings),
        "active_alerts": len(active_alerts),
        "clients":       len(stream_listeners),
        "doc_store": {
            "guidelines": len(DOCUMENT_STORE["who_guidelines"]),
            "rules":      len(DOCUMENT_STORE["govt_rules"]),
            "indexed_at": PIPELINE_STARTED_AT,
        },
    }


@app.get("/wards")
async def get_wards() -> Dict[str, Any]:
    return {"wards": list(latest_readings.values())}


@app.get("/alerts")
async def get_alerts() -> Dict[str, Any]:
    return {"alerts": list(active_alerts.values())}


@app.get("/logs")
async def get_logs(limit: int = 50) -> Dict[str, Any]:
    all_events: List[Dict[str, Any]] = list(stream_events)
    sliced: List[Dict[str, Any]] = all_events[-limit:]  # type: ignore[index]
    return {"events": list(reversed(sliced))}


@app.get("/rag/{ward_id}")
async def get_rag_context(ward_id: str) -> Dict[str, Any]:
    """RAG endpoint: retrieves live AQI + Document Store guidelines."""
    reading: Optional[Dict[str, Any]] = latest_readings.get(ward_id)
    if not reading:
        return {"error": "Ward not found"}
    return {
        "ward":        reading["ward_name"],
        "current_aqi": reading["aqi"],
        "aqi_level":   reading["aqi_level"],
        "rag_context": reading["rag_context"],
        "rolling_avg": reading["rolling_avg"],
        "alert":       reading.get("alert"),
    }


@app.get("/docstore")
async def get_docstore() -> Dict[str, Any]:
    """Exposes the Pathway Document Store content."""
    return {"document_store": DOCUMENT_STORE}


# ─────────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    pipeline_thread: threading.Thread = threading.Thread(target=pathway_pipeline, daemon=True)
    pipeline_thread.start()
    print("🌐 [FastAPI] Starting output server on http://localhost:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="warning")
