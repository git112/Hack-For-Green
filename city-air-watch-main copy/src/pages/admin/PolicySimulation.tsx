import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FlaskConical, Play, RotateCcw, TrendingDown, TrendingUp, 
  Car, Building2, Droplets, Ban, CheckCircle, AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type SimulationAction = {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
  intensity: number;
  impact: number;
  cost: number;
};

const initialActions: SimulationAction[] = [
  { id: "traffic", name: "Traffic Restriction", icon: Car, enabled: false, intensity: 50, impact: -15, cost: 50000 },
  { id: "construction", name: "Construction Ban", icon: Building2, enabled: false, intensity: 100, impact: -12, cost: 200000 },
  { id: "sprinkling", name: "Road Sprinkling", icon: Droplets, enabled: false, intensity: 75, impact: -8, cost: 30000 },
  { id: "industry", name: "Industry Emission Control", icon: Ban, enabled: false, intensity: 60, impact: -20, cost: 500000 },
];

const simulationResults = [
  { ward: "Ward 1", current: 85, simulated: 72, improvement: -15 },
  { ward: "Ward 2", current: 45, simulated: 38, improvement: -16 },
  { ward: "Ward 3", current: 156, simulated: 132, improvement: -15 },
  { ward: "Ward 4", current: 120, simulated: 105, improvement: -13 },
  { ward: "Ward 5", current: 98, simulated: 83, improvement: -15 },
  { ward: "Ward 6", current: 210, simulated: 168, improvement: -20 },
];

