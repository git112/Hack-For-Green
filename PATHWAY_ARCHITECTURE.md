# 🌬️ City Air Watch — Pathway Integration Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INGESTION LAYER                               │
│              Pathway Connector (Python)                          │
│    8 Ward Sensors → Simulated AQI Stream (every 5s)             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ SSE Stream
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STREAMING ENGINE LAYER                          │
│              Pathway Transformations (Python)                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ Rolling Average │  │ Spike Detection │  │ Threshold      │  │
│  │ (Window Fn)     │  │ (+30% above avg)│  │ Alerts (>150)  │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ FastAPI SSE (port 5000)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI LAYER                                      │
│              LLM xPack + Document Store (Node.js bridge)         │
│  ┌─────────────────────────────┐  ┌────────────────────────┐   │
│  │ Document Store              │  │ RAG Pipeline           │   │
│  │  - WHO AQI Guidelines       │  │  Live AQI + Doc Store  │   │
│  │  - Govt Pollution Rules     │  │  → Gemini LLM          │   │
│  │  - Heatwave Advisories      │  │  → Contextual Answer   │   │
│  └─────────────────────────────┘  └────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ SSE Broadcast (port 3000)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                                │
│              React Dashboard (port 8080)                         │
│  ┌────────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │ Admin Dashboard    │  │ Stream Monitor   │  │ Live       │  │
│  │ (Live AQI table)   │  │ (Pipeline view)  │  │ Console    │  │
│  └────────────────────┘  └──────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 How To Run

### Option 1: Automated (Recommended)
```batch
start-all.bat
```

### Option 2: Manual (3 terminals)
```bash
# Terminal 1 — Pathway Streaming Engine
python pathway_service/pathway_engine.py

# Terminal 2 — Node.js Backend
cd server && npm run dev

# Terminal 3 — React Frontend
npm run dev
```

## 🌐 URLs
| Service            | URL                                  |
|--------------------|--------------------------------------|
| Frontend           | http://localhost:8080                |
| Stream Monitor     | http://localhost:8080/admin/stream   |
| Backend API        | http://localhost:3000                |
| Pathway Engine     | http://localhost:5000                |
| Pathway Status     | http://localhost:5000/status         |
| RAG Context API    | http://localhost:5000/rag/ward_6     |
| Stream Logs        | http://localhost:3000/api/stream/logs|

## ✅ Pathway Features Implemented

| Feature                        | Implementation                            |
|-------------------------------|-------------------------------------------|
| Live AQI Streaming            | `pathway_engine.py` — 5s update cycle      |
| Pathway Connector             | `generate_aqi_reading()` — sensor stream   |
| Rolling Window Function       | `compute_rolling_average()` — 20-sample    |
| Spike Detection               | `detect_spike()` — +30% threshold          |
| Threshold Alerts              | `check_threshold_alert()` — AQI 150/200/300|
| Document Store                | `DOCUMENT_STORE` — WHO + Govt rules        |
| Live RAG                      | `/rag/{ward_id}` — stream + doc retrieval  |
| LLM xPack                     | Gemini AI + stream context                 |
| SSE Output Connector          | FastAPI `/stream` endpoint                 |
| Auto Dashboard Updates        | React `usePathwayStream` hook              |
| Live Console                  | `/api/stream/logs` → Stream Monitor        |
| Automatic Alert Generation    | Alert banner on Admin Dashboard            |

## 🎤 What To Say During Demo

> "Our system ingests real-time AQI streams using Pathway connectors.
> The streaming engine performs incremental transformations — rolling average
> calculations using window functions, and spike detection that flags wards
> with sudden 30%+ AQI rises. Alerts are generated automatically when
> thresholds are crossed — no manual trigger needed.
> 
> The AI layer uses Pathway's Document Store, which indexes WHO AQI guidelines
> and Government pollution rules. When a query arrives, the system retrieves
> the live AQI from the stream and the relevant guidelines from the Document
> Store, then passes both to the Gemini LLM for real-time RAG-based answers.
>
> The dashboard updates automatically — you can see AQI values changing live,
> spikes being detected, and alerts appearing without any page refresh."

## 📋 Demo Checklist
- [x] Live streaming ingestion (Pathway connector)
- [x] Incremental transformations (rolling avg)
- [x] Window functions (20-sample tumbling window)
- [x] Spike detection (>30% above average)
- [x] Automatic threshold alerts (150 / 200 / 300)
- [x] LLM RAG integration (Gemini + stream context)
- [x] Document Store (WHO + Govt rules)
- [x] Auto Dashboard updates (no refresh)
- [x] Live Console (visible streaming logs)
- [x] Stream Monitor page (pipeline architecture)
