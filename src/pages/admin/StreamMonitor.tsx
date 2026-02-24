import { usePathwayStream, type WardReading } from "@/hooks/usePathwayStream";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
    Activity, AlertTriangle, BarChart2, Brain, CheckCircle,
    Database, Terminal, TrendingUp, Wifi, WifiOff,
    Zap, ArrowUp, ArrowDown, Minus, ChevronDown, ChevronRight,
    Send, BookOpen, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── AQI colour utility ──────────────────────────────── */
function aqiColor(aqi: number) {
    if (aqi <= 50) return { bg: "rgba(16,185,129,0.08)", text: "#34d399", glow: "0 0 40px rgba(16,185,129,0.25)", label: "Good" };
    if (aqi <= 100) return { bg: "rgba(250,204,21,0.08)", text: "#facc15", glow: "0 0 40px rgba(250,204,21,0.25)", label: "Satisfactory" };
    if (aqi <= 200) return { bg: "rgba(251,146,60,0.08)", text: "#fb923c", glow: "0 0 40px rgba(251,146,60,0.25)", label: "Moderate" };
    if (aqi <= 300) return { bg: "rgba(248,113,113,0.08)", text: "#f87171", glow: "0 0 40px rgba(248,113,113,0.25)", label: "Poor" };
    if (aqi <= 400) return { bg: "rgba(239,68,68,0.08)", text: "#ef4444", glow: "0 0 40px rgba(239,68,68,0.35)", label: "Very Poor" };
    return { bg: "rgba(168,85,247,0.08)", text: "#a855f7", glow: "0 0 40px rgba(168,85,247,0.35)", label: "Severe" };
}

function levelColor(level: string) {
    const m: Record<string, string> = {
        info: "#60a5fa", warning: "#fbbf24", critical: "#f87171", success: "#34d399"
    };
    return m[level] || "#9ca3af";
}
function levelIcon(level: string) {
    if (level === "critical") return "🚨";
    if (level === "warning") return "⚠️";
    if (level === "success") return "✅";
    return "📊";
}

/* ─── Mini sparkline ──────────────────────────────────── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
    if (values.length < 2) return null;
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = max - min || 1;
    const w = 80, h = 28;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(" ");
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx={parseFloat(pts.split(" ").pop()!.split(",")[0])} cy={parseFloat(pts.split(" ").pop()!.split(",")[1])} r="2.5" fill={color} />
        </svg>
    );
}

/* ─── Ward history tracker ────────────────────────────── */
const wardHistory: Record<string, number[]> = {};

