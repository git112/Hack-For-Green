import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, FileText, MapPin, TrendingUp, Users, Zap,
  Brain, Clock, CheckCircle, XCircle, Radio, Activity,
  LayoutDashboard, ShieldAlert, Cpu
} from "lucide-react";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { PollutionMap } from "@/components/maps/PollutionMap";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePathwayStream } from "@/hooks/usePathwayStream";

/* ─── Static complaints data ─────────────────────────── */
const activeComplaints = [
  { id: 1, ward: "Ward 6 - Industrial", type: "Garbage Burning", time: "2h ago", assigned: "Crew A", deadline: "4h", status: "in_progress" },
  { id: 2, ward: "Ward 3 - Traffic Hub", type: "Vehicle Emission", time: "3h ago", assigned: "Crew B", deadline: "5h", status: "in_progress" },
  { id: 3, ward: "Ward 8 - Market Area", type: "Construction Dust", time: "1h ago", assigned: "Unassigned", deadline: "7h", status: "new" },
];

export default function AdminDashboard() {
  const [selectedWard, setSelectedWard] = useState<string>("");
  const stream = usePathwayStream();
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const handleWardSelect = (event: CustomEvent) => setSelectedWard(event.detail.ward);
    const storedWard = localStorage.getItem('selectedWard');
    if (storedWard) setSelectedWard(storedWard);
    window.addEventListener('wardSelected', handleWardSelect as EventListener);
    return () => window.removeEventListener('wardSelected', handleWardSelect as EventListener);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTicker(t => (t + 1) % 100), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleZoneClick = (ward: string) => {
    setSelectedWard(ward);
    localStorage.setItem('selectedWard', ward);
  };

  const isLive = stream.connected;
  const cityAvg = stream.cityStats?.avg_aqi ?? 0;

  // ── Derived Color Config ──────────────────────────
  const getRiskCol = (aqi: number) => {
    if (aqi <= 50) return { text: "#34d399", glow: "0 0 20px rgba(16,185,129,0.15)", bg: "rgba(16,185,129,0.05)" };
    if (aqi <= 100) return { text: "#facc15", glow: "0 0 20px rgba(250,204,21,0.15)", bg: "rgba(250,204,21,0.05)" };
    if (aqi <= 200) return { text: "#fb923c", glow: "0 0 20px rgba(251,146,60,0.15)", bg: "rgba(251,146,60,0.05)" };
    return { text: "#f87171", glow: "0 0 20px rgba(248,113,113,0.15)", bg: "rgba(248,113,113,0.05)" };
  };

  const cityColor = getRiskCol(cityAvg);

  const dynamicCritical = stream.wardsList
    .filter(w => w.aqi > 130)
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 4);

  const stats = [
    { label: "City Avg AQI", value: cityAvg || "—", icon: TrendingUp, color: cityColor.text, glow: cityColor.glow, bg: cityColor.bg },
    { label: "Critical Wards", value: stream.cityStats?.critical_wards ?? "—", icon: ShieldAlert, color: "#f87171", glow: "0 0 20px rgba(248,113,113,0.1)", bg: "rgba(248,113,113,0.05)" },
    { label: "Pathway Engine", value: isLive ? "LIVE" : "SYNC", icon: Cpu, color: "#818cf8", glow: "0 0 20px rgba(129,140,248,0.1)", bg: "rgba(129,140,248,0.05)" },
    { label: "Active Alerts", value: stream.activeAlerts.length, icon: Radio, color: "#fb923c", glow: "0 0 20px rgba(251,146,60,0.1)", bg: "rgba(251,146,60,0.05)" },
  ];

  return (
    <div className="space-y-5 p-1">
      {/* 🏙️ TOP NAV / STATUS BAR */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Command Center</h1>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70">Control & Enforcement</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-tight">Stream Active</span>
            </div>
          )}
          <Link to="/admin/stream">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-2 rounded-xl">
              <Radio className="w-3.5 h-3.5" />
              Raw Stream
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* 📊 CORE KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            className="group relative rounded-2xl border p-4 overflow-hidden transition-all"
            style={{ background: stat.bg, borderColor: `${stat.color}22`, boxShadow: stat.glow }}
          >
            <div className="flex items-center justify-between transition-transform">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">{stat.label}</p>
              <stat.icon className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-black mt-1 font-mono tracking-tighter" style={{ color: stat.color }}>{stat.value}</p>
            {stat.label === "City Avg AQI" && cityAvg > 0 && (
              <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (cityAvg / 300) * 100)}%` }}
                  className="h-full"
                  style={{ background: stat.color }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* 🗺️ SPATIAL CONTROL (MAP) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-3xl border border-border p-5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Deployment & Coverage
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
              </span>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border/50 bg-muted/20">
            <PollutionMap onZoneClick={handleZoneClick} selectedWard={selectedWard} />
          </div>
        </motion.div>

        {/* 🚨 CRITICAL SECTOR LIST */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-3xl border border-border p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-bold flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-4 h-4" />
              Sectors at Risk
            </h3>
            <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">LIVE FEED</span>
          </div>

          <div className="space-y-3 flex-1">
            {dynamicCritical.length > 0 ? (
              dynamicCritical.map((ward, i) => (
                <motion.div
                  key={ward.ward_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${selectedWard === ward.ward_name ? "bg-red-500/10 border-red-500/30" : "bg-muted/30 border-transparent hover:border-border"
                    }`}
                  onClick={() => handleZoneClick(ward.ward_name)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 rounded-full" style={{ background: getRiskCol(ward.aqi).text }} />
                    <div>
                      <p className="text-sm font-bold text-foreground truncate w-32">{ward.ward_name}</p>
                      <p className="text-[10px] text-muted-foreground">{ward.ward_type || "Sector"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black font-mono tracking-tighter" style={{ color: getRiskCol(ward.aqi).text }}>{ward.aqi}</p>
                    {ward.spike && <p className="text-[8px] font-bold text-red-500 animate-pulse mt-[-4px]">SPIKE</p>}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-2">
                <Activity className="w-8 h-8 animate-pulse" />
                <p className="text-xs">Connecting to Pathway...</p>
              </div>
            )}
          </div>

          <Link to="/map" className="mt-4">
            <Button variant="ghost" className="w-full text-xs h-10 rounded-xl bg-muted/40 hover:bg-muted/60">
              View Analytics Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* 📋 ENFORCEMENT & TASKS GRID */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* ENFORCEMENT TABLE */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl border border-border p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Automated Response Table
            </h3>
            <Link to="/admin/prediction">
              <span className="text-[10px] font-bold text-primary hover:underline cursor-pointer">PREDICTION ENGINE →</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-muted-foreground border-b border-border/50 text-left">
                  <th className="pb-3 font-semibold uppercase tracking-widest text-[10px]">Ward / Sector</th>
                  <th className="pb-3 font-semibold text-center uppercase tracking-widest text-[10px]">AQI</th>
                  <th className="pb-3 font-semibold text-center uppercase tracking-widest text-[10px]">Trend</th>
                  <th className="pb-3 font-semibold text-right uppercase tracking-widest text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {stream.wardsList.slice(0, 5).map((w, i) => {
                  const rc = getRiskCol(w.aqi);
                  return (
                    <motion.tr
                      key={w.ward_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + (i * 0.05) }}
                      className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors group"
                    >
                      <td className="py-4">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{w.ward_name}</span>
                        <p className="text-[10px] text-muted-foreground">Updated {stream.lastUpdate ? new Date(stream.lastUpdate).toLocaleTimeString() : 'now'}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className="font-mono font-black" style={{ color: rc.text }}>{w.aqi}</span>
                      </td>
                      <td className="py-4 text-center">
                        {w.spike ? (
                          <div className="flex items-center justify-center gap-1 text-red-500">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black tracking-tighter">SPIKE</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-emerald-500">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold">STABLE</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold rounded-lg border border-border/40 hover:border-primary/40">
                          Deploy Crew
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ACTIVE COMPLAINTS FEED */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-3xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold flex items-center gap-2 text-warning">
              <FileText className="w-4 h-4" />
              Citizen Reports (Enforcement)
            </h3>
            <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest opacity-60">Archive</Button>
          </div>
          <div className="space-y-4">
            {activeComplaints.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className="group flex gap-4 p-4 rounded-2xl bg-muted/20 border border-transparent hover:border-border transition-all cursor-pointer relative"
              >
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm text-foreground">{c.type}</p>
                      <div className="flex items-center gap-2 mt-1 opacity-60">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-medium">{c.ward}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-medium">{c.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${c.status === "new" ? "bg-red-500 text-white" : "bg-warning/20 text-warning"
                        }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono font-bold">ETA: {c.deadline}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 🧠 INTELLIGENT ALERT BANNER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 rounded-3xl border border-primary/20 p-6 relative overflow-hidden group shadow-2xl shadow-primary/5"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
          <Brain className="w-24 h-24 text-primary" />
        </div>
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
            <Brain className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-black text-foreground tracking-tighter uppercase">Predictive Decision Intelligence</h3>
              <div className="h-1 lg:flex-1 bg-primary/20 rounded-full mx-4" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
              Pathway engine is projecting a **34% spike** in industry sectors within the next **4 hours**.
              Cross-referencing citizen reports confirms localized biomass burning in Ward 6.
              Recommendation: **Redirect active Crew A to Sector 6 industrial perimeter.**
            </p>
            <div className="flex gap-4 mt-5">
              <Button className="rounded-xl px-6 font-bold shadow-lg shadow-primary/25">Deploy Response</Button>
              <Button variant="outline" className="rounded-xl px-6 font-bold bg-transparent border-primary/30 text-primary">View Simulation</Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
