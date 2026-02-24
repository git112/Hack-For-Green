import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Clock, Zap, CheckCircle, Target, Award } from "lucide-react";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useState } from "react";

const predictionData = [
  { time: "Now", aqi: 142, predicted: 142 },
  { time: "+6h", aqi: null, predicted: 158 },
  { time: "+12h", aqi: null, predicted: 175 },
  { time: "+18h", aqi: null, predicted: 168 },
  { time: "+24h", aqi: null, predicted: 155 },
  { time: "+48h", aqi: null, predicted: 145 },
  { time: "+72h", aqi: null, predicted: 138 },
];

const sourceContribution = [
  { name: "Traffic", value: 35, color: "hsl(var(--destructive))", trend: "+5%" },
  { name: "Industry", value: 28, color: "hsl(var(--warning))", trend: "+2%" },
  { name: "Construction", value: 18, color: "hsl(var(--primary))", trend: "+8%" },
  { name: "Garbage Burning", value: 12, color: "hsl(var(--muted-foreground))", trend: "-3%" },
  { name: "Other", value: 7, color: "hsl(var(--success))", trend: "0%" },
];

const wardPredictions = [
  { ward: "Ward 1 - Central", current: 85, predicted24h: 92, predicted48h: 88, confidence: 87, risk: "low" },
  { ward: "Ward 2 - North", current: 45, predicted24h: 48, predicted48h: 45, confidence: 92, risk: "low" },
  { ward: "Ward 3 - Traffic Hub", current: 156, predicted24h: 175, predicted48h: 168, confidence: 85, risk: "high" },
  { ward: "Ward 4 - East", current: 120, predicted24h: 135, predicted48h: 128, confidence: 78, risk: "medium" },
  { ward: "Ward 5 - West", current: 98, predicted24h: 105, predicted48h: 102, confidence: 81, risk: "low" },
  { ward: "Ward 6 - Industrial", current: 210, predicted24h: 225, predicted48h: 215, confidence: 91, risk: "critical" },
];

// Model Accuracy Data
const modelMetrics = {
  mae: 7.55,
  rmse: 12.46,
  r2: 1.00,
};

const samplePredictions = [
  { actual: 42.46, predicted: 41.05, difference: -1.41 },
  { actual: 44.84, predicted: 44.49, difference: -0.35 },
  { actual: 46.74, predicted: 47.61, difference: 0.87 },
  { actual: 52.88, predicted: 50.95, difference: -1.93 },
  { actual: 62.85, predicted: 64.60, difference: 1.75 },
  { actual: 58.32, predicted: 57.12, difference: -1.20 },
  { actual: 55.67, predicted: 56.89, difference: 1.22 },
  { actual: 49.23, predicted: 48.45, difference: -0.78 },
];

const accuracyChartData = samplePredictions.map((item, index) => ({
  index: `Sample ${index + 1}`,
  actual: item.actual,
  predicted: item.predicted,
}));

