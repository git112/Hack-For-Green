import { motion } from "framer-motion";
import { BarChart3, TrendingDown, Download, Calendar, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

const monthlyData = [
  { month: "Jan", aqi: 180 },
  { month: "Feb", aqi: 165 },
  { month: "Mar", aqi: 155 },
  { month: "Apr", aqi: 148 },
  { month: "May", aqi: 142 },
  { month: "Jun", aqi: 135 },
  { month: "Jul", aqi: 145 },
  { month: "Aug", aqi: 138 },
  { month: "Sep", aqi: 132 },
  { month: "Oct", aqi: 128 },
  { month: "Nov", aqi: 140 },
  { month: "Dec", aqi: 142 },
];

const sourceData = [
  { name: "Traffic", value: 35, color: "hsl(var(--destructive))" },
  { name: "Industry", value: 28, color: "hsl(var(--warning))" },
  { name: "Construction", value: 18, color: "hsl(var(--primary))" },
  { name: "Garbage", value: 12, color: "hsl(var(--muted-foreground))" },
  { name: "Other", value: 7, color: "hsl(var(--success))" },
];

const wardComparison = [
  { ward: "Ward 1", current: 85, previous: 95 },
  { ward: "Ward 2", current: 65, previous: 78 },
  { ward: "Ward 3", current: 156, previous: 145 },
  { ward: "Ward 4", current: 120, previous: 135 },
  { ward: "Ward 5", current: 98, previous: 110 },
  { ward: "Ward 6", current: 210, previous: 195 },
];

export default function Analytics() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;

    setIsExporting(true);
    toast({
      title: "Generating PDF",
      description: "Capturing dashboard analytics...",
    });

    try {
      const element = dashboardRef.current;

      const canvas = await html2canvas(element, {
        scale: 1.5, // Slightly lower scale to avoid memory issues on some browsers
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff", // Use hex for reliability
        logging: false,
        onclone: (clonedDoc) => {
          // Hide elements with the 'no-export' class during capture
          const elementsToHide = clonedDoc.querySelectorAll('.no-export');
          elementsToHide.forEach(el => {
            (el as HTMLElement).style.visibility = 'hidden';
          });
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate scaled dimensions to fit A4 with margins
      const margin = 10;
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - 40; // Space for title

      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const xOffset = (pdfWidth - finalWidth) / 2;

      pdf.setFontSize(18);
      pdf.setTextColor(40, 40, 40);
      pdf.text("City Air Watch - Analytics Report", 105, 15, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: "center" });

      pdf.addImage(imgData, "JPEG", xOffset, 30, finalWidth, finalHeight);
      pdf.save(`CityAirWatch_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Export Successful",
        description: "Your analytics report has been downloaded.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6" ref={dashboardRef}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track pollution trends and measure impact
          </p>
        </div>
        <div className="flex gap-3 no-export"> {/* no-export class if we want to hide it in canvas, but html2canvas needs extra config for that */}
          <Select defaultValue="year">
            <SelectTrigger className="w-36 bg-card">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="no-export" // Add class to hide in PDF
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-success mb-2">
            <TrendingDown className="w-5 h-5" />
            <span className="text-sm font-medium">23% Improvement</span>
          </div>
          <p className="font-display text-2xl font-bold text-foreground">142 AQI</p>
          <p className="text-sm text-muted-foreground">Current City Average</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-2">Reports Resolved</p>
          <p className="font-display text-2xl font-bold text-foreground">12,458</p>
          <p className="text-sm text-success">+18% from last year</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground mb-2">Green Credits Issued</p>
          <p className="font-display text-2xl font-bold text-foreground">2.5M</p>
          <p className="text-sm text-success">+45% from last year</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Monthly AQI Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorAqi)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pollution Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Pollution Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {sourceData.map((source) => (
              <div key={source.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-muted-foreground">{source.name}</span>
                </div>
                <span className="font-medium text-foreground">{source.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Ward Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">Ward Comparison (Current vs Previous Month)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardComparison}>
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
              <Bar dataKey="previous" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Previous Month" />
              <Bar dataKey="current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Current Month" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