export default function PolicySimulation() {
  const [actions, setActions] = useState<SimulationAction[]>(initialActions);
  const [selectedWard, setSelectedWard] = useState("all");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [currentAQI, setCurrentAQI] = useState(142);
  const [simulatedAQI, setSimulatedAQI] = useState<number | null>(null);

  const toggleAction = (id: string) => {
    setActions(actions.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
    setSimulationComplete(false);
  };

  const updateIntensity = (id: string, value: number[]) => {
    setActions(actions.map(a => 
      a.id === id ? { ...a, intensity: value[0] } : a
    ));
    setSimulationComplete(false);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationComplete(false);

    setTimeout(() => {
      const enabledActions = actions.filter(a => a.enabled);
      const totalImpact = enabledActions.reduce((sum, a) => {
        const impactMultiplier = a.intensity / 100;
        return sum + (a.impact * impactMultiplier);
      }, 0);

      const newAQI = Math.max(0, Math.round(currentAQI + totalImpact));
      setSimulatedAQI(newAQI);
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 2000);
  };

  const resetSimulation = () => {
    setActions(initialActions);
    setSimulatedAQI(null);
    setSimulationComplete(false);
  };

  const enabledActions = actions.filter(a => a.enabled);
  const totalCost = enabledActions.reduce((sum, a) => sum + a.cost, 0);
  const totalImpact = enabledActions.reduce((sum, a) => {
    const impactMultiplier = a.intensity / 100;
    return sum + (a.impact * impactMultiplier);
  }, 0);
  const estimatedAQI = simulatedAQI !== null ? simulatedAQI : Math.max(0, Math.round(currentAQI + totalImpact));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Digital Twin / Policy Simulation
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Test policies before implementation - Prevent wrong decisions
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedWard} onValueChange={setSelectedWard}>
            <SelectTrigger className="w-48 bg-card">
              <SelectValue placeholder="Select Ward" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              <SelectItem value="all">All Wards (City)</SelectItem>
              <SelectItem value="ward1">Ward 1 - Central</SelectItem>
              <SelectItem value="ward2">Ward 2 - North</SelectItem>
              <SelectItem value="ward3">Ward 3 - Traffic Hub</SelectItem>
              <SelectItem value="ward6">Ward 6 - Industrial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Current vs Simulated AQI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Current AQI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <AQIBadge value={currentAQI} size="lg" />
            </div>
          </CardContent>
        </Card>

        <Card className={simulationComplete ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Simulated AQI</CardTitle>
          </CardHeader>
          <CardContent>
            {isSimulating ? (
              <div className="flex items-center gap-3">
                <div className="animate-pulse text-2xl font-bold text-muted-foreground">...</div>
              </div>
            ) : simulatedAQI !== null ? (
              <div className="flex items-center gap-3">
                <AQIBadge value={simulatedAQI} size="lg" />
                {simulatedAQI < currentAQI ? (
                  <div className="flex items-center gap-1 text-success">
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-sm font-bold">{Math.abs(simulatedAQI - currentAQI)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-destructive">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-bold">+{simulatedAQI - currentAQI}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Run simulation to see results</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Impact</CardTitle>
          </CardHeader>
          <CardContent>
            {enabledActions.length > 0 ? (
              <div className="flex items-center gap-3">
                {totalImpact < 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-success">
                      <TrendingDown className="w-5 h-5" />
                      <span className="text-2xl font-bold">{Math.abs(Math.round(totalImpact))}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">AQI reduction</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No actions enabled</span>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Enable actions to see impact</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Policy Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Available Policy Actions</CardTitle>
              <CardDescription>Enable and adjust policies to simulate their impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      action.enabled
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          action.enabled ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <Icon className={`w-5 h-5 ${action.enabled ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={action.id} className="font-semibold text-foreground cursor-pointer">
                              {action.name}
                            </Label>
                            <Switch
                              id={action.id}
                              checked={action.enabled}
                              onCheckedChange={() => toggleAction(action.id)}
                            />
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Impact: {action.impact > 0 ? "+" : ""}{action.impact} AQI</span>
                            <span>Cost: ₹{action.cost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {action.enabled && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <Label>Intensity: {action.intensity}%</Label>
                          <span className="text-muted-foreground">
                            Est. Impact: {Math.round(action.impact * (action.intensity / 100))} AQI
                          </span>
                        </div>
                        <Slider
                          value={[action.intensity]}
                          onValueChange={(value) => updateIntensity(action.id, value)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Simulation Controls */}
          <div className="flex gap-3">
            <Button
              onClick={runSimulation}
              disabled={isSimulating || enabledActions.length === 0}
              className="flex-1 gradient-primary border-0"
              size="lg"
            >
              {isSimulating ? (
                <>
                  <div className="animate-spin mr-2">⏳</div>
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
            <Button
              onClick={resetSimulation}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Simulation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enabledActions.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actions Enabled:</span>
                      <span className="font-semibold">{enabledActions.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold">₹{totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">AQI Change:</span>
                      <span className={`font-semibold ${totalImpact < 0 ? "text-success" : "text-destructive"}`}>
                        {totalImpact > 0 ? "+" : ""}{Math.round(totalImpact)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated AQI:</span>
                      <span className="font-semibold">{estimatedAQI}</span>
                    </div>
                  </div>

                  {simulationComplete && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      simulatedAQI! < currentAQI
                        ? "bg-success/10 border border-success/20"
                        : "bg-warning/10 border border-warning/20"
                    }`}>
                      <div className="flex items-start gap-2">
                        {simulatedAQI! < currentAQI ? (
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {simulatedAQI! < currentAQI ? "Policy Effective!" : "Policy Needs Adjustment"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {simulatedAQI! < currentAQI
                              ? `AQI will reduce by ${currentAQI - simulatedAQI!} points`
                              : "Consider adjusting intensity or adding more actions"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Enable at least one action to run simulation
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Ward Comparison Chart */}
      {simulationComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Ward-Wise Impact</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simulationResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="ward" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="current" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Current AQI" />
                <Bar dataKey="simulated" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Simulated AQI" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-2">Why Digital Twin?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              This simulation engine helps government officials make data-driven decisions:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Test policies before spending budget</li>
              <li>• Compare multiple policy combinations</li>
              <li>• Understand cost vs impact trade-offs</li>
              <li>• Prevent ineffective policy implementations</li>
              <li>• Optimize resource allocation</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              <strong className="text-foreground">Note:</strong> Simulations are based on historical data patterns and may vary in real-world implementation.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

