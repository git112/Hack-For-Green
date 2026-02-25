import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wind, LayoutDashboard, ClipboardList, Bell, BarChart3,
  LogOut, Menu, X, Shield, Settings, Brain, FlaskConical, Heart, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GovAirChatbot from "@/components/GovAirChatbot";
import { usePathwayStream } from "@/hooks/usePathwayStream";

const navItems = [
  { to: "/admin/dashboard", label: "Command Center", icon: LayoutDashboard },
  { to: "/admin/stream", label: "Stream Monitor", icon: Radio, live: true },
  { to: "/admin/tasks", label: "Action Center", icon: ClipboardList },
  { to: "/admin/broadcast", label: "Alerts & Enforcement", icon: Bell },
  { to: "/admin/prediction", label: "AI Prediction", icon: Brain },
  { to: "/admin/simulation", label: "Policy Simulation", icon: FlaskConical },
  { to: "/admin/health", label: "Health Impact", icon: Heart },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Admin";
  const stream = usePathwayStream();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType !== "government") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userWard");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-foreground">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-foreground border-b border-muted/20 h-16 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-background">
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Wind className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-background">CleanAirGov</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Wind className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">Admin Panel</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">Government Official</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  location.pathname === item.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.live && stream.connected && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <Link to="/admin/settings">
              <Button
                variant="ghost"
                className={`w-full justify-start ${location.pathname === "/admin/settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-background">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* GovAir AI Chatbot — wired to Pathway stream AQI */}
      <GovAirChatbot
        userRole="Admin"
        city="Delhi"
        currentAqi={stream.cityStats?.avg_aqi ?? 142}
      />
    </div>
  );
}
