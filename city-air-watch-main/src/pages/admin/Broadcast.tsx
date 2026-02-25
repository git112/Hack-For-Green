import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Send, AlertTriangle, Users, CheckCircle, Shield, DollarSign, FileText, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const wards = [
  "All Wards",
  "Ward 1 - Central",
  "Ward 2 - North",
  "Ward 3 - South",
  "Ward 4 - East",
  "Ward 5 - West",
  "Ward 6 - Industrial",
];

const templates = [
  { id: 1, title: "High Dust Alert", message: "High dust levels expected today. Please use masks when outdoors." },
  { id: 2, title: "Industrial Emission", message: "Elevated pollution from industrial area. Residents advised to stay indoors." },
  { id: 3, title: "Air Quality Improved", message: "Good news! Air quality has improved in your area. Safe for outdoor activities." },
];

const recentAlerts = [
  { id: 1, message: "High Dust Alert for Ward 5", time: "1 hour ago", recipients: 2540 },
  { id: 2, message: "Construction activity notice", time: "3 hours ago", recipients: 1250 },
  { id: 3, message: "Air quality improvement notice", time: "1 day ago", recipients: 8520 },
];

const violations = [
  { id: 1, type: "Garbage Burning", location: "Ward 6 - Industrial", detected: "2h ago", severity: "high", penalty: 5000, status: "pending", evidence: true },
  { id: 2, type: "Industrial Emission", location: "Ward 6 - Industrial", detected: "4h ago", severity: "critical", penalty: 25000, status: "issued", evidence: true },
  { id: 3, type: "Construction Dust", location: "Ward 3 - Traffic Hub", detected: "1h ago", severity: "medium", penalty: 2000, status: "pending", evidence: true },
  { id: 4, type: "Vehicle Emission", location: "Ward 8 - Market Area", detected: "3h ago", severity: "medium", penalty: 1500, status: "paid", evidence: false },
];

const penalties = [
  { id: 1, violation: "Garbage Burning", amount: 5000, issued: "2h ago", due: "48h", status: "pending", offender: "ABC Industries" },
  { id: 2, violation: "Industrial Emission", amount: 25000, issued: "4h ago", due: "44h", status: "issued", offender: "XYZ Corp" },
  { id: 3, violation: "Construction Dust", amount: 2000, issued: "1h ago", due: "47h", status: "pending", offender: "BuildCo Ltd" },
];

