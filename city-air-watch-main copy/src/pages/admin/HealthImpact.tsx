import { motion } from "framer-motion";
import { Heart, Baby, Users, Thermometer, AlertTriangle, TrendingUp, MapPin } from "lucide-react";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis } from "recharts";
import { useState } from "react";

const healthData = [
  { month: "Jan", aqi: 180, respiratoryCases: 245, childRisk: 85 },
  { month: "Feb", aqi: 165, respiratoryCases: 218, childRisk: 72 },
  { month: "Mar", aqi: 155, respiratoryCases: 198, childRisk: 68 },
  { month: "Apr", aqi: 148, respiratoryCases: 185, childRisk: 65 },
  { month: "May", aqi: 142, respiratoryCases: 172, childRisk: 62 },
  { month: "Jun", aqi: 135, respiratoryCases: 158, childRisk: 58 },
];

const wardHealthRisk = [
  { ward: "Ward 1 - Central", aqi: 85, respiratoryRisk: "Low", childRisk: "Moderate", elderlyRisk: "Low", heatwaveRisk: "Low" },
  { ward: "Ward 2 - North", aqi: 45, respiratoryRisk: "Very Low", childRisk: "Low", elderlyRisk: "Very Low", heatwaveRisk: "Low" },
  { ward: "Ward 3 - Traffic Hub", aqi: 156, respiratoryRisk: "High", childRisk: "High", elderlyRisk: "High", heatwaveRisk: "Moderate" },
  { ward: "Ward 4 - East", aqi: 120, respiratoryRisk: "Moderate", childRisk: "Moderate", elderlyRisk: "Moderate", heatwaveRisk: "Low" },
  { ward: "Ward 5 - West", aqi: 98, respiratoryRisk: "Moderate", childRisk: "Moderate", elderlyRisk: "Low", heatwaveRisk: "Low" },
  { ward: "Ward 6 - Industrial", aqi: 210, respiratoryRisk: "Critical", childRisk: "Critical", elderlyRisk: "Critical", heatwaveRisk: "High" },
];

const riskZones = [
  { lat: 28.6139, lng: 77.2090, aqi: 85, risk: "moderate", type: "residential" },
  { lat: 28.7041, lng: 77.1025, aqi: 45, risk: "low", type: "residential" },
  { lat: 28.5245, lng: 77.1855, aqi: 156, risk: "high", type: "traffic" },
  { lat: 28.6139, lng: 77.3156, aqi: 120, risk: "moderate", type: "residential" },
  { lat: 28.7041, lng: 77.3156, aqi: 210, risk: "critical", type: "industrial" },
];

const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case "very low":
    case "low":
      return "text-success";
    case "moderate":
      return "text-warning";
    case "high":
      return "text-destructive";
    case "critical":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
};

const getRiskBgColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case "very low":
    case "low":
      return "bg-success/10 border-success/20";
    case "moderate":
      return "bg-warning/10 border-warning/20";
    case "high":
      return "bg-destructive/10 border-destructive/20";
    case "critical":
      return "bg-destructive/20 border-destructive/40";
    default:
      return "bg-muted/50 border-border";
  }
};

export default function HealthImpact() {
  const [selectedWard, setSelectedWard] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Health & Climate Impact
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            AQI linked with health - Track respiratory cases, child & elderly risk zones
          </p>
        </div>
        <Select value={selectedWard} onValueChange={setSelectedWard}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue placeholder="Select Ward" />
          </SelectTrigger>
          <SelectContent className="bg-card border border-border">
            <SelectItem value="all">All Wards</SelectItem>
            {wardHealthRisk.map((w) => (
              <SelectItem key={w.ward} value={w.ward}>{w.ward}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Respiratory Cases</p>
              <p className="font-display text-2xl font-bold text-foreground">172</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-success text-sm">
            <TrendingUp className="w-4 h-4 rotate-180" />
            <span>-12% vs last month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Baby className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Child Risk Zones</p>
              <p className="font-display text-2xl font-bold text-foreground">2</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">High/Critical risk</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Elderly Risk Zones</p>
              <p className="font-display text-2xl font-bold text-foreground">2</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">High/Critical risk</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heatwave + AQI</p>
              <p className="font-display text-2xl font-bold text-foreground">1</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Overlap zones</p>
        </div>
      </motion.div>

      {/* Correlation Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">AQI vs Respiratory Cases Correlation</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthData}>
              <defs>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="aqi" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorAqi)" 
                strokeWidth={2}
                name="AQI"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="respiratoryCases" 
                stroke="hsl(var(--destructive))" 
                fillOpacity={1} 
                fill="url(#colorCases)" 
                strokeWidth={2}
                name="Respiratory Cases"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          <strong className="text-foreground">Correlation:</strong> Strong positive correlation (r=0.89) between AQI and respiratory cases. 
          As AQI increases, respiratory cases rise proportionally.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ward Health Risk Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Ward-Wise Health Risk Assessment</h3>
          <div className="space-y-3">
            {wardHealthRisk.map((ward) => (
              <div
                key={ward.ward}
                className={`p-4 rounded-xl border-2 ${getRiskBgColor(ward.respiratoryRisk)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{ward.ward}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <AQIBadge value={ward.aqi} size="sm" showLabel={false} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Respiratory</p>
                    <p className={`font-semibold ${getRiskColor(ward.respiratoryRisk)}`}>
                      {ward.respiratoryRisk}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Children</p>
                    <p className={`font-semibold ${getRiskColor(ward.childRisk)}`}>
                      {ward.childRisk}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Elderly</p>
                    <p className={`font-semibold ${getRiskColor(ward.elderlyRisk)}`}>
                      {ward.elderlyRisk}
                    </p>
                  </div>
                </div>
                {ward.heatwaveRisk !== "Low" && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-warning" />
                    <span className="text-xs text-muted-foreground">
                      Heatwave risk: <span className="font-semibold text-warning">{ward.heatwaveRisk}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Child Risk Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Baby className="w-5 h-5 text-warning" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Child Risk Zones</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="childRisk" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Child Risk Index" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Children are more vulnerable to air pollution. Risk index combines AQI levels with proximity to schools and playgrounds.
            </p>
          </div>

          {/* Alert Banner */}
          <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 rounded-2xl border border-destructive/20 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Critical Alert</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Ward 6 - Industrial</strong> and <strong className="text-foreground">Ward 3 - Traffic Hub</strong> 
                  {" "}show critical risk levels for children and elderly.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Consider school closures during peak pollution hours</li>
                  <li>• Deploy air purifiers in high-risk zones</li>
                  <li>• Issue health advisories to vulnerable populations</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Heatwave + AQI Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-warning" />
          </div>
          <h3 className="font-display font-semibold text-foreground">Heatwave + AQI Overlay Analysis</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {wardHealthRisk.filter(w => w.heatwaveRisk !== "Low").map((ward) => (
            <div
              key={ward.ward}
              className="p-4 rounded-xl bg-warning/10 border border-warning/20"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">{ward.ward}</p>
                <AQIBadge value={ward.aqi} size="sm" showLabel={false} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="w-4 h-4 text-warning" />
                <span className="text-muted-foreground">Heatwave Risk: </span>
                <span className="font-semibold text-warning">{ward.heatwaveRisk}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Combined heat and pollution increases health risks significantly
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          <strong className="text-foreground">Note:</strong> When heatwave conditions overlap with high AQI, 
          the health impact multiplies. Elderly and children are at highest risk in these zones.
        </p>
      </motion.div>
    </div>
  );
}

