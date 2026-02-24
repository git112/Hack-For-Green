import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import LiveMap from "./pages/LiveMap";
import CitizenLayout from "./pages/citizen/CitizenLayout";
import CitizenDashboard from "./pages/citizen/Dashboard";
import AIReport from "./pages/citizen/AIReport";
import CleanNavigation from "./pages/citizen/CleanNavigation";
import RewardsWallet from "./pages/citizen/RewardsWallet";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ActionCenter from "./pages/admin/ActionCenter";
import Broadcast from "./pages/admin/Broadcast";
import Analytics from "./pages/admin/Analytics";
import AIPrediction from "./pages/admin/AIPrediction";
import PolicySimulation from "./pages/admin/PolicySimulation";
import HealthImpact from "./pages/admin/HealthImpact";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/map" element={<LiveMap />} />

          {/* Citizen Routes */}
          <Route path="/citizen" element={<CitizenLayout />}>
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="report" element={<AIReport />} />
            <Route path="navigate" element={<CleanNavigation />} />
            <Route path="wallet" element={<RewardsWallet />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tasks" element={<ActionCenter />} />
            <Route path="broadcast" element={<Broadcast />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="prediction" element={<AIPrediction />} />
            <Route path="simulation" element={<PolicySimulation />} />
            <Route path="health" element={<HealthImpact />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
