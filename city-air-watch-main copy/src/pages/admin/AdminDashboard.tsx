import { motion } from "framer-motion";
import { AlertTriangle, FileText, MapPin, TrendingUp, Users, Zap, Brain, Clock, CheckCircle, XCircle } from "lucide-react";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { PollutionMap } from "@/components/maps/PollutionMap";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const stats = [
  { label: "Critical Wards", value: "4", icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
  { label: "Active Complaints", value: "127", icon: FileText, color: "text-warning", bgColor: "bg-warning/10" },
  { label: "City Avg AQI", value: "142", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Active Citizens", value: "12.5K", icon: Users, color: "text-success", bgColor: "bg-success/10" },
];

const criticalWards = [
  { name: "Ward 6 - Industrial", aqi: 210, trend: "up" },
  { name: "Ward 12 - Construction", aqi: 185, trend: "up" },
  { name: "Ward 3 - Traffic Hub", aqi: 156, trend: "stable" },
  { name: "Ward 8 - Market Area", aqi: 145, trend: "down" },
];

const allWards = [
  { ward: "Ward 1 - Central", aqi: 85, predicted24h: 92, complaints: 12, status: "normal", sla: "on_time" },
  { ward: "Ward 2 - North", aqi: 45, predicted24h: 48, complaints: 3, status: "normal", sla: "on_time" },
  { ward: "Ward 3 - Traffic Hub", aqi: 156, predicted24h: 175, complaints: 28, status: "critical", sla: "overdue" },
  { ward: "Ward 4 - East", aqi: 120, predicted24h: 135, complaints: 15, status: "warning", sla: "on_time" },
  { ward: "Ward 5 - West", aqi: 98, predicted24h: 105, complaints: 8, status: "normal", sla: "on_time" },
  { ward: "Ward 6 - Industrial", aqi: 210, predicted24h: 225, complaints: 45, status: "critical", sla: "overdue" },
  { ward: "Ward 7 - South", aqi: 112, predicted24h: 118, complaints: 10, status: "normal", sla: "on_time" },
  { ward: "Ward 8 - Market Area", aqi: 145, predicted24h: 152, complaints: 22, status: "warning", sla: "at_risk" },
];

const activeComplaints = [
  { id: 1, ward: "Ward 6 - Industrial", type: "Garbage Burning", time: "2h ago", assigned: "Crew A", deadline: "4h", status: "in_progress" },
  { id: 2, ward: "Ward 3 - Traffic Hub", type: "Vehicle Emission", time: "3h ago", assigned: "Crew B", deadline: "5h", status: "in_progress" },
  { id: 3, ward: "Ward 8 - Market Area", type: "Construction Dust", time: "1h ago", assigned: "Unassigned", deadline: "7h", status: "new" },
];

export default function AdminDashboard() {
  const [selectedWard, setSelectedWard] = useState<string>("");

  useEffect(() => {
    // Listen for ward selection from map
    const handleWardSelect = (event: CustomEvent) => {
      setSelectedWard(event.detail.ward);
    };

    // Check localStorage for previously selected ward
    const storedWard = localStorage.getItem('selectedWard');
    if (storedWard) {
      setSelectedWard(storedWard);
    }

    window.addEventListener('wardSelected', handleWardSelect as EventListener);

    return () => {
      window.removeEventListener('wardSelected', handleWardSelect as EventListener);
    };
  }, []);

  const handleZoneClick = (ward: string) => {
    setSelectedWard(ward);
    localStorage.setItem('selectedWard', ward);
  };

  // Highlight selected ward in critical wards list
  const getWardHighlightClass = (wardName: string) => {
    return selectedWard === wardName
      ? "bg-primary/20 border-2 border-primary shadow-lg"
      : "bg-muted/50 hover:bg-muted";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time city pollution monitoring and management
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-card rounded-xl px-4 py-2 border border-border">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Live Data</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl border border-border p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-4"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">City Pollution Heatmap</h3>
          <PollutionMap onZoneClick={handleZoneClick} selectedWard={selectedWard} />
        </motion.div>

        {/* Critical Wards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
          id="critical-wards-section"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Critical Wards</h3>
            <Link to="/map">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <MapPin className="w-3 h-3 mr-1" />
                View on Map
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {criticalWards.map((ward) => (
              <div
                key={ward.name}
                onClick={() => {
                  setSelectedWard(ward.name);
                  localStorage.setItem('selectedWard', ward.name);
                  window.dispatchEvent(new CustomEvent('wardSelected', { detail: { ward: ward.name } }));
                  
                  // Scroll to map section smoothly
                  setTimeout(() => {
                    const mapContainer = document.querySelector('[class*="PollutionMap"]');
                    if (mapContainer) {
                      mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${getWardHighlightClass(ward.name)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{ward.name}</span>
                </div>
                <AQIBadge value={ward.aqi} size="sm" showLabel={false} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Ward-Wise AQI Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Ward-Wise AQI Table</h3>
          <Link to="/admin/prediction">
            <Button variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              View Predictions
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ward</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Current AQI</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">24h Forecast</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Complaints</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">SLA</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {allWards.map((ward) => (
                <tr key={ward.ward} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">{ward.ward}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <AQIBadge value={ward.aqi} size="sm" showLabel={false} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <AQIBadge value={ward.predicted24h} size="sm" showLabel={false} />
                      {ward.predicted24h > ward.aqi ? (
                        <TrendingUp className="w-4 h-4 text-destructive" />
                      ) : (
                        <span className="text-success">✓</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-medium text-foreground">{ward.complaints}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        ward.status === "critical"
                          ? "bg-destructive text-destructive-foreground"
                          : ward.status === "warning"
                          ? "bg-warning text-warning-foreground"
                          : "bg-success text-success-foreground"
                      }`}
                    >
                      {ward.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {ward.sla === "on_time" ? (
                      <div className="flex items-center justify-center gap-1 text-success">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">On Time</span>
                      </div>
                    ) : ward.sla === "at_risk" ? (
                      <div className="flex items-center justify-center gap-1 text-warning">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">At Risk</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-destructive">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs">Overdue</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link to="/admin/tasks">
                      <Button variant="outline" size="sm">
                        Assign Task
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Active Complaints List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Active Complaints</h3>
          <Link to="/admin/tasks">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {activeComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{complaint.type}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {complaint.ward}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {complaint.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Assigned to</p>
                  <p className="text-sm font-medium text-foreground">{complaint.assigned}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className={`text-sm font-medium ${
                    complaint.status === "new" ? "text-warning" : "text-foreground"
                  }`}>
                    {complaint.deadline}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    complaint.status === "new"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-warning text-warning-foreground"
                  }`}
                >
                  {complaint.status === "new" ? "NEW" : "IN PROGRESS"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Prediction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display font-semibold text-foreground">AI Prediction Alert</h3>
              <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                Warning
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              Based on weather patterns and historical data, AQI in <strong className="text-foreground">Ward 3 - Traffic Hub</strong> is predicted to 
              rise to <strong className="text-destructive">175+</strong> tomorrow between 2 PM - 6 PM due to expected 
              construction activity and low wind speeds.
            </p>
            <div className="flex gap-3">
              <Link to="/admin/prediction">
                <Button variant="outline" size="sm" className="gap-2">
                  <Zap className="w-4 h-4" />
                  View Full Prediction
                </Button>
              </Link>
              <Link to="/admin/simulation">
                <Button variant="outline" size="sm" className="gap-2">
                  <Brain className="w-4 h-4" />
                  Simulate Action
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
