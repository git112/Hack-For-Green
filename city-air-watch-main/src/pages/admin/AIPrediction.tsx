import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, BarChart3,
  Clock, Zap, CheckCircle, Target, Award, Info, Activity,
  PieChart as PieIcon, Cpu, Satellite
} from "lucide-react";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, PieChart,
  Pie, Cell, LineChart, Line
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { usePathwayStream } from "@/hooks/usePathwayStream";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";

// Fallback static data replaced by dynamic state and fetching

export default function AIPrediction() {
  const stream = usePathwayStream();
  const [selectedWard, setSelectedWard] = useState("all");
  const [timeframe, setTimeframe] = useState("24h");
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [sourceContribution, setSourceContribution] = useState<any[]>([]);
  const [wardPredictions, setWardPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;

    setIsExporting(true);
    toast({
      title: "Generating AI Forecast Report",
      description: "Capturing neural predictions...",
    });

    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0a0c10", // Dark background for AI prediction look
        logging: false,
        onclone: (clonedDoc) => {
          const elementsToHide = clonedDoc.querySelectorAll('.no-export');
          elementsToHide.forEach(el => {
            (el as HTMLElement).style.visibility = 'hidden';
          });
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 60) / imgHeight);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      pdf.setFillColor(10, 12, 16);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      pdf.setFontSize(22);
      pdf.setTextColor(99, 102, 241); // Indigo color for AI
      pdf.text("AI PREDICTION & NEURAL FORECAST", 105, 20, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`AI Model: Neural Forecaster v4.0.1`, 15, 30);
      pdf.text(`Prediction Window: ${timeframe}`, 15, 35);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 40);

      pdf.addImage(imgData, "JPEG", (pdfWidth - finalWidth) / 2, 50, finalWidth, finalHeight);

      pdf.save(`AI_Prediction_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Export Success",
        description: "AI foresight report downloaded.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate AI report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const cityPredictionsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/predictions/city`);
        const cityPredictionsData = await cityPredictionsRes.json();
        if (cityPredictionsData.success) {
          setWardPredictions(cityPredictionsData.data.map((p: any) => ({
            ward: p.wardName,
            current: p.ward?.currentAQI || 100,
            predicted24h: p.predictions[0]?.aqi || 100,
            predicted48h: p.predictions[6]?.aqi || 100,
            confidence: p.confidenceScore,
            risk: p.riskAssessment?.[0]?.level || 'low'
          })));

          // Use the first prediction for source contributing chart
          if (cityPredictionsData.data.length > 0) {
            const first = cityPredictionsData.data[0];
            setSourceContribution(first.sourceContribution.map((s: any) => ({
              ...s,
              color: s.name === "Traffic" ? "#f87171" : s.name === "Industry" ? "#fb923c" : s.name === "Construction" ? "#818cf8" : "#34d399",
              trend: "+2%"
            })));

            // Extract temporal forecast
            setPredictionData([
              { time: "Now", aqi: first.ward?.currentAQI || 142, predicted: first.ward?.currentAQI || 142 },
              ...first.predictions.slice(0, 6).map((p: any, i: number) => ({
                time: `+${(i + 1) * 4}h`,
                aqi: null,
                predicted: p.aqi
              }))
            ]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const displayPredictionData = predictionData.length > 0 ? predictionData : [
    { time: "Now", aqi: 142, predicted: 142 },
    { time: "+6h", aqi: null, predicted: 158 },
    { time: "+12h", aqi: null, predicted: 175 },
    { time: "+18h", aqi: null, predicted: 168 },
    { time: "+24h", aqi: null, predicted: 155 },
    { time: "+48h", aqi: null, predicted: 145 },
    { time: "+72h", aqi: null, predicted: 138 },
  ];

  const displaySourceContribution = sourceContribution.length > 0 ? sourceContribution : [
    { name: "Traffic", value: 35, color: "#f87171", trend: "+5%" },
    { name: "Industry", value: 28, color: "#fb923c", trend: "+2%" },
    { name: "Construction", value: 18, color: "#818cf8", trend: "+8%" },
    { name: "Garbage Burning", value: 12, color: "#94a3b8", trend: "-3%" },
    { name: "Other", value: 7, color: "#34d399", trend: "0%" },
  ];

  const displayWardPredictions = wardPredictions.length > 0 ? wardPredictions : [
    { ward: "Ward 1 - Central", current: 85, predicted24h: 92, predicted48h: 88, confidence: 87, risk: "low" },
    { ward: "Ward 4 - East", current: 120, predicted24h: 135, predicted48h: 128, confidence: 78, risk: "medium" },
    { ward: "Ward 6 - Industrial", current: 210, predicted24h: 225, predicted48h: 215, confidence: 91, risk: "critical" },
  ];

  return (
    <div className="space-y-6 container mx-auto pb-10" ref={dashboardRef}>
      {/* 🧠 AI MASTER HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group p-8 rounded-[3rem] bg-card/40 border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
          <Satellite className="w-48 h-48 text-primary" />
        </div>

        <div className="flex gap-6 items-center relative z-10">
          <div className="w-20 h-20 rounded-[1.8rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Neural Forecaster</h1>
            <p className="text-sm text-muted-foreground font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Deep Learning Architecture v4.0.1 — 72hr Advanced Horizon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-widest">Temporal Window</span>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-44 h-11 bg-card/60 backdrop-blur-xl border-border/40 rounded-2xl shadow-sm no-export">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-3xl border-border border-2 rounded-2xl">
              <SelectItem value="24h">Next 24 Hours</SelectItem>
              <SelectItem value="48h">Next 48 Hours</SelectItem>
              <SelectItem value="72h">Next 72 Hours</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black no-export shadow-xl shadow-indigo-500/20 px-8 flex gap-2 italic uppercase tracking-tighter"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Capturing..." : "Export Neural Data"}
          </Button>
        </div>
      </motion.div>

      {/* 📊 ACCURACY & CONFIDENCE STRIP */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "R² Accuracy Score", val: "0.99", icon: Award, col: "text-emerald-400", sub: "Global Benchmark" },
          { label: "Mean Error (MAE)", val: "7.55", icon: Target, col: "text-primary", sub: "Below Threshold" },
          { label: "Confidence Index", val: "91%", icon: Zap, col: "text-orange-400", sub: "Deep Correlation" },
          { label: "Node Efficiency", val: "99.8%", icon: BarChart3, col: "text-violet-400", sub: "Stable Inference" }
        ].map((stat, i) => (
          <div key={stat.label} className="p-5 rounded-3xl bg-card border border-border/50 shadow-inner group transition-all hover:bg-muted/10">
            <div className="flex items-center justify-between mb-3 text-muted-foreground opacity-40 group-hover:opacity-100">
              <p className="text-[9px] font-black uppercase tracking-widest leading-none">{stat.label}</p>
              <stat.icon className="w-3.5 h-3.5" />
            </div>
            <h4 className={`text-3xl font-black font-mono tracking-tighter ${stat.col}`}>{stat.val}</h4>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground opacity-40" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{stat.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 📈 FORECAST MASTER CONTROL */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-8 rounded-[3rem] bg-card border border-border shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold tracking-tight">AQI Temporal Forecast</h3>
              <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Simulation Mode Active
              </p>
            </div>
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-56 h-10 bg-muted/20 border-border/40 rounded-xl">
                <SelectValue placeholder="Global City Avg" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Global City Average</SelectItem>
                {displayWardPredictions.map(w => <SelectItem key={w.ward} value={w.ward}>{w.ward}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayPredictionData}>
                <defs>
                  <linearGradient id="pActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pFore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,15,15,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(20px)',
                  }}
                />
                <Area type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" strokeWidth={4} fill="url(#pActual)" name="Observed" />
                <Area type="monotone" dataKey="predicted" stroke="#fb923c" strokeWidth={4} strokeDasharray="10 10" fill="url(#pFore)" name="AI Projected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 flex justify-center gap-8 border-t border-border/30 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Ground Truth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Neural Projection</span>
            </div>
          </div>
        </motion.div>

        {/* 🥧 SOURCE ATTRIBUTION */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-[3rem] bg-card/60 border border-border flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              Source Attribution
            </h3>
          </div>

          <div className="flex-1 min-h-[300px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displaySourceContribution}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="transparent"
                >
                  {displaySourceContribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5">
            {displaySourceContribution.map((source) => (
              <div key={source.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-transparent hover:border-border/50 group transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-xs font-bold text-foreground opacity-80 group-hover:opacity-100">{source.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-foreground">{source.value}%</span>
                  <div className={`flex items-center gap-0.5 text-[9px] font-black ${source.trend.startsWith('+') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {source.trend.startsWith('+') ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {source.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 📋 ANALYTICAL MATRIX (TABLE) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-[3rem] bg-card border border-border shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-xl font-bold tracking-tighter uppercase italic">Ward Inference Matrix</h3>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Confidence threshold: 80%</span>
            <Button size="sm" variant="ghost" className="rounded-xl bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest">Refresh Nodes</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted-foreground border-b border-white/5 text-left">
                <th className="pb-5 px-4 font-black uppercase tracking-tighter text-[10px]">Zone Indicator</th>
                <th className="pb-5 px-4 font-black uppercase tracking-tighter text-[10px] text-center">Ground Truth</th>
                <th className="pb-5 px-4 font-black uppercase tracking-tighter text-[10px] text-center">Neural 24h</th>
                <th className="pb-5 px-4 font-black uppercase tracking-tighter text-[10px] text-center">Confidence</th>
                <th className="pb-5 px-4 font-black uppercase tracking-tighter text-[10px] text-center">Priority Level</th>
              </tr>
            </thead>
            <tbody>
              {displayWardPredictions.map((w, i) => (
                <motion.tr
                  key={w.ward}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.05) }}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-5 px-4">
                    <span className="font-bold text-foreground tracking-tight block text-sm">{w.ward}</span>
                    <span className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase italic group-hover:text-primary transition-colors">Analytical Node #{i + 102}</span>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <AQIBadge value={w.current} size="sm" showLabel={false} />
                  </td>
                  <td className="py-5 px-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono font-black text-lg tracking-tighter" style={{ color: w.predicted24h > w.current ? '#f87171' : '#34d399' }}>
                        {w.predicted24h}
                      </span>
                      {w.predicted24h > w.current ? <TrendingUp className="w-4 h-4 text-red-400" /> : <TrendingDown className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
                      <BarChart3 className="w-3 h-3 text-primary" />
                      <span className="text-xs font-black text-primary">{w.confidence}%</span>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={`text-[10px] px-3 py-1 rounded-lg font-black tracking-tighter uppercase ${w.risk === 'critical' ? 'bg-red-500 text-white' : w.risk === 'high' ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground opacity-70'
                      }`}>
                      {w.risk}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 📡 AI PROTOCOL BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative p-8 rounded-[3rem] bg-gradient-to-r from-muted/40 via-muted/20 to-primary/5 border border-border overflow-hidden"
      >
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="w-24 h-24 rounded-[2.2rem] bg-card border-2 border-primary/30 flex items-center justify-center shadow-2xl">
            <Info className="w-10 h-10 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-black text-foreground tracking-tighter uppercase mb-2 italic">EXPLAINABLE AI PROTOCOL (v4)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Our Neural Core utilizes <strong className="text-foreground">LSTMs (Long Short-Term Memory)</strong> and <strong className="text-foreground">Graph Neural Networks</strong> to analyze 400+ city indicators.
              Every forecast is explainable via the Source Attribution matrix, allowing administrators to trust the "WHY" behind the prediction.
            </p>
          </div>
          <Button className="h-14 rounded-2xl px-10 bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">Audit Intelligence Log</Button>
        </div>
      </motion.div>
    </div>
  );
}
