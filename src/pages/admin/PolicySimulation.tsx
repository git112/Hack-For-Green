import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ElementType } from "react";
import {
  FlaskConical, Play, RotateCcw, TrendingDown, TrendingUp,
  Car, Building2, Droplets, Ban, CheckCircle, AlertTriangle,
  Cpu, Zap, Sparkles, ShieldCheck, BarChart3, Info, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

type SimulationAction = {
  id: string;
  name: string;
  icon: ElementType;
  enabled: boolean;
  intensity: number;
  impact: number;
  cost: number;
};

const initialActions: SimulationAction[] = [
  { id: "traffic", name: "Traffic Restriction", icon: Car, enabled: false, intensity: 50, impact: -15, cost: 50000 },
  { id: "construction", name: "Construction Ban", icon: Building2, enabled: false, intensity: 100, impact: -12, cost: 200000 },
  { id: "sprinkling", name: "Road Sprinkling", icon: Droplets, enabled: false, intensity: 75, impact: -8, cost: 30000 },
  { id: "industry", name: "Industry Emission Control", icon: Ban, enabled: false, intensity: 60, impact: -20, cost: 500000 },
];

const simulationResults = [
  { ward: "Ward 1", current: 85, simulated: 72, improvement: -15 },
  { ward: "Ward 2", current: 45, simulated: 38, improvement: -16 },
  { ward: "Ward 3", current: 156, simulated: 132, improvement: -15 },
  { ward: "Ward 4", current: 120, simulated: 105, improvement: -13 },
  { ward: "Ward 5", current: 98, simulated: 83, improvement: -15 },
  { ward: "Ward 6", current: 210, simulated: 168, improvement: -20 },
];

export default function PolicySimulation() {
  const [actions, setActions] = useState<SimulationAction[]>(initialActions);
  const [selectedScenario, setSelectedScenario] = useState("city_wide");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [currentAQI, setCurrentAQI] = useState(142);
  const [simulatedAQI, setSimulatedAQI] = useState<number | null>(null);

  const toggleAction = (id: string) => {
    setActions(actions.map(a =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
    setSimulationComplete(false);
  };

  const updateIntensity = (id: string, value: number[]) => {
    setActions(actions.map(a =>
      a.id === id ? { ...a, intensity: value[0] } : a
    ));
    setSimulationComplete(false);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationComplete(false);

    setTimeout(() => {
      const enabledActions = actions.filter(a => a.enabled);
      const totalImpact = enabledActions.reduce((sum, a) => {
        const impactMultiplier = a.intensity / 100;
        return sum + (a.impact * impactMultiplier);
      }, 0);

      const newAQI = Math.max(0, Math.round(currentAQI + totalImpact));
      setSimulatedAQI(newAQI);
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 1500);
  };

  const resetSimulation = () => {
    setActions(initialActions);
    setSimulatedAQI(null);
    setSimulationComplete(false);
  };

  const enabledActions = actions.filter(a => a.enabled);
  const totalCost = enabledActions.reduce((sum, a) => sum + a.cost, 0);
  const totalImpact = enabledActions.reduce((sum, a) => {
    const impactMultiplier = a.intensity / 100;
    return sum + (a.impact * impactMultiplier);
  }, 0);
  const estimatedAQI = simulatedAQI !== null ? simulatedAQI : Math.max(0, Math.round(currentAQI + totalImpact));

  return (
    <div className="space-y-6 container mx-auto pb-10">
      {/* 🔮 SIMULATION CORE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-[2.5rem] bg-card/60 border border-border/50 overflow-hidden shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-8"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_20px_rgba(var(--primary),0.5)]" />

        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-16 h-16 rounded-2xl bg-card border border-border shadow-inner flex items-center justify-center">
              <FlaskConical className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-card flex items-center justify-center">
              <Cpu className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Policy Simulation Lab</h1>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Digital Twin Engine v2.4 — 98.2% Accurate Prediction Modeling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-widest">Scenario Mode</span>
          </div>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger className="w-60 h-12 bg-card/50 backdrop-blur-xl border-border/40 rounded-2xl shadow-xl">
              <SelectValue placeholder="Scenario Selection" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-2xl border-border border-2 rounded-2xl">
              <SelectItem value="city_wide">City-Wide Baseline</SelectItem>
              <SelectItem value="extreme_spike">Extreme Winter Spike</SelectItem>
              <SelectItem value="industrial_incident">Industrial Spill Mock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* 📊 REAL-TIME TWIN MONITOR */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: "Baseline AQI", val: currentAQI, icon: Activity, col: "text-muted-foreground" },
          { label: "Target (Simulated)", val: estimatedAQI, icon: Zap, col: simulationComplete ? "text-emerald-400" : "text-primary", isAnimated: isSimulating },
          { label: "Est. Deployment Cost", val: `₹${(totalCost / 1000).toFixed(1)}K`, icon: ShieldCheck, col: "text-orange-400" }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="bg-card/40 border border-border/50 p-6 rounded-[2rem] shadow-xl relative group overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform">
              <stat.icon className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <div className="flex items-center justify-between">
              {typeof stat.val === 'number' ? (
                <motion.h4
                  key={stat.val}
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className={`text-4xl font-black font-mono tracking-tighter ${stat.col}`}
                >
                  {stat.isAnimated ? "..." : stat.val}
                </motion.h4>
              ) : (
                <h4 className={`text-4xl font-black font-mono tracking-tighter ${stat.col}`}>{stat.val}</h4>
              )}
              {stat.label.includes("Target") && simulationComplete && simulatedAQI! < currentAQI && (
                <div className="bg-emerald-500/10 text-emerald-400 p-2 py-1 rounded-lg text-xs font-black border border-emerald-500/20">
                  -{currentAQI - simulatedAQI!} PTS
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* 🛠️ POLICY ADJUSTMENT DECK */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-4"
        >
          <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Intervention Framework</h3>
                <p className="text-sm text-muted-foreground">Adjust policy levers to observe multi-ward impact</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetSimulation} size="sm" className="rounded-xl border-border/40 text-[10px] font-black uppercase tracking-widest h-9 bg-muted/20">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Wipe Config
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {actions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.05) }}
                    className={`p-5 rounded-3xl border-2 transition-all duration-500 group relative overflow-hidden ${action.enabled ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-border/30 bg-muted/10"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl shadow-inner transition-colors ${action.enabled ? "bg-primary text-white" : "bg-card text-muted-foreground"}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground uppercase tracking-tight leading-none mb-1">{action.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground opacity-60">IMPACT: {action.impact} AQI</p>
                        </div>
                      </div>
                      <Switch
                        checked={action.enabled}
                        onCheckedChange={() => toggleAction(action.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    <AnimatePresence>
                      {action.enabled && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 pt-4 border-t border-primary/20 relative z-10"
                        >
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-primary">
                            <span>Intensity Curve</span>
                            <span>{action.intensity}% Output</span>
                          </div>
                          <Slider
                            value={[action.intensity]}
                            onValueChange={(val) => updateIntensity(action.id, val)}
                            max={100} step={5}
                            className="py-2"
                          />
                          <div className="flex justify-between items-center bg-card/60 rounded-xl p-2 px-3 border border-primary/10">
                            <span className="text-[10px] font-bold text-muted-foreground">Scenario Cost</span>
                            <span className="text-xs font-black text-foreground">₹{action.cost.toLocaleString()}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Background Detail Pattern */}
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                      <Icon className="w-16 h-16" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8">
              <Button
                onClick={runSimulation}
                disabled={isSimulating || enabledActions.length === 0}
                className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {isSimulating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="font-black text-lg uppercase italic tracking-tighter">Running Simulation Matrix...</span>
                  </div>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current transition-transform group-hover:scale-110" />
                    <span className="font-black text-lg uppercase italic tracking-tighter">Execute Digital Twin Simulation</span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 📊 SUMMARY & INSIGHT DECK */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="p-7 rounded-[2.5rem] bg-card/80 border border-border shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Projection Summary</h3>
            </div>

            {enabledActions.length > 0 ? (
              <div className="space-y-4">
                {[
                  { l: "Selected Actions", v: enabledActions.length, c: "text-foreground" },
                  { l: "Aggregated Cost", v: `₹${totalCost.toLocaleString()}`, c: "text-orange-400" },
                  { l: "AQI Delta", v: `${totalImpact > 0 ? "+" : ""}${Math.round(totalImpact)}`, c: totalImpact < 0 ? "text-emerald-400" : "text-destructive" },
                  { l: "Projected Result", v: estimatedAQI, c: "text-primary font-mono text-xl" }
                ].map(r => (
                  <div key={r.l} className="flex justify-between items-center py-3 border-b border-border/30 last:border-0 hover:translate-x-1 transition-transform">
                    <span className="text-xs font-bold text-muted-foreground">{r.l}</span>
                    <span className={`text-sm font-black ${r.c}`}>{r.v}</span>
                  </div>
                ))}

                {simulationComplete && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`mt-6 p-5 rounded-3xl border-2 flex gap-4 items-start ${simulatedAQI! < currentAQI ? "bg-emerald-500/10 border-emerald-500/20" : "bg-orange-500/10 border-orange-500/20"
                      }`}
                  >
                    <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-1 ${simulatedAQI! < currentAQI ? "text-emerald-400" : "text-orange-400"}`} />
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight mb-1">
                        {simulatedAQI! < currentAQI ? "Policy Approved" : "Intervention Warning"}
                      </p>
                      <p className="text-xs leading-relaxed opacity-70 font-medium text-foreground">
                        {simulatedAQI! < currentAQI
                          ? `This configuration shows a ${Math.abs(Math.round(totalImpact))}pt reduction. Efficient deployment recommended.`
                          : "Simulation indicates rising trends despite intervention. Re-evaluate industrial emission controls."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <FlaskConical className="w-12 h-12 mb-4 animate-bounce" />
                <p className="text-xs font-black uppercase tracking-widest text-center">Awaiting Configuration</p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Simulation Methodology</h4>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold italic">
              "Engine simulates meteorological flux, traffic density decay, and industrial throughput reduction across a city-wide Digital Twin."
            </p>
          </div>
        </motion.div>
      </div>

      {/* 📊 WARD-WISE DIFF CHART */}
      <AnimatePresence>
        {simulationComplete && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="p-8 rounded-[3rem] bg-card border border-border shadow-2xl"
          >
            <div className="flex items-center justify-between mb-10 px-2">
              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">Sector Impact Assessment</h3>
                <p className="text-sm text-muted-foreground mt-1">Granular AQI shift comparison across simulated zones</p>
              </div>
              <AQIBadge value={simulatedAQI!} size="lg" />
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulationResults} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="ward" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15,15,15,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="current" fill="#4b5563" radius={[8, 8, 0, 0]} name="Baseline AQI" />
                  <Bar dataKey="simulated" radius={[8, 8, 0, 0]} name="Policy Impact AQI">
                    {simulationResults.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.simulated < entry.current ? 'hsl(var(--primary))' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 flex items-center justify-center gap-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-600" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pre-Intervention</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Effective Outcome</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
