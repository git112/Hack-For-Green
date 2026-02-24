import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye, Clock, CheckCircle, MapPin, Image,
  ChevronDown, User, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

// Helper function to format time ago
interface Report {
  id: string;
  title?: string;
  address?: string;
  ward?: string;
  citizenName?: string;
  reportedBy?: string;
  timestamp?: string;
  time?: string;
  status?: string;
  severity?: string;
  photos?: string[];
  description?: string;
  pollutionType?: string;
  aiConfidence?: number;
  aiAnalysis?: { confidence?: number };
  assignedTo?: string;
}
const getTimeAgo = (timestamp: string) => {
  const now = new Date();
  const reportDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - reportDate.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

// Default tasks
const defaultTasks = [
  {
    id: "1",
    title: "Garbage Burning in Ward 12",
    location: "Near Market Road, Ward 12",
    reportedBy: "Citizen #4521",
    time: "2 hours ago",
    status: "new" as const,
    severity: "high" as const,
    hasEvidence: true,
    photos: [],
    description: "",
    pollutionType: "garbage_burn",
    aiConfidence: 95,
    ward: "Ward 12 - Construction",
  },
  {
    id: "2",
    title: "Industrial Smoke Emission",
    location: "Industrial Area, Ward 6",
    reportedBy: "Citizen #3892",
    time: "4 hours ago",
    status: "in_progress" as const,
    severity: "high" as const,
    hasEvidence: true,
    photos: [],
    description: "",
    pollutionType: "smoke",
    aiConfidence: 92,
    ward: "Ward 6 - Industrial",
  },
  {
    id: "3",
    title: "Construction Dust",
    location: "Highway Extension, Ward 3",
    reportedBy: "Citizen #2156",
    time: "1 day ago",
    status: "in_progress" as const,
    severity: "medium" as const,
    hasEvidence: true,
    photos: [],
    description: "",
    pollutionType: "dust",
    aiConfidence: 89,
    ward: "Ward 3 - Traffic Hub",
  },
  {
    id: "4",
    title: "Vehicle Emission Complaint",
    location: "Bus Stand, Ward 8",
    reportedBy: "Citizen #5621",
    time: "2 days ago",
    status: "resolved" as const,
    severity: "low" as const,
    hasEvidence: false,
    photos: [],
    description: "",
    pollutionType: "traffic",
    aiConfidence: 85,
    ward: "Ward 8 - Market Area",
  },
];

// Convert localStorage reports to task format
const loadReportsFromStorage = () => {
  const storedReports = localStorage.getItem("adminReports");
  const defaultReports = defaultTasks;

  if (!storedReports) {
    // Initialize with default tasks
    localStorage.setItem("adminReports", JSON.stringify(defaultReports));
    return defaultReports;
  }

  const reports = JSON.parse(storedReports);
  const convertedReports = reports.map((report: Report) => ({
    id: report.id,
    title: report.title,
    location: report.address || report.ward,
    reportedBy: report.citizenName || report.reportedBy || "Citizen",
    time: report.timestamp ? getTimeAgo(report.timestamp) : report.time || "Recently",
    status: (report.status || "new") as "new" | "in_progress" | "resolved",
    severity: (report.severity || "medium") as "low" | "medium" | "high" | "critical",
    hasEvidence: report.photos && report.photos.length > 0,
    photos: report.photos || [],
    description: report.description || "",
    pollutionType: report.pollutionType || "other",
    aiConfidence: report.aiConfidence || report.aiAnalysis?.confidence || 0,
    ward: report.ward || "",
  }));

  // Merge with defaults if new reports exist
  return convertedReports.length > defaultReports.length ? convertedReports : defaultReports;
};

const statusColors = {
  new: "bg-destructive text-destructive-foreground",
  in_progress: "bg-warning text-warning-foreground",
  resolved: "bg-success text-success-foreground",
};

const statusLabels = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function ActionCenter() {
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [assignedCrews, setAssignedCrews] = useState<{ [key: string]: string }>({});
  const [tasks, setTasks] = useState(loadReportsFromStorage());
  const [viewImage, setViewImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Load reports on mount and listen for new reports
  useEffect(() => {
    const loadReports = () => {
      const newTasks = loadReportsFromStorage();
      setTasks(newTasks);
    };

    loadReports();

    // Listen for new report submissions
    const handleNewReport = () => {
      loadReports();
      toast({
        title: "New Report Received! 📢",
        description: "A new citizen report has been submitted",
      });
    };

    window.addEventListener('newReportSubmitted', handleNewReport);

    // Refresh every 5 seconds to check for new reports
    const interval = setInterval(loadReports, 5000);

    return () => {
      window.removeEventListener('newReportSubmitted', handleNewReport);
      clearInterval(interval);
    };
  }, [toast]);

  const handleAssignCrew = (taskId: string, crew: string) => {
    setAssignedCrews({ ...assignedCrews, [taskId]: crew });

    // Update task status in localStorage
    const reports = JSON.parse(localStorage.getItem("adminReports") || "[]");
    const updatedReports = reports.map((report: Report) => {
      if (report.id === taskId) {
        return { ...report, status: "in_progress", assignedTo: crew };
      }
      return report;
    });
    localStorage.setItem("adminReports", JSON.stringify(updatedReports));

    // Update local tasks state
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: "in_progress" as const }
        : task
    ));

    toast({
      title: "Crew Assigned Successfully! ✅",
      description: `${crew} has been assigned to this task`,
    });
  };

  const filteredTasks = filter === "all"
    ? tasks
    : tasks.filter(t => t.status === filter);

  const getTaskPhotos = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.photos || [];
  };

  const columns = {
    new: filteredTasks.filter(t => t.status === "new"),
    in_progress: filteredTasks.filter(t => t.status === "in_progress"),
    resolved: filteredTasks.filter(t => t.status === "resolved"),
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Action Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and resolve citizen reports
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="bg-card border border-border">
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {(["new", "in_progress", "resolved"] as const).map((status) => (
          <div key={status} className="bg-card/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[status]}`}>
                  {statusLabels[status]}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({columns[status].length})
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {columns[status].map((task) => (
                <motion.div
                  key={task.id}
                  layoutId={`task-${task.id}`}
                  className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
                    {task.severity === "high" && (
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{task.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{task.reportedBy}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{task.time}</span>
                    </div>
                  </div>

                  {selectedTask === task.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      {task.hasEvidence && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mb-2"
                              onClick={() => setViewImage(task.id)}
                            >
                              <Image className="w-4 h-4 mr-2" />
                              View Evidence ({getTaskPhotos(task.id).length} photo{getTaskPhotos(task.id).length > 1 ? 's' : ''})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-card border-border">
                            <DialogHeader>
                              <DialogTitle>Evidence Photos</DialogTitle>
                              <DialogDescription>
                                AI Detection: {tasks.find(t => t.id === task.id)?.pollutionType} (Confidence: {tasks.find(t => t.id === task.id)?.aiConfidence}%)
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {getTaskPhotos(task.id).map((photo: string, idx: number) => (
                                <div key={idx} className="rounded-lg overflow-hidden border border-border">
                                  <img
                                    src={photo}
                                    alt={`Evidence ${idx + 1}`}
                                    className="w-full h-auto max-h-96 object-contain bg-muted"
                                  />
                                </div>
                              ))}
                              {getTaskPhotos(task.id).length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No photos available</p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Select
                        value={assignedCrews[task.id] || ""}
                        onValueChange={(value) => handleAssignCrew(task.id, value)}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Assign Crew" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border">
                          <SelectItem value="crew1">Cleanup Crew A</SelectItem>
                          <SelectItem value="crew2">Cleanup Crew B</SelectItem>
                          <SelectItem value="crew3">Inspection Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {columns[status].length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No reports
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
