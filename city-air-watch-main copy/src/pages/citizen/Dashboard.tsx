import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Camera, Navigation, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { PollutionMap } from "@/components/maps/PollutionMap";

export default function CitizenDashboard() {
  const userName = localStorage.getItem("userName") || "Citizen";
  const userWard = localStorage.getItem("userWard") || "Ward 1 - Central";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your air quality overview for today
        </p>
      </motion.div>

      {/* Ward Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>Your Ward Status</span>
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">{userWard}</h2>
          </div>
          <AQIBadge value={85} size="lg" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">23°C</p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">65%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="flex items-center gap-1 text-success">
              <TrendingDown className="w-4 h-4" />
              <span className="text-lg font-bold">-12%</span>
            </div>
            <p className="text-xs text-muted-foreground">vs Yesterday</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <Link to="/citizen/report">
          <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer h-full">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">Report Issue</h3>
            <p className="text-sm text-muted-foreground">Use AI to detect and report pollution</p>
          </div>
        </Link>
        
        <Link to="/citizen/navigate">
          <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer h-full">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">Find Clean Route</h3>
            <p className="text-sm text-muted-foreground">Navigate through healthier paths</p>
          </div>
        </Link>
      </motion.div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Your Area (5km Radius)</h3>
          <Link to="/map">
            <Button variant="outline" size="sm">View Full Map</Button>
          </Link>
        </div>
        <PollutionMap compact />
      </motion.div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">Air Quality Advisory</h4>
          <p className="text-sm text-muted-foreground">
            Moderate pollution expected in the afternoon. Consider using a mask if going outdoors between 2 PM - 6 PM.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
