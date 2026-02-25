import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PollutionMap } from "@/components/maps/PollutionMap";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, AlertTriangle, CheckCircle, Car, Building2, Factory, Home } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const hourlyData = [
  { hour: "00:00", aqi: 125 },
  { hour: "06:00", aqi: 135 },
  { hour: "12:00", aqi: 142 },
  { hour: "18:00", aqi: 158 },
  { hour: "24:00", aqi: 145 },
];

const wardCategories = [
  { name: "Ward 1 - Central", aqi: 85, category: "residential", type: "Residential", safe: true },
  { name: "Ward 2 - North", aqi: 45, category: "residential", type: "Residential", safe: true },
  { name: "Ward 3 - Traffic Hub", aqi: 156, category: "traffic", type: "Traffic Zone", safe: false },
  { name: "Ward 4 - East", aqi: 120, category: "residential", type: "Residential", safe: true },
  { name: "Ward 5 - West", aqi: 98, category: "construction", type: "Construction Zone", safe: false },
  { name: "Ward 6 - Industrial", aqi: 210, category: "industrial", type: "Industrial Area", safe: false },
];

const hotspots = [
  { name: "Industrial Area", aqi: 210, severity: "critical", lat: 28.7041, lng: 77.3156 },
  { name: "Traffic Hub", aqi: 156, severity: "high", lat: 28.5245, lng: 77.1855 },
  { name: "Construction Site", aqi: 145, severity: "moderate", lat: 28.6139, lng: 77.1025 },
];

export default function LiveMap() {
  const [timeView, setTimeView] = useState("live");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredWards = selectedCategory === "all" 
    ? wardCategories 
    : wardCategories.filter(w => w.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Ward-Wise Interactive Map
            </h1>
            <p className="text-muted-foreground">
              Hyper-local decision making - Visual, easy for non-technical users
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 mb-6"
          >
            <Tabs value={timeView} onValueChange={setTimeView} className="w-auto">
              <TabsList className="bg-card">
                <TabsTrigger value="live">Live</TabsTrigger>
                <TabsTrigger value="hourly">By Hour</TabsTrigger>
                <TabsTrigger value="daily">By Day</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-card">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="traffic">Traffic Zones</SelectItem>
                <SelectItem value="construction">Construction Zones</SelectItem>
                <SelectItem value="industrial">Industrial Areas</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">City Average</p>
              <AQIBadge value={142} size="md" />
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Cleanest Zone</p>
              <div className="flex items-center gap-2">
                <AQIBadge value={45} size="md" showLabel={false} />
                <span className="text-sm font-medium">North</span>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Most Polluted</p>
              <div className="flex items-center gap-2">
                <AQIBadge value={210} size="md" showLabel={false} />
                <span className="text-sm font-medium">Industrial</span>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Active Sensors</p>
              <p className="text-2xl font-bold text-foreground">156</p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl border border-border p-4">
                <PollutionMap />
              </div>
            </motion.div>

            {/* Ward List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-display font-semibold text-foreground mb-4">Ward Status</h3>
                <div className="space-y-2">
                  {filteredWards.map((ward) => {
                    const Icon = ward.category === "traffic" ? Car 
                      : ward.category === "construction" ? Building2 
                      : ward.category === "industrial" ? Factory 
                      : Home;
                    return (
                      <div
                        key={ward.name}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          ward.safe 
                            ? "border-success/20 bg-success/5" 
                            : "border-warning/20 bg-warning/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{ward.name}</span>
                          </div>
                          {ward.safe ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{ward.type}</span>
                          <AQIBadge value={ward.aqi} size="sm" showLabel={false} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hotspots */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-display font-semibold text-foreground mb-4">Pollution Hotspots</h3>
                <div className="space-y-2">
                  {hotspots.map((hotspot) => (
                    <div
                      key={hotspot.name}
                      className="p-3 rounded-xl bg-destructive/10 border border-destructive/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{hotspot.name}</span>
                        <AQIBadge value={hotspot.aqi} size="sm" showLabel={false} />
                      </div>
                      <span className={`text-xs font-medium ${
                        hotspot.severity === "critical" ? "text-destructive" 
                        : hotspot.severity === "high" ? "text-warning"
                        : "text-muted-foreground"
                      }`}>
                        {hotspot.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Hourly Chart */}
          {timeView === "hourly" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">AQI by Hour</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="aqi" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Safe vs Unsafe Zones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 grid md:grid-cols-2 gap-4"
          >
            <div className="bg-success/10 border border-success/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
                <h3 className="font-display font-semibold text-foreground">Safe Zones</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Areas with AQI below 100 - Safe for outdoor activities
              </p>
              <div className="space-y-2">
                {wardCategories.filter(w => w.safe).map((ward) => (
                  <div key={ward.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{ward.name}</span>
                    <AQIBadge value={ward.aqi} size="sm" showLabel={false} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-warning" />
                <h3 className="font-display font-semibold text-foreground">Unsafe Zones</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Areas with AQI above 100 - Use masks, limit outdoor exposure
              </p>
              <div className="space-y-2">
                {wardCategories.filter(w => !w.safe).map((ward) => (
                  <div key={ward.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{ward.name}</span>
                    <AQIBadge value={ward.aqi} size="sm" showLabel={false} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
