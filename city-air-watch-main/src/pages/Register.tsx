import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wind, User, Building2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const wards = [
  "Ward 1 - Central", "Ward 2 - North", "Ward 3 - South",
  "Ward 4 - East", "Ward 5 - West", "Ward 6 - Industrial",
  "Ward 7 - Residential", "Ward 8 - Commercial"
];

const zones = [
  "Zone A - Central", "Zone B - North", "Zone C - South",
  "Zone D - East", "Zone E - West"
];

export default function Register() {
  const [userType, setUserType] = useState<"citizen" | "government">("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    ward: "",
    employeeId: "",
    zone: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let role = userType === "citizen" ? "citizen" : "officer";
      if (formData.email.includes("admin")) {
        role = "admin";
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        ...(role === "citizen" && { wardName: formData.ward }),
        ...(role === "officer" && {
          employeeId: formData.employeeId,
          assignedZone: formData.zone
        }),
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.user.role === "citizen" ? "citizen" : "government");
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userWard", formData.ward || formData.zone);
      localStorage.setItem("userEmail", data.user.email);

      toast({
        title: "Registration Successful!",
        description: `Welcome to CleanAirGov, ${data.user.name}!`,
      });

      if (data.user.role === "citizen") {
        navigate("/citizen/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Wind className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-center text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Join the movement for cleaner air
          </p>

          {/* User Type Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType("citizen")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${userType === "citizen"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
                }`}
            >
              <User className="w-4 h-4" />
              Citizen
            </button>
            <button
              type="button"
              onClick={() => setUserType("government")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${userType === "government"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
                }`}
            >
              <Building2 className="w-4 h-4" />
              Government
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {userType === "government" && (
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="Enter your employee ID"
                  value={formData.employeeId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">
                {userType === "government" ? "Official Email" : "Email Address"}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={userType === "government" ? "name@gov.in" : "you@example.com"}
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="location">
                {userType === "citizen" ? "Home Ward" : "Assigned Zone"}
              </Label>
              <Select
                value={userType === "citizen" ? formData.ward : formData.zone}
                onValueChange={(value: string) =>
                  setFormData({
                    ...formData,
                    [userType === "citizen" ? "ward" : "zone"]: value,
                  })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={`Select your ${userType === "citizen" ? "ward" : "zone"}`} />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {(userType === "citizen" ? wards : zones).map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-primary border-0 h-12 text-base">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
