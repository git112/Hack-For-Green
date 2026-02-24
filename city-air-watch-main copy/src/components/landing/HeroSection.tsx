import { motion } from "framer-motion";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { Link } from "react-router-dom";
import { useState } from "react";
import heroImage from "@/assets/hero-city.jpg";

export function HeroSection() {
  const [pincode, setPincode] = useState("");

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
              className="inline-flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-warning"></span>
              </span>
              <span className="text-sm font-medium text-muted-foreground">City Average:</span>
              <AQIBadge value={142} size="sm" />
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
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter Pincode or Ward Name..."
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button size="lg" className="gradient-primary border-0 h-12 px-6">
                <Search className="w-4 h-4 mr-2" />
                Check AQI
              </Button>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button variant="outline" size="lg" asChild>
                <Link to="/map">
                  View Live Map
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
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
