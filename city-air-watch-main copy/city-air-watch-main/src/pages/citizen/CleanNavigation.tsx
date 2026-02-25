import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Wind, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const routes = [
  {
    id: "fast",
    name: "Fastest Route",
    duration: "12 min",
    distance: "4.2 km",
    aqi: 165,
    type: "polluted",
  },
  {
    id: "clean",
    name: "Clean Route",
    duration: "18 min",
    distance: "5.8 km",
    aqi: 52,
    type: "clean",
    recommended: true,
  },
];

export default function CleanNavigation() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const handleSearch = () => {
    if (start && destination) {
      setShowRoutes(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Clean Route Navigation
        </h1>
        <p className="text-muted-foreground mt-1">
          Find the healthiest path to your destination
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="start">Start Point</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="start"
                placeholder="Enter starting location"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="destination">Destination</Label>
            <div className="relative mt-1">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="destination"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            className="w-full gradient-primary border-0"
            disabled={!start || !destination}
          >
            Find Clean Routes
          </Button>
        </div>
      </motion.div>

      {/* Route Comparison */}
      {showRoutes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="font-display font-semibold text-foreground">Available Routes</h3>
          
          {routes.map((route) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative bg-card rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                selectedRoute === route.id
                  ? "border-primary shadow-lg"
                  : route.recommended
                  ? "border-success/50 hover:border-success"
                  : "border-border hover:border-muted-foreground"
              }`}
              onClick={() => setSelectedRoute(route.id)}
            >
              {route.recommended && (
                <div className="absolute -top-3 left-4 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  ✓ Recommended
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{route.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{route.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      <span>{route.distance}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  route.type === "clean" 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                }`}>
                  <Wind className="w-4 h-4" />
                  <span className="font-semibold">{route.aqi} AQI</span>
                </div>
              </div>

              {/* Route Visual */}
              <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    route.type === "clean" ? "bg-success" : "bg-destructive"
                  }`}
                  style={{ width: route.type === "clean" ? "30%" : "85%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {route.type === "clean" 
                  ? "🌿 Low pollution exposure throughout the route"
                  : "⚠️ High pollution zones along this route"}
              </p>
            </motion.div>
          ))}

          {selectedRoute && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button className="w-full gradient-primary border-0 h-12">
                <Navigation className="w-4 h-4 mr-2" />
                Start Navigation
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Map Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-muted/30 rounded-2xl h-64 flex items-center justify-center border border-border"
      >
        <div className="text-center text-muted-foreground">
          <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Route map will appear here</p>
        </div>
      </motion.div>
    </div>
  );
}
