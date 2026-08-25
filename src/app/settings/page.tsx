"use client";

import { useState } from "react";
import { 
  User, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Phone,
  Mail,
  Lock,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "verification" | "notifications" | "subscription">("profile");
  const [saving, setSaving] = useState(false);

  // State
  const [profile, setProfile] = useState({
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43210",
    occupation: "Senior Software Engineer",
    company: "Infosys Technologies",
    bio: "Looking for a quiet, well-maintained apartment in Powai with high-speed internet for hybrid work."
  });

  const [notifications, setNotifications] = useState({
    matchAlerts: true,
    applicationUpdates: true,
    visitReminders: true,
    chatMessages: true,
    marketingEmails: false,
    whatsappAlerts: true,
  });

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated successfully");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your personal profile, verification credentials, and communication preferences.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border/80 pb-3 mb-8 overflow-x-auto">
          {[
            { id: "profile", label: "My Profile", icon: User },
            { id: "verification", label: "Identity & KYC", icon: ShieldCheck },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "subscription", label: "Plan & Billing", icon: CreditCard },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-6 card-elevated p-6 sm:p-8 rounded-2xl">
            <div className="flex items-center gap-4 pb-6 border-b border-border/60">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div>
                <h2 className="font-bold text-lg">{profile.firstName} {profile.lastName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-brand-50/50 text-brand-600 dark:bg-brand-950/50">
                    Tenant Profile
                  </Badge>
                  <span className="text-xs text-muted-foreground">{profile.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">First Name</label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Last Name</label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Email Address</label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Phone Number</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Job Title / Designation</label>
                <Input
                  value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Company Name</label>
                <Input
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Bio & Introductions</label>
              <textarea
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-border/60 flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}

        {/* VERIFICATION / KYC TAB */}
        {activeTab === "verification" && (
          <div className="space-y-6">
            <div className="card-elevated p-6 sm:p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Government ID & Aadhaar KYC</h2>
                    <p className="text-xs text-muted-foreground">Enables verified badge and 3x faster rental approvals</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-500/30 text-green-600 bg-green-500/10">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Your identity was securely verified via Aadhaar OTP on 14 Aug 2025. All personal details are encrypted.
              </p>
            </div>

            <div className="card-elevated p-6 sm:p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Employment & Income Verification</h2>
                    <p className="text-xs text-muted-foreground">Salary slip / Work email domain verification</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-500/30 text-green-600 bg-green-500/10">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified (Infosys)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Verified via corporate email domain (@infosys.com).
              </p>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="card-elevated p-6 sm:p-8 rounded-2xl space-y-6">
            <h2 className="font-bold text-base mb-2">Notification Channels & Alerts</h2>
            
            <div className="divide-y divide-border/60">
              {[
                { key: "matchAlerts", title: "New Property Match Alerts", desc: "Get notified immediately when a 90%+ match is listed" },
                { key: "applicationUpdates", title: "Application Status Updates", desc: "Alerts when your rental application is approved or reviewed" },
                { key: "visitReminders", title: "Visit Schedules & Reminders", desc: "SMS and calendar alerts 2 hours before property inspections" },
                { key: "chatMessages", title: "Direct Chat Messages", desc: "Instant notifications for messages from owners" },
                { key: "whatsappAlerts", title: "WhatsApp Updates", desc: "Receive critical updates directly on WhatsApp" },
              ].map((item) => (
                <div key={item.key} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={(notifications as any)[item.key]}
                    onChange={(e) => {
                      setNotifications({ ...notifications, [item.key]: e.target.checked });
                      toast.success("Notification settings saved");
                    }}
                    className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBSCRIPTION TAB */}
        {activeTab === "subscription" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-elevated p-6 rounded-2xl border-2 border-brand-500">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-brand-600 text-white text-xs">Current Plan</Badge>
                <div className="text-2xl font-bold font-display">₹0<span className="text-xs text-muted-foreground font-normal">/mo</span></div>
              </div>
              <h3 className="font-bold text-lg">NextGen Free</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Unlimited property browsing and AI Mutual Match recommendations.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Unlimited Search & Filters</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Direct Landlord Chat</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Up to 5 Active Applications</li>
              </ul>
            </div>

            <div className="card-elevated p-6 rounded-2xl border border-border/80 bg-gradient-to-b from-brand-500/5 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="border-brand-500/40 text-brand-600">Upgrade</Badge>
                <div className="text-2xl font-bold font-display text-brand-600">₹499<span className="text-xs text-muted-foreground font-normal">/mo</span></div>
              </div>
              <h3 className="font-bold text-lg flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-500" /> NextGen Pro
              </h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Early access to new listings & priority application queue.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> 24hr Early Access to Listings</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> Unlimited Applications</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> Free Digital Rental Agreement</li>
              </ul>
              <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white text-xs">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
