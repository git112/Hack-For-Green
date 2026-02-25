import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ArrowRight, X, Wind, Droplets, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { usePathwayStream, WardReading } from "@/hooks/usePathwayStream";
import heroImage from "@/assets/hero-city.jpg";

const WARD_PINCODES: Record<string, string[]> = {
  "ward_1": ["110001", "400001"],
  "ward_2": ["110002", "400002"],
  "ward_3": ["110003", "400003"],
  "ward_4": ["110004", "400004"],
  "ward_5": ["110005", "400005"],
  "ward_6": ["110006", "400006"],
  "ward_7": ["110007", "400007"],
  "ward_8": ["110008", "400008"],
};

export function HeroSection() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState<WardReading | null>(null);
  const [hasError, setHasError] = useState(false);
  const stream = usePathwayStream();

  const handleSearch = () => {
    if (!searchInput.trim()) return;

    // Search by pincode first
    let foundWard: WardReading | undefined;

    // Check pincode mapping
    const wardIdByPincode = Object.entries(WARD_PINCODES).find(([_, codes]) =>
      codes.includes(searchInput.trim())
    )?.[0];

    if (wardIdByPincode) {
      foundWard = stream.wardsList.find(w => w.ward_id === wardIdByPincode);
    }

    // If not found by pincode, search by name
    if (!foundWard) {
      foundWard = stream.wardsList.find(w =>
        w.ward_name.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    if (foundWard) {
      setSearchResult(foundWard);
      setHasError(false);
    } else {
      setSearchResult(null);
      setHasError(true);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Smart City"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Live AQI Widget */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-primary/20"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-warning"></span>
              </span>
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">City Average:</span>
              <AQIBadge value={stream.cityStats?.avg_aqi || 142} size="sm" />
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Smart Pollution Action for{" "}
              <span className="text-primary">Your City</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Monitor air quality in real-time, report pollution, earn rewards, and navigate through cleaner routes. Together, we make a difference.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter Pincode (e.g. 110001) or Ward Name..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      if (hasError) setHasError(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={`pl-10 h-12 text-base bg-card/50 backdrop-blur-md border-primary/20 focus:border-primary transition-all ${hasError ? 'border-destructive' : ''}`}
                  />
                  {hasError && (
                    <span className="absolute -bottom-6 left-0 text-xs text-destructive font-medium">
                      Location not found. Try "Ward 1" or "110001".
                    </span>
                  )}
                </div>
                <Button
                  size="lg"
                  onClick={handleSearch}
                  className="gradient-primary border-0 h-12 px-6 shadow-lg hover:shadow-primary/20 transition-all"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Check AQI
                </Button>
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {searchResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-card/90 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 shadow-2xl relative group">
                      <button
                        onClick={() => setSearchResult(null)}
                        className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <div className="flex items-center gap-2 text-primary font-medium mb-1">
                            <Wind className="w-4 h-4" />
                            <span>Real-time Data Active</span>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">{searchResult.ward_name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Thermometer className="w-4 h-4 opacity-70" />
                              24°C
                            </span>
                            <span className="flex items-center gap-1">
                              <Droplets className="w-4 h-4 opacity-70" />
                              62% Hum.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Current Status</p>
                            <AQIBadge value={searchResult.aqi} size="lg" />
                          </div>
                          <div className="h-12 w-px bg-border hidden md:block" />
                          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                            <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1 opacity-70">Trend</p>
                            <span className={`text-sm font-bold ${searchResult.spike ? 'text-destructive' : 'text-success'}`}>
                              {searchResult.spike ? '↑ Spiking' : '↓ Stable'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Button variant="outline" size="sm" asChild className="flex-1 rounded-xl">
                          <Link to="/map">Live Map View</Link>
                        </Button>
                        <Button size="sm" asChild className="flex-1 rounded-xl gradient-primary border-0">
                          <Link to="/register">Register Alerts</Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button variant="outline" size="lg" asChild className="rounded-xl border-primary/30 hover:bg-primary/5">
                <Link to="/map">
                  View Live Map
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="rounded-xl">
                <Link to="/register">
                  Join as Citizen
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