export default function Broadcast() {
  const [selectedWard, setSelectedWard] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [selectedViolation, setSelectedViolation] = useState("");
  const [activeTab, setActiveTab] = useState("alerts");
  const { toast } = useToast();

  const handleSend = async () => {
    if (!selectedWard || !message) {
      toast({
        title: "Missing Information",
        description: "Please select a ward and enter a message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);

    toast({
      title: "Alert Sent Successfully! 📢",
      description: `Message broadcasted to ${selectedWard}`,
    });

    setMessage("");
    setSelectedWard("");
  };

  const handleIssuePenalty = () => {
    if (!selectedViolation || !penaltyAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a violation and enter penalty amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "E-Penalty Issued Successfully! ⚖️",
      description: `Penalty of ₹${penaltyAmount} issued for ${selectedViolation}`,
    });

    setPenaltyAmount("");
    setSelectedViolation("");
  };

  const handleViewEvidence = (violationId: number) => {
    toast({
      title: "Viewing Evidence",
      description: `Opening evidence for violation #${violationId}...`,
    });
    // In a real app, this would open a modal or navigate to evidence page
  };

  const handleIssuePenaltyFromViolation = (violationId: number, violationType: string, location: string) => {
    setSelectedViolation(violationType.toLowerCase().replace(" ", "-"));
    toast({
      title: "Fill Penalty Details",
      description: `Please enter the penalty amount for ${violationType} in ${location}`,
    });
    // Switch to penalty tab
    setActiveTab("penalties");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Alerts & Enforcement Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          Prevention + Compliance - Automated enforcement with reduced delay & corruption
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card">
          <TabsTrigger value="alerts">Broadcast Alerts</TabsTrigger>
          <TabsTrigger value="violations">AI-Detected Violations</TabsTrigger>
          <TabsTrigger value="penalties">E-Penalty Status</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6 mt-6">

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Compose Alert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Compose Alert</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="ward">Target Ward</Label>
                  <Select value={selectedWard} onValueChange={setSelectedWard}>
                    <SelectTrigger className="bg-background mt-1">
                      <SelectValue placeholder="Select target ward" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border">
                      {wards.map((ward) => (
                        <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Alert Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your alert message..."
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    className="mt-1 min-h-32"
                  />
                </div>

                {/* Quick Templates */}
                <div>
                  <Label className="text-xs text-muted-foreground">Quick Templates</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setMessage(template.message)}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSend}
                  className="w-full gradient-primary border-0 h-12"
                  disabled={sending || !selectedWard || !message}
                >
                  {sending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Alert
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Recent Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-display font-semibold text-foreground mb-6">Recent Alerts</h3>

              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{alert.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{alert.time}</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {alert.recipients.toLocaleString()} recipients
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Emergency Protocol</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      For city-wide emergencies, use the emergency broadcast system for immediate notification to all citizens.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-foreground">AI-Detected Violations</h3>
            </div>
            <div className="space-y-3">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="p-4 rounded-xl border-2 border-border hover:border-warning/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${violation.severity === "critical" ? "bg-destructive/10"
                          : violation.severity === "high" ? "bg-warning/10"
                            : "bg-primary/10"
                        }`}>
                        <Ban className={`w-5 h-5 ${violation.severity === "critical" ? "text-destructive"
                            : violation.severity === "high" ? "text-warning"
                              : "text-primary"
                          }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{violation.type}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {violation.location}
                          </span>
                          <span>Detected: {violation.detected}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">₹{violation.penalty.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${violation.status === "paid"
                          ? "bg-success text-success-foreground"
                          : violation.status === "issued"
                            ? "bg-warning text-warning-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                        {violation.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {violation.evidence && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEvidence(violation.id)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Evidence
                        </Button>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${violation.severity === "critical"
                          ? "bg-destructive text-destructive-foreground"
                          : violation.severity === "high"
                            ? "bg-warning text-warning-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}>
                        {violation.severity.toUpperCase()}
                      </span>
                    </div>
                    {violation.status === "pending" && (
                      <Button
                        size="sm"
                        className="gradient-primary border-0"
                        onClick={() => handleIssuePenaltyFromViolation(violation.id, violation.type, violation.location)}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Issue Penalty
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="penalties" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Issue E-Penalty */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Issue E-Penalty</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="violation">Violation Type</Label>
                  <Select value={selectedViolation} onValueChange={setSelectedViolation}>
                    <SelectTrigger className="bg-background mt-1">
                      <SelectValue placeholder="Select violation type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border">
                      <SelectItem value="garbage">Garbage Burning</SelectItem>
                      <SelectItem value="industrial">Industrial Emission</SelectItem>
                      <SelectItem value="construction">Construction Dust</SelectItem>
                      <SelectItem value="vehicle">Vehicle Emission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Penalty Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter penalty amount"
                    value={penaltyAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPenaltyAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleIssuePenalty}
                  className="w-full gradient-primary border-0"
                  disabled={!selectedViolation || !penaltyAmount}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Issue E-Penalty
                </Button>
              </div>
            </motion.div>

            {/* Penalty Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-display font-semibold text-foreground mb-6">E-Penalty Status</h3>
              <div className="space-y-3">
                {penalties.map((penalty) => (
                  <div
                    key={penalty.id}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{penalty.violation}</p>
                        <p className="text-xs text-muted-foreground mt-1">{penalty.offender}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${penalty.status === "paid"
                          ? "bg-success text-success-foreground"
                          : penalty.status === "issued"
                            ? "bg-warning text-warning-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                        {penalty.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-bold text-foreground">₹{penalty.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Due in</p>
                        <p className="font-medium text-foreground">{penalty.due}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Enforcement Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-2">Automated Enforcement Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI detects violations automatically - no manual inspection needed</li>
                  <li>• E-penalty system reduces delay and corruption</li>
                  <li>• Faster response time - violations detected within hours</li>
                  <li>• Transparent process - all penalties tracked and auditable</li>
                  <li>• Deterrent effect - automated system prevents repeat violations</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