export default function AIPrediction() {
  const [selectedWard, setSelectedWard] = useState("all");
  const [timeframe, setTimeframe] = useState("24h");

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
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              AI Prediction & Source Analysis
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Smart predictions with explainable AI - Know WHY AQI changes
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-36 bg-card">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="48h">48 Hours</SelectItem>
              <SelectItem value="72h">72 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Model Accuracy Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-success/10 rounded-2xl border-2 border-primary/20 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Model Accuracy Summary</h2>
            <p className="text-sm text-muted-foreground mt-1">PM2.5 Prediction Model Performance</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* MAE */}
          <div className="bg-card/80 rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Mean Absolute Error</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{modelMetrics.mae}</p>
            <p className="text-xs text-muted-foreground mt-1">Lower is better</p>
          </div>

          {/* RMSE */}
          <div className="bg-card/80 rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Root Mean Squared Error</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{modelMetrics.rmse}</p>
            <p className="text-xs text-muted-foreground mt-1">Lower is better</p>
          </div>

          {/* R2 Score */}
          <div className="bg-card/80 rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">R² Score</span>
            </div>
            <p className="text-2xl font-bold text-success">{modelMetrics.r2.toFixed(2)}</p>
            <p className="text-xs text-success mt-1">Perfect score! (1.00 = 100%)</p>
          </div>

          {/* Accuracy Note */}
          <div className="bg-success/10 rounded-xl border border-success/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">Model Status</span>
            </div>
            <p className="text-lg font-bold text-success">Excellent</p>
            <p className="text-xs text-muted-foreground mt-1">High predictive capability</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sample Predictions Comparison Chart */}
          <div className="bg-card/80 rounded-xl border border-border p-4">
            <h3 className="font-display font-semibold text-foreground mb-4">Actual vs Predicted PM2.5 Values</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="index" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    name="Actual PM2.5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--success))', r: 4 }}
                    name="Predicted PM2.5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              The R² score of 1.00 indicates the model explains nearly all variance in PM2.5 values
            </p>
          </div>

          {/* Sample Predictions Table */}
          <div className="bg-card/80 rounded-xl border border-border p-4">
            <h3 className="font-display font-semibold text-foreground mb-4">Sample Predictions Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Sample</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Actual</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Predicted</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {samplePredictions.map((item, index) => {
                    const diff = item.difference;
                    const diffColor = Math.abs(diff) < 2 ? "text-success" : Math.abs(diff) < 4 ? "text-warning" : "text-destructive";
                    return (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2 px-2 text-foreground font-medium">#{index + 1}</td>
                        <td className="py-2 px-2 text-right text-foreground">{item.actual.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right text-foreground">{item.predicted.toFixed(2)}</td>
                        <td className={`py-2 px-2 text-right font-medium ${diffColor}`}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Interpretation:</strong> The low MAE (7.55) and RMSE (12.46) 
                combined with perfect R² score (1.00) indicate our model has very strong predictive capability 
                for forecasting air pollution levels.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-2xl border border-warning/20 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display font-semibold text-foreground">AI Prediction Alert</h3>
              <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                High Confidence (91%)
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              AQI in <strong className="text-foreground">Ward 3 - Traffic Hub</strong> is predicted to rise to{" "}
              <strong className="text-destructive">175+</strong> in the next 24 hours due to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Expected increase in traffic (35% contribution, +5% trend)</li>
              <li>• Ongoing construction activity (18% contribution, +8% trend)</li>
              <li>• Low wind speed forecast (3-5 km/h)</li>
            </ul>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                window.location.href = "/admin/simulation";
              }}
            >
              <Zap className="w-4 h-4" />
              Take Preventive Action
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prediction Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">AQI Forecast</h3>
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Select Ward" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                <SelectItem value="all">All Wards (City Avg)</SelectItem>
                {wardPredictions.map((w) => (
                  <SelectItem key={w.ward} value={w.ward}>{w.ward}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                  strokeWidth={2}
                  name="Actual AQI"
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="hsl(var(--warning))" 
                  fillOpacity={1} 
                  fill="url(#colorPredicted)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted AQI"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning border-2 border-dashed border-warning" />
              <span>Predicted</span>
            </div>
          </div>
        </motion.div>

        {/* Source Contribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Pollution Source Contribution</h3>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceContribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceContribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {sourceContribution.map((source) => (
              <div key={source.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-sm font-medium text-foreground">{source.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{source.value}%</span>
                  {source.trend.startsWith("+") ? (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <TrendingUp className="w-3 h-3" />
                      <span>{source.trend}</span>
                    </div>
                  ) : source.trend.startsWith("-") ? (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <TrendingDown className="w-3 h-3" />
                      <span>{source.trend}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">{source.trend}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Ward Predictions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">Ward-Wise Predictions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ward</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Current AQI</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">24h Forecast</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">48h Forecast</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Confidence</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {wardPredictions.map((ward) => (
                <tr key={ward.ward} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">{ward.ward}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <AQIBadge value={ward.current} size="sm" showLabel={false} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <AQIBadge value={ward.predicted24h} size="sm" showLabel={false} />
                      {ward.predicted24h > ward.current ? (
                        <TrendingUp className="w-4 h-4 text-destructive" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <AQIBadge value={ward.predicted48h} size="sm" showLabel={false} />
                      {ward.predicted48h > ward.current ? (
                        <TrendingUp className="w-4 h-4 text-destructive" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{ward.confidence}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        ward.risk === "critical"
                          ? "bg-destructive text-destructive-foreground"
                          : ward.risk === "high"
                          ? "bg-warning text-warning-foreground"
                          : ward.risk === "medium"
                          ? "bg-primary/20 text-primary"
                          : "bg-success/20 text-success"
                      }`}
                    >
                      {ward.risk.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* AI Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-2">AI Explanation</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Our AI model analyzes multiple factors to predict AQI changes:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Historical AQI patterns and seasonal trends</li>
              <li>• Real-time weather data (wind speed, temperature, humidity)</li>
              <li>• Traffic patterns and construction schedules</li>
              <li>• Industrial activity and emission reports</li>
              <li>• Citizen-reported incidents and their verification status</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              <strong className="text-foreground">Confidence Score:</strong> Indicates how reliable the prediction is based on data quality and historical accuracy.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

