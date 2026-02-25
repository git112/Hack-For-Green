import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Camera, Navigation, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { PollutionMap } from "@/components/maps/PollutionMap";
import { usePathwayStream } from "@/hooks/usePathwayStream";
import { useEffect, useState } from "react";
import { TransitionPage } from "@/components/ui/TransitionPage";
import { useNavigate } from "react-router-dom";

export default function CitizenDashboard() {
  const stream = usePathwayStream();
  const userName = localStorage.getItem("userName") || "Citizen";
  const userWardName = localStorage.getItem("userWard") || "Ward 1 - Central";

  const userWardData = stream.wardsList.find(w => w.ward_name === userWardName) || stream.wardsList[0];
  const currentAQI = userWardData?.aqi || 85;
  const temp = userWardData?.pm25 ? Math.round(23 + (userWardData.pm25 / 10)) : 23; // Pseudo-temp from PM2.5 for demo
  const hum = userWardData?.pm10 ? Math.min(95, Math.round(65 + (userWardData.pm10 / 20))) : 65;

  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navTarget, setNavTarget] = useState("");

  const handleAction = (path: string, label: string) => {
    setNavTarget(label);
    setIsNavigating(true);
    setTimeout(() => {
      navigate(path);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <TransitionPage
        isLoading={isNavigating}
        message={`SYNCING ${navTarget.toUpperCase()}`}
        subMessage="Optimizing environmental telemetry..."
      />

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
            <h2 className="font-display text-xl font-semibold text-foreground">{userWardData?.ward_name || userWardName}</h2>
          </div>
          <AQIBadge value={currentAQI} size="lg" />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{temp}°C</p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{hum}%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className={`flex items-center gap-1 ${userWardData?.spike ? 'text-destructive' : 'text-success'}`}>
              <TrendingDown className={`w-4 h-4 ${userWardData?.spike ? 'rotate-180' : ''}`} />
              <span className="text-lg font-bold">{userWardData?.spike ? '+8%' : '-12%'}</span>
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
        <motion.button
          onClick={() => handleAction("/citizen/report", "AI Report")}
          className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer h-full text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6 text-warning" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">Report Issue</h3>
          <p className="text-sm text-muted-foreground">Use AI to detect and report pollution</p>
        </motion.button>

        <motion.button
          onClick={() => handleAction("/citizen/navigate", "Navigation Engine")}
          className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer h-full text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Navigation className="w-6 h-6 text-success" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">Find Clean Route</h3>
          <p className="text-sm text-muted-foreground">Navigate through healthier paths</p>
        </motion.button>
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
