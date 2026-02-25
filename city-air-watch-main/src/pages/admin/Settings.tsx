import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Shield, Bell, Lock, Save,
  Camera, Edit2, CheckCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: localStorage.getItem("userName") || "Admin User",
    email: localStorage.getItem("userEmail") || "admin@cityair.gov.in",
    phone: localStorage.getItem("userPhone") || "+91 98765 43210",
    designation: localStorage.getItem("userDesignation") || "Government Official",
    department: localStorage.getItem("userDepartment") || "Pollution Control Board",
    employeeId: localStorage.getItem("employeeId") || "GOV-2024-001",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    criticalAlerts: true,
    dailyReports: true,
    weeklySummary: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    requirePasswordChange: false,
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save to localStorage
    Object.entries(profile).forEach(([key, value]) => {
      localStorage.setItem(`user${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
    });

    setLoading(false);
    setIsEditing(false);
    toast({
      title: "Profile Updated Successfully! ✅",
      description: "Your profile information has been saved.",
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications({ ...notifications, [key]: value });
    localStorage.setItem(`notification_${key}`, value.toString());
    toast({
      title: "Notification Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleSecurityChange = (key: string, value: string | boolean) => {
    setSecurity({ ...security, [key]: value });
    localStorage.setItem(`security_${key}`, value.toString());
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast({
      title: "Security Settings Saved! 🔒",
      description: "Your security preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Settings & Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, notifications, and security settings
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">Profile Information</h2>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-4 border-border">
              <AvatarImage src="" alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant="outline" size="sm" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            )}
          </div>

          {/* Profile Form */}
          <div className="flex-1 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={profile.designation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, designation: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, department: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <div className="relative mt-1">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="employeeId"
                    value={profile.employeeId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, employeeId: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex-1">
                <Label htmlFor={key} className="font-medium text-foreground cursor-pointer">
                  {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {key === 'emailAlerts' && 'Receive alerts via email'}
                  {key === 'smsAlerts' && 'Receive alerts via SMS'}
                  {key === 'pushNotifications' && 'Browser push notifications'}
                  {key === 'criticalAlerts' && 'Immediate alerts for critical situations'}
                  {key === 'dailyReports' && 'Daily summary reports'}
                  {key === 'weeklySummary' && 'Weekly summary reports'}
                </p>
              </div>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => handleNotificationChange(key, checked)}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">Security Settings</h2>
          </div>
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={handleSaveSecurity}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Security
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex-1">
              <Label htmlFor="twoFactor" className="font-medium text-foreground cursor-pointer">
                Two-Factor Authentication
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="twoFactor"
              checked={security.twoFactor}
              onCheckedChange={(checked) => handleSecurityChange('twoFactor', checked)}
            />
          </div>

          <div className="p-4 rounded-xl bg-muted/50">
            <Label htmlFor="sessionTimeout" className="font-medium text-foreground mb-2 block">
              Session Timeout (minutes)
            </Label>
            <Select
              value={security.sessionTimeout}
              onValueChange={(value) => handleSecurityChange('sessionTimeout', value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Automatically log out after inactivity
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex-1">
              <Label htmlFor="requirePasswordChange" className="font-medium text-foreground cursor-pointer">
                Require Password Change
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Force password change on next login
              </p>
            </div>
            <Switch
              id="requirePasswordChange"
              checked={security.requirePasswordChange}
              onCheckedChange={(checked) => handleSecurityChange('requirePasswordChange', checked)}
            />
          </div>

          <Separator className="my-4" />

          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Change Password</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Update your password to keep your account secure
                </p>
                <Button variant="outline" size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-2">Account Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Role: Government Official</p>
              <p>• Access Level: Admin</p>
              <p>• Account Created: January 2024</p>
              <p>• Last Login: Today at 9:30 AM</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