/* ─── Ward AQI Card (compact) ─────────────────────────── */
function WardCard({ ward, animKey }: { ward: WardReading; animKey: number }) {
    if (!wardHistory[ward.ward_id]) wardHistory[ward.ward_id] = [];
    if (wardHistory[ward.ward_id].at(-1) !== ward.aqi) {
        wardHistory[ward.ward_id].push(ward.aqi);
        if (wardHistory[ward.ward_id].length > 20) wardHistory[ward.ward_id].shift();
    }
    const c = aqiColor(ward.aqi);
    const hist = wardHistory[ward.ward_id];
    const prev = hist.length >= 2 ? hist[hist.length - 2] : ward.aqi;
    const diff = ward.aqi - prev;

    return (
        <motion.div
            key={`${ward.ward_id}-${animKey}`}
            initial={{ scale: 0.97, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: c.bg, borderColor: `${c.text}33` }}
            className="relative rounded-xl border p-3 overflow-hidden"
        >
            {ward.spike && (
                <span className="absolute top-1.5 right-1.5 animate-ping inline-flex h-2 w-2 rounded-full opacity-75"
                    style={{ background: c.text }} />
            )}
            <div className="flex items-start justify-between mb-1.5">
                <p className="text-xs font-medium text-foreground leading-tight pr-2">{ward.ward_name}</p>
                {diff > 2 ? <ArrowUp className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
                    : diff < -2 ? <ArrowDown className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
                        : <Minus className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />}
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <motion.p
                        key={ward.aqi}
                        initial={{ y: -6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-2xl font-bold font-mono"
                        style={{ color: c.text }}
                    >
                        {ward.aqi}
                    </motion.p>
                    <p className="text-[10px] text-muted-foreground">{ward.aqi_level}</p>
                </div>
                <Sparkline values={hist} color={c.text} />
            </div>
            <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">avg {ward.rolling_avg}</span>
                {ward.spike && <span className="text-[10px] font-bold animate-pulse" style={{ color: c.text }}>⚡ SPIKE</span>}
            </div>
        </motion.div>
    );
}

/* ═════════════════════════════════════════════════════════
   MAIN STREAM MONITOR PAGE
   ═════════════════════════════════════════════════════════ */
export default function StreamMonitor() {
    const stream = usePathwayStream();
    const logEndRef = useRef<HTMLDivElement>(null);
    const [ragQuery, setRagQuery] = useState("");
    const [ragResponse, setRagResponse] = useState<string>("");
    const [ragLoading, setRagLoading] = useState(false);
    const [animKey, setAnimKey] = useState(0);
    const [docStoreOpen, setDocStoreOpen] = useState(false);
    const [docTab, setDocTab] = useState<"who" | "govt">("who");
    const [latency, setLatency] = useState(0);

    useEffect(() => { setAnimKey(k => k + 1); }, [stream.tick]);

    useEffect(() => {
        if (stream.lastUpdate) {
            setLatency(Math.max(0, Date.now() - new Date(stream.lastUpdate).getTime()));
        }
    }, [stream.lastUpdate]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [stream.logs.length]);

    async function handleRagQuery() {
        if (!ragQuery.trim()) return;
        setRagLoading(true);
        setRagResponse("");
        try {
            const wardInfo = stream.wardsList
                .map(w => `${w.ward_name}: AQI=${w.aqi} (${w.aqi_level}), rolling_avg=${w.rolling_avg}${w.spike ? " ⚡SPIKE" : ""}`)
                .join("\n");
            const alertInfo = stream.activeAlerts
                .map(a => `${a.icon} ${a.ward_name}: ${a.severity} (AQI=${a.aqi})`)
                .join("\n") || "No active alerts";
            const docStoreContext = `
WHO GUIDELINES (Document Store):
- Good (0-50): No risk for general population
- Moderate (101-200): Breathing discomfort for sensitive groups
- Poor (201-300): Breathing discomfort for most people on prolonged exposure
- Very Poor (301-400): Respiratory illness risk, effect on healthy people
- Severe (401-500): Health impacts even on healthy people

GOVT RULES (Document Store):
- Industries must halt operations when AQI > 300 (GRAP Stage III)
- Construction banned when AQI > 200 in Delhi NCR
- Schools & colleges close when AQI > 350
- Emergency health advisory issued when AQI > 400

LIVE STREAM DATA (Pathway Engine):
${wardInfo}

ACTIVE ALERTS:
${alertInfo}

City Average AQI: ${stream.cityStats?.avg_aqi ?? "N/A"}
City Max AQI: ${stream.cityStats?.max_aqi ?? "N/A"}
Critical Wards: ${stream.cityStats?.critical_wards ?? 0}/${stream.cityStats?.total_wards ?? 8}
            `.trim();

            const res = await fetch("http://localhost:3000/api/chatbot/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: ragQuery,
                    user_role: "admin",
                    city: "Delhi",
                    current_aqi: stream.cityStats?.avg_aqi,
                    ward_context: docStoreContext,
                }),
            });
            const data = await res.json();
            setRagResponse(data.response || data.message || "No response");
        } catch {
            setRagResponse("❌ Failed to query. Make sure backend is running.");
        }
        setRagLoading(false);
    }

    const isLive = stream.connected;
    const cityAqi = stream.cityStats?.avg_aqi ?? 0;
    const cityColor = aqiColor(cityAqi);
    const maxAqi = stream.cityStats?.max_aqi ?? 0;
    const maxColor = aqiColor(maxAqi);

    // ── Build citations for RAG response ──
    const topWard = stream.wardsList.length > 0
        ? stream.wardsList.reduce((a, b) => a.aqi > b.aqi ? a : b)
        : null;

    return (
        <div className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ═══════════════════════════════════════════════
                1️⃣  TOP HEADER — Minimal
               ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-1"
            >
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-foreground tracking-tight">
                        CleanAirGov
                    </h1>
                    <span className="text-muted-foreground text-sm">|</span>
                    <span className="text-sm text-muted-foreground font-medium">Stream Monitor</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        {isLive ? (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                        ) : (
                            <WifiOff className="w-3 h-3 text-red-400" />
                        )}
                        <span className={isLive ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                            {isLive ? "Live" : "Offline"}
                        </span>
                    </div>
                    <span className="text-muted-foreground font-mono">
                        Tick: <span className="text-foreground font-semibold">{stream.tick}</span>
                    </span>
                    <span className="text-muted-foreground font-mono">
                        Latency: <span className="text-foreground font-semibold">{latency}ms</span>
                    </span>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════
                2️⃣  LIVE STATUS BAR — Thin Horizontal Strip
               ═══════════════════════════════════════════════ */}
            {stream.pipelineStats && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center gap-6 px-4 py-2 rounded-lg text-xs font-mono"
                    style={{
                        background: "rgba(100,116,139,0.06)",
                        borderBottom: "1px solid rgba(148,163,184,0.1)",
                    }}
                >
                    <span className="text-muted-foreground">
                        Events: <span className="text-foreground font-semibold">{stream.pipelineStats.total_events}</span>
                    </span>
                    <span className="text-muted-foreground">
                        Spikes: <span style={{ color: "#fb923c" }} className="font-semibold">{stream.pipelineStats.spikes_detected ?? 0}</span>
                    </span>
                    <span className="text-muted-foreground">
                        Alerts: <span style={{ color: "#f87171" }} className="font-semibold">{stream.pipelineStats.alerts_triggered ?? 0}</span>
                    </span>
                    <span className="text-muted-foreground">
                        Windows: <span style={{ color: "#a78bfa" }} className="font-semibold">{stream.pipelineStats.windows_processed ?? 0}</span>
                    </span>
                    <span className="ml-auto text-muted-foreground text-[11px]">
                        Last Update: <span className="text-foreground">{stream.lastUpdate ? new Date(stream.lastUpdate).toLocaleTimeString() : "—"}</span>
                    </span>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════
                3️⃣  CORE METRICS ROW — 4 Elegant Glow Cards
               ═══════════════════════════════════════════════ */}
            {stream.cityStats && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                >
                    {/* City Avg AQI */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="rounded-2xl p-5 border transition-all"
                        style={{
                            background: cityColor.bg,
                            borderColor: `${cityColor.text}22`,
                            boxShadow: cityColor.glow,
                        }}
                    >
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                            <BarChart2 className="w-3.5 h-3.5" style={{ color: cityColor.text }} />
                            City Avg AQI
                        </p>
                        <motion.p
                            key={stream.cityStats.avg_aqi}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-bold font-mono"
                            style={{ color: cityColor.text }}
                        >
                            {stream.cityStats.avg_aqi}
                        </motion.p>
                        <p className="text-[11px] text-muted-foreground mt-1">{cityColor.label}</p>
                    </motion.div>

                    {/* Max AQI */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="rounded-2xl p-5 border transition-all"
                        style={{
                            background: maxColor.bg,
                            borderColor: `${maxColor.text}22`,
                            boxShadow: maxColor.glow,
                        }}
                    >
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" style={{ color: maxColor.text }} />
                            Max AQI
                        </p>
                        <motion.p
                            key={stream.cityStats.max_aqi}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-bold font-mono"
                            style={{ color: maxColor.text }}
                        >
                            {stream.cityStats.max_aqi}
                        </motion.p>
                        <p className="text-[11px] text-muted-foreground mt-1">{maxColor.label}</p>
                    </motion.div>

                    {/* Critical Wards */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="rounded-2xl p-5 border transition-all"
                        style={{
                            background: "rgba(239,68,68,0.06)",
                            borderColor: "rgba(239,68,68,0.15)",
                            boxShadow: stream.cityStats.critical_wards > 0 ? "0 0 30px rgba(239,68,68,0.15)" : "none",
                        }}
                    >
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                            Critical Wards
                        </p>
                        <motion.p
                            key={stream.cityStats.critical_wards}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-bold font-mono"
                            style={{ color: "#ef4444" }}
                        >
                            {stream.cityStats.critical_wards}
                            <span className="text-base text-muted-foreground font-normal">/{stream.cityStats.total_wards}</span>
                        </motion.p>
                        <p className="text-[11px] text-muted-foreground mt-1">Above AQI 150</p>
                    </motion.div>

                    {/* Active Alerts */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="rounded-2xl p-5 border transition-all"
                        style={{
                            background: "rgba(251,146,60,0.06)",
                            borderColor: "rgba(251,146,60,0.15)",
                            boxShadow: stream.activeAlerts.length > 0 ? "0 0 30px rgba(251,146,60,0.15)" : "none",
                        }}
                    >
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" style={{ color: "#fb923c" }} />
                            Active Alerts
                        </p>
                        <motion.p
                            key={stream.activeAlerts.length}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-bold font-mono"
                            style={{ color: "#fb923c" }}
                        >
                            {stream.activeAlerts.length}
                        </motion.p>
                        <p className="text-[11px] text-muted-foreground mt-1">Threshold breaches</p>
                    </motion.div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════
                WARD GRID
               ═══════════════════════════════════════════════ */}
            {stream.wardsList.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {stream.wardsList.map(ward => (
                            <WardCard key={ward.ward_id} ward={ward} animKey={animKey} />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════
                4️⃣  COMBINED CONSOLE + ALERTS — 50/50 Layout
               ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
                {/* ── LEFT: Live Console ── */}
                <div
                    className="rounded-2xl border overflow-hidden"
                    style={{ background: "#0a0f1a", borderColor: "rgba(30,41,59,0.6)" }}
                >
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(30,41,59,0.6)" }}>
                        <Terminal className="w-4 h-4" style={{ color: "#34d399" }} />
                        <span className="text-sm font-semibold" style={{ color: "#34d399" }}>Live Console</span>
                        <span className="ml-auto text-[11px] font-mono" style={{ color: "#475569" }}>
                            {stream.logs.length} entries
                        </span>
                    </div>
                    <div className="p-3 h-[320px] overflow-y-auto font-mono text-xs" style={{ color: "#94a3b8" }}>
                        {stream.logs.length === 0 && (
                            <p className="text-center mt-12" style={{ color: "#334155" }}>Waiting for stream events...</p>
                        )}
                        {stream.logs.map((log) => (
                            <div key={log.id} className="mb-1 flex gap-2 items-start">
                                <span style={{ color: "#334155" }} className="flex-shrink-0">
                                    [{new Date(log.timestamp).toLocaleTimeString()}]
                                </span>
                                <span className="flex-shrink-0">{levelIcon(log.level)}</span>
                                <span style={{ color: levelColor(log.level) }}>{log.message}</span>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>

                {/* ── RIGHT: Auto Alerts Panel ── */}
                <div
                    className="rounded-2xl border overflow-hidden"
                    style={{ background: "rgba(127,29,29,0.04)", borderColor: "rgba(239,68,68,0.12)" }}
                >
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(239,68,68,0.12)" }}>
                        <ShieldAlert className="w-4 h-4" style={{ color: "#f87171" }} />
                        <span className="text-sm font-semibold text-foreground">Auto Alerts</span>
                        {stream.activeAlerts.length > 0 && (
                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                                {stream.activeAlerts.length}
                            </span>
                        )}
                    </div>
                    <div className="p-3 h-[320px] overflow-y-auto space-y-2">
                        {stream.activeAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <CheckCircle className="w-8 h-8 mb-2 opacity-40" style={{ color: "#34d399" }} />
                                <p className="text-sm font-medium">All Clear</p>
                                <p className="text-xs">No threshold breaches</p>
                            </div>
                        ) : (
                            stream.activeAlerts.map((alert, i) => {
                                const ac = aqiColor(alert.aqi);
                                return (
                                    <motion.div
                                        key={`${alert.ward_id}-${i}`}
                                        initial={{ x: 10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="rounded-xl p-3 border"
                                        style={{ background: ac.bg, borderColor: `${ac.text}22` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{alert.icon}</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{alert.ward_name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{alert.severity}</p>
                                                </div>
                                            </div>
                                            <p className="text-xl font-bold font-mono" style={{ color: ac.text }}>{alert.aqi}</p>
                                        </div>
                                        {alert.action && (
                                            <p className="mt-1.5 text-[10px] text-muted-foreground border-t pt-1.5"
                                                style={{ borderColor: `${ac.text}15` }}>
                                                📋 {alert.action}
                                            </p>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════
                5️⃣  RAG — AI INSIGHT ASSISTANT
               ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl border p-5"
                style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.04))",
                    borderColor: "rgba(99,102,241,0.12)",
                }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5" style={{ color: "#818cf8" }} />
                    <h3 className="text-sm font-bold text-foreground">AI Insight Assistant</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
                        RAG + Live Data
                    </span>
                </div>

                {/* Input */}
                <div className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                        <input
                            value={ragQuery}
                            onChange={e => setRagQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleRagQuery()}
                            placeholder="Ask about current air quality..."
                            className="w-full rounded-xl px-4 py-2.5 text-sm border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                            style={{ borderColor: "rgba(99,102,241,0.15)" }}
                        />
                    </div>
                    <Button
                        onClick={handleRagQuery}
                        disabled={ragLoading || !ragQuery.trim()}
                        size="sm"
                        className="rounded-xl px-4 gap-1.5"
                    >
                        {ragLoading ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <Send className="w-3.5 h-3.5" />
                        )}
                        {ragLoading ? "Thinking..." : "Ask"}
                    </Button>
                </div>

                {/* Smart Suggestions */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {["Why is Ward 6 critical?", "What should elderly do?", "Which wards need emergency action?", "Summarize air quality"].map(q => (
                        <button
                            key={q}
                            onClick={() => setRagQuery(q)}
                            className="text-[11px] px-3 py-1 rounded-full border font-medium transition-all hover:border-primary/40 hover:text-foreground"
                            style={{
                                background: "rgba(99,102,241,0.05)",
                                borderColor: "rgba(99,102,241,0.12)",
                                color: "#94a3b8",
                            }}
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {/* RAG Response — Glass Card */}
                <AnimatePresence>
                    {ragResponse && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-xl p-4 border"
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                borderColor: "rgba(99,102,241,0.15)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Brain className="w-4 h-4" style={{ color: "#818cf8" }} />
                                <span className="text-sm font-semibold text-foreground">GovAir AI</span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">{ragResponse}</p>
                            {/* Citations */}
                            <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
                                <span className="text-[10px] text-muted-foreground">Based on:</span>
                                {topWard && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                        style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                                        Live AQI: {topWard.ward_name} ({topWard.aqi})
                                    </span>
                                )}
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
                                    WHO Guidelines
                                </span>
                                {(stream.cityStats?.avg_aqi ?? 0) > 200 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                        style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c" }}>
                                        Govt Rule: GRAP Stage III
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ═══════════════════════════════════════════════
                6️⃣  DOCUMENT STORE — Collapsible Panel
               ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "rgba(148,163,184,0.12)" }}
            >
                {/* Toggle Header */}
                <button
                    onClick={() => setDocStoreOpen(!docStoreOpen)}
                    className="w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-muted/30 transition-colors"
                >
                    {docStoreOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <BookOpen className="w-4 h-4" style={{ color: "#a78bfa" }} />
                    <span className="text-sm font-semibold text-foreground">📚 Knowledge Base</span>
                    <span className="text-[10px] text-muted-foreground ml-1">Pathway Document Store</span>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence>
                    {docStoreOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 pb-5">
                                {/* Tabs */}
                                <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: "rgba(100,116,139,0.06)" }}>
                                    <button
                                        onClick={() => setDocTab("who")}
                                        className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${docTab === "who" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        WHO Guidelines
                                    </button>
                                    <button
                                        onClick={() => setDocTab("govt")}
                                        className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-all ${docTab === "govt" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Govt Rules
                                    </button>
                                </div>

                                {/* WHO Tab */}
                                {docTab === "who" && (
                                    <div className="space-y-1.5">
                                        {[
                                            { range: "0–50", label: "Good", color: "#34d399", desc: "Air quality is satisfactory. No risk." },
                                            { range: "51–100", label: "Satisfactory", color: "#facc15", desc: "Minor discomfort for sensitive people." },
                                            { range: "101–200", label: "Moderate", color: "#fb923c", desc: "Breathing discomfort for sensitive groups." },
                                            { range: "201–300", label: "Poor", color: "#f87171", desc: "Breathing discomfort for most people." },
                                            { range: "301–400", label: "Very Poor", color: "#ef4444", desc: "Respiratory illness on prolonged exposure." },
                                            { range: "401–500", label: "Severe", color: "#a855f7", desc: "Serious health impacts even on healthy people." },
                                        ].map(g => (
                                            <div key={g.label} className="flex items-center gap-3 py-2 px-3 rounded-lg"
                                                style={{ background: "rgba(100,116,139,0.04)" }}>
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                                                <span className="text-xs font-semibold w-20" style={{ color: g.color }}>{g.label}</span>
                                                <span className="text-xs text-muted-foreground font-mono w-16">{g.range}</span>
                                                <span className="text-xs text-muted-foreground flex-1">{g.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Govt Rules Tab */}
                                {docTab === "govt" && (
                                    <div className="space-y-2">
                                        {[
                                            { icon: "🏭", rule: "Industries must halt operations when AQI > 300", tag: "GRAP Stage III", tagColor: "#f87171" },
                                            { icon: "🚧", rule: "Construction banned when AQI > 200 in Delhi NCR", tag: "NCR Policy", tagColor: "#fb923c" },
                                            { icon: "🚗", rule: "Odd-even vehicle scheme activated when AQI > 400", tag: "Transport", tagColor: "#fbbf24" },
                                            { icon: "🏫", rule: "Schools & colleges close when AQI > 350", tag: "Education", tagColor: "#fb923c" },
                                            { icon: "🚨", rule: "Emergency health advisory issued when AQI > 400", tag: "Health", tagColor: "#ef4444" },
                                        ].map(r => (
                                            <div key={r.rule} className="flex items-start gap-3 py-2 px-3 rounded-lg"
                                                style={{ background: "rgba(100,116,139,0.04)" }}>
                                                <span className="text-base">{r.icon}</span>
                                                <p className="text-xs text-foreground flex-1">{r.rule}</p>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                                    style={{ background: `${r.tagColor}15`, color: r.tagColor }}>
                                                    {r.tag}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
