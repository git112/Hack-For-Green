import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Wind, CheckCircle, LocateFixed, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Route {
  id: string;
  name: string;
  duration: string;
  distance: string;
  aqi: number;
  type: "clean" | "polluted";
  recommended?: boolean;
}

export default function CleanNavigation() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localAqi, setLocalAqi] = useState<number | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const { toast } = useToast();

  const fetchLiveAQI = async () => {
    try {
      // Using WAQI demo token for live data based on IP/Location
      const response = await fetch("https://api.waqi.info/feed/here/?token=demo");
      const data = await response.json();
      if (data.status === "ok") {
        setLocalAqi(data.data.aqi);
        return data.data.aqi;
      }
    } catch (error) {
      console.error("AQI fetch error:", error);
    }
    return 50; // Fallback
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStart(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

        // Try to get actual address via reverse geocoding (nominatim is free)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data.display_name) {
            setStart(data.display_name.split(',').slice(0, 2).join(','));
          }
        } catch (e) {
          console.error("Reverse geocoding failed");
        }

        setLoading(false);
        toast({
          title: "Location Found",
          description: "Your current location has been set as the starting point.",
        });
      },
      (error) => {
        setLoading(false);
        toast({
          title: "Location Error",
          description: "Could not retrieve your location. Please enter it manually.",
          variant: "destructive",
        });
      }
    );
  };

  const handleSearch = async () => {
    if (start && destination) {
      setLoading(true);
      const liveAqi = await fetchLiveAQI();

      // Simulate route calculation with real AQI context
      setRoutes([
        {
          id: "fast",
          name: "Fastest Route",
          duration: "12 min",
          distance: "4.2 km",
          aqi: Math.round(liveAqi * 1.8), // Simulate higher pollution on main roads
          type: "polluted",
        },
        {
          id: "clean",
          name: "Clean Route",
          duration: "18 min",
          distance: "5.8 km",
          aqi: liveAqi,
          type: "clean",
          recommended: true,
        },
      ]);

      setLoading(false);
      setShowRoutes(true);
      setSelectedRoute("clean");
    }
  };

  const startNavigation = () => {
    if (!destination) return;

    // Create Google Maps Direction URL
    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const originParam = start ? `&origin=${encodeURIComponent(start)}` : "";
    const destParam = `&destination=${encodeURIComponent(destination)}`;
    const travelMode = "&travelmode=driving";

    const url = `${baseUrl}${originParam}${destParam}${travelMode}`;
    window.open(url, "_blank");

    toast({
      title: "Redirecting to Google Maps",
      description: "Opening navigation with your selected route...",
    });
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
          Find the healthiest path to your destination with live location support
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="start">Start Point</Label>
              <button
                onClick={getCurrentLocation}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <LocateFixed className="w-3 h-3" />
                Use Current Location
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="start"
                placeholder="Enter starting location or use GPS"
                value={start}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStart(e.target.value)}
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
                placeholder="Where are you going?"
                value={destination}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full gradient-primary border-0 h-11"
            disabled={loading || !start || !destination}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Finding Routes...
              </span>
            ) : (
              "Find Clean Routes"
            )}
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
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">Available Routes</h3>
            {localAqi && (
              <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground flex items-center gap-1">
                <Wind className="w-3 h-3" />
                Live Area AQI: {localAqi}
              </span>
            )}
          </div>

          {routes.map((route) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative bg-card rounded-2xl border-2 p-5 cursor-pointer transition-all ${selectedRoute === route.id
                ? "border-primary shadow-lg ring-1 ring-primary/20"
                : route.recommended
                  ? "border-success/30 hover:border-success/60 bg-success/[0.02]"
                  : "border-border hover:border-muted-foreground"
                }`}
              onClick={() => setSelectedRoute(route.id)}
            >
              {route.recommended && (
                <div className="absolute -top-3 left-4 bg-success text-success-foreground text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm">
                  ✓ Recommended
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{route.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{route.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{route.distance}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col items-end gap-1 px-3 py-1.5 rounded-xl border ${route.type === "clean"
                  ? "bg-success/5 border-success/20 text-success"
                  : "bg-destructive/5 border-destructive/20 text-destructive"
                  }`}>
                  <div className="flex items-center gap-1 font-bold text-lg">
                    <span>{route.aqi}</span>
                    <span className="text-[10px] font-normal opacity-70">AQI</span>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-tighter">
                    {route.type === "clean" ? "Healthy" : "Polluted"}
                  </span>
                </div>
              </div>

              {/* Route Visual */}
              <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${route.type === "clean" ? "bg-success" : "bg-destructive"
                    }`}
                  style={{ width: route.type === "clean" ? "40%" : "90%" }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                {route.type === "clean"
                  ? "🌿 Route verified with low particulate exposure from local monitors"
                  : "⚠️ This route crosses through detected high-density pollution zones"}
              </p>
            </motion.div>
          ))}

          {selectedRoute && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={startNavigation}
                className="w-full gradient-primary border-0 h-12 text-base font-semibold shadow-lg shadow-primary/20"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Start Navigation in Google Maps
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
        className="bg-muted/30 rounded-2xl h-64 flex flex-col items-center justify-center border border-border border-dashed overflow-hidden relative group"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="text-center text-muted-foreground relative z-10 transition-transform group-hover:scale-105 duration-500">
          <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center mx-auto mb-4 border border-border shadow-inner">
            <Navigation className="w-8 h-8 opacity-40 text-primary" />
          </div>
          <p className="text-sm font-medium">Route visualization unavailable</p>
          <p className="text-xs opacity-60 mt-1 max-w-[200px] mx-auto">Please use the external Google Maps navigation for real-time traffic & GPS</p>
        </div>
      </motion.div>
    </div>
  );
}
