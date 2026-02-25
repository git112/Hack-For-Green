import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, CheckCircle, Loader2, AlertTriangle, Sparkles, MapPin, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type ReportState = "idle" | "uploading" | "analyzing" | "detected" | "submitted";

const detectionResults = [
  { type: "Garbage Burning", pollutionType: "garbage_burn", confidence: 98, severity: "high" },
  { type: "Industrial Smoke", pollutionType: "smoke", confidence: 92, severity: "high" },
  { type: "Vehicle Emission", pollutionType: "traffic", confidence: 87, severity: "medium" },
  { type: "Construction Dust", pollutionType: "dust", confidence: 95, severity: "medium" },
];

const wards = [
  "Ward 1 - Central",
  "Ward 2 - North",
  "Ward 3 - Traffic Hub",
  "Ward 4 - East",
  "Ward 5 - West",
  "Ward 6 - Industrial",
  "Ward 7 - South",
  "Ward 8 - Market Area",
];

export default function AIReport() {
  const [state, setState] = useState<ReportState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detection, setDetection] = useState<typeof detectionResults[0] | null>(null);
  const [description, setDescription] = useState("");
  const [ward, setWard] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: "Location Captured! 📍",
            description: "Your location has been recorded with the report",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your location. You can still submit the report.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Start upload process
      setState("uploading");

      // Simulate upload
      setTimeout(() => {
        setState("analyzing");
        getCurrentLocation();

        // Simulate AI analysis
        setTimeout(() => {
          // Random detection result
          const randomResult = detectionResults[Math.floor(Math.random() * detectionResults.length)];
          setDetection(randomResult);
          setState("detected");
        }, 2500);
      }, 1000);
    }
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!ward || !detection) {
      toast({
        title: "Missing Information",
        description: "Please ensure ward is selected and AI detection is complete",
        variant: "destructive",
      });
      return;
    }

    setState("uploading");

    try {
      const token = localStorage.getItem("token");
      const reportData = {
        title: `${detection.type} in ${ward}`,
        description: description || `AI detected ${detection.type} with ${detection.confidence}% confidence`,
        pollutionType: detection.pollutionType,
        severity: detection.severity,
        wardName: ward,
        address: address || "Address not provided",
        location: location ? `${location.lat},${location.lng}` : undefined,
        photos: imagePreview ? [imagePreview] : [],
        aiConfidence: detection.confidence,
      };

      const response = await fetch("import.meta.env.VITE_API_URL/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit report");
      }

      // Update local storage for points/credits for immediate feedback
      const currentCredits = parseInt(localStorage.getItem("greenPoints") || "0");
      localStorage.setItem("greenPoints", (currentCredits + 50).toString());

      const reportCount = parseInt(localStorage.getItem("reportsSubmitted") || "0");
      localStorage.setItem("reportsSubmitted", (reportCount + 1).toString());

      setState("submitted");

      toast({
        title: "Report Submitted Successfully! 🎉",
        description: "+50 Credits earned for your contribution!",
      });

      // Trigger event for admin dashboard to refresh locally if needed
      window.dispatchEvent(new CustomEvent("newReportSubmitted", { detail: data.data }));
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
      setState("detected"); // Go back to detected state to retry
    }
  };

  const handleReset = () => {
    setState("idle");
    setSelectedFile(null);
    setImagePreview(null);
    setDetection(null);
    setDescription("");
    setWard("");
    setAddress("");
    setLocation(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          AI-Powered Report
        </h1>
        <p className="text-muted-foreground mt-1">
          Snap a photo and let AI detect pollution sources instantly
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Upload or Capture Photo
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Take a photo of any pollution source - garbage burning, smoke, dust, or emissions
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleTakePhoto} className="gradient-primary border-0">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline" onClick={handleUploadPhoto}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.div>
          )}

          {(state === "uploading" || state === "analyzing") && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-primary/50 animate-pulse" />
                <div className="absolute inset-2 rounded-xl bg-card flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-semibold text-foreground">
                  {state === "uploading" ? "Uploading..." : "AI Detecting..."}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {state === "uploading"
                  ? "Preparing your image for analysis"
                  : "Scanning for pollution sources using AI"}
              </p>
            </motion.div>
          )}

          {state === "detected" && detection && (
            <motion.div
              key="detected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-xl border border-warning/30">
                <AlertTriangle className="w-6 h-6 text-warning" />
                <div>
                  <p className="font-semibold text-foreground">{detection.type} Detected!</p>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {detection.confidence}%
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              <div className="aspect-video rounded-xl bg-muted flex items-center justify-center overflow-hidden relative">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Uploaded pollution report"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                          if (cameraInputRef.current) cameraInputRef.current.value = "";
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No image selected</p>
                  </div>
                )}
              </div>

              {/* Additional Report Details */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <Label htmlFor="ward">Ward Location *</Label>
                  <Select value={ward} onValueChange={setWard}>
                    <SelectTrigger className="bg-background mt-1">
                      <SelectValue placeholder="Select your ward" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border">
                      {wards.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Address / Location Details</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Enter specific address or landmark"
                      value={address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {location && (
                    <p className="text-xs text-success mt-1">
                      ✓ Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Additional Details (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any additional information about the pollution incident..."
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    className="mt-1 min-h-24"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  Retake Photo
                </Button>
                <Button
                  className="flex-1 gradient-primary border-0"
                  onClick={handleSubmit}
                  disabled={!ward || !detection}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Report to Admin
                </Button>
              </div>
            </motion.div>
          )}

          {state === "submitted" && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Report Submitted!
              </h3>
              <p className="text-muted-foreground mb-2">
                Thank you for helping keep our city clean.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full font-semibold"
              >
                +50 Credits Earned! 🎉
              </motion.div>
              <div className="mt-8">
                <Button variant="outline" onClick={handleReset}>
                  Submit Another Report
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-muted/50 rounded-2xl p-6"
      >
        <h4 className="font-semibold text-foreground mb-3">📸 Tips for Better Reports</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Ensure good lighting for clearer detection</li>
          <li>• Include the pollution source clearly in frame</li>
          <li>• Take photos during daylight when possible</li>
          <li>• Add location details for faster response</li>
        </ul>
      </motion.div>
    </div>
  );
}
