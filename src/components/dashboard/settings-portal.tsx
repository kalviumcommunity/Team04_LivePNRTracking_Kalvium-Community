"use client";
// Settings & Security Portal Component

import { useState, useEffect } from "react";
import { 
  applyTheme, 
  getSavedTheme, 
  ThemeMode, 
  applyTextScaling, 
  getSavedTextScaling, 
  TextScaleMode,
  applyReducedMotion,
  getSavedReducedMotion,
  applyHighContrast,
  getSavedHighContrast
} from "@/lib/theme-utils";
import { updateProfile, changePassword } from "@/actions/settings";
import { SUPPORTED_LANGUAGES, getSavedLanguage, setSavedLanguage, LanguageCode, useTranslation } from "@/lib/i18n";
import {
  User,
  Shield,
  Sliders,
  Bell,
  Code,
  Lock,
  Smartphone,
  Key,
  Webhook,
  LogOut,
  Trash2,
  Check,
  Copy,
  Plus,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  Monitor,
  Moon,
  Sun,
  CheckCircle2,
  History,
  HardDrive
} from "lucide-react";

interface SettingsPortalProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  onProfileUpdate?: (name: string, email: string) => void;
}

type TabType = "account" | "security" | "preferences" | "notifications" | "developer" | "privacy";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface AuditLogItem {
  id: string;
  action: string;
  ip: string;
  location: string;
  timestamp: string;
  status: "Success" | "Warning" | "Failed";
}

export function SettingsPortal({ user, onProfileUpdate }: SettingsPortalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("account");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Profile State ---
  const [name, setName] = useState(user?.name || "Akhilan TS");
  const [username, setUsername] = useState("akhilants134");
  const [email, setEmail] = useState(user?.email || "akhilants134@gmail.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [bio, setBio] = useState("Railway enthusiast & software engineer.");

  // --- Security State ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"app" | "sms">("app");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [whitelistedIp, setWhitelistedIp] = useState("192.168.1.100");
  const [ipList, setIpList] = useState<string[]>(["192.168.1.100", "10.0.0.45"]);

  const [sessions, setSessions] = useState<ActiveSession[]>([
    { id: "s1", device: "Chrome on macOS (MacBook Pro)", location: "Bengaluru, India", ip: "103.45.12.98", lastActive: "Active Now", isCurrent: true },
    { id: "s2", device: "Railway PNR iOS App (iPhone 15)", location: "Bengaluru, India", ip: "49.207.210.14", lastActive: "2 hours ago", isCurrent: false },
    { id: "s3", device: "Firefox on Windows 11", location: "New Delhi, India", ip: "122.160.34.12", lastActive: "3 days ago", isCurrent: false },
  ]);

  const [auditLogs] = useState<AuditLogItem[]>([
    { id: "log-1", action: "Password changed successfully", ip: "103.45.12.98", location: "Bengaluru, IN", timestamp: "Today at 1:45 PM", status: "Success" },
    { id: "log-2", action: "2FA Authentication code verified", ip: "103.45.12.98", location: "Bengaluru, IN", timestamp: "Today at 1:40 PM", status: "Success" },
    { id: "log-3", action: "Failed login attempt (Wrong password)", ip: "49.207.210.14", location: "Mumbai, IN", timestamp: "Yesterday at 9:12 PM", status: "Warning" },
    { id: "log-4", action: "New API key generated: Production-Server", ip: "103.45.12.98", location: "Bengaluru, IN", timestamp: "18 Jul 2026", status: "Success" },
  ]);

  // --- Preferences State ---
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getSavedTheme());
  const [language, setLanguage] = useState<LanguageCode>(() => getSavedLanguage());
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST +5:30)");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [reducedMotion, setReducedMotion] = useState(() => getSavedReducedMotion());
  const [highContrast, setHighContrast] = useState(() => getSavedHighContrast());
  const [fontSize, setFontSize] = useState<TextScaleMode>(() => getSavedTextScaling());

  // --- Notifications State ---
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pnrStatusUpdates, setPnrStatusUpdates] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("instant");

  // --- Developer State ---
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: "k1", name: "Live PNR Tracker API", key: "sk_live_pnr_98f71a93e8201a", created: "15 Jun 2026", lastUsed: "10 mins ago" },
    { id: "k2", name: "Station Manifest Sync", key: "sk_live_pnr_33c842b109e44d", created: "01 Jul 2026", lastUsed: "2 days ago" },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState("https://api.yourdomain.com/webhooks/pnr");
  const [webhookEvents, setWebhookEvents] = useState({
    pnrStatusChange: true,
    delayAlert: true,
    bookingCreated: false,
    staffAction: true,
  });

  // --- Privacy State ---
  const [profileVisibility, setProfileVisibility] = useState<"public" | "private">("public");
  const [shareHistory, setShareHistory] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [dataRetention, setDataRetention] = useState("90");

  const userKey = user?.email || "default";

  useEffect(() => {
    const savedName = localStorage.getItem(`profile_name_${userKey}`);
    const savedUsername = localStorage.getItem(`profile_username_${userKey}`);
    const savedEmail = localStorage.getItem(`profile_email_${userKey}`);
    const savedPhone = localStorage.getItem(`profile_phone_${userKey}`);
    const savedBio = localStorage.getItem(`profile_bio_${userKey}`);

    // 2FA & Security
    const saved2FaEnabled = localStorage.getItem(`security_2fa_enabled_${userKey}`);
    const saved2FaMethod = localStorage.getItem(`security_2fa_method_${userKey}`);
    const savedSessionTimeout = localStorage.getItem(`security_session_timeout_${userKey}`);
    const savedIpList = localStorage.getItem(`security_ip_list_${userKey}`);
    const savedSessions = localStorage.getItem(`security_sessions_${userKey}`);

    // Notifications
    const savedEmailAlerts = localStorage.getItem(`notify_email_alerts_${userKey}`);
    const savedPushAlerts = localStorage.getItem(`notify_push_alerts_${userKey}`);
    const savedSmsAlerts = localStorage.getItem(`notify_sms_alerts_${userKey}`);
    const savedPnrUpdates = localStorage.getItem(`notify_pnr_updates_${userKey}`);
    const savedDelayAlerts = localStorage.getItem(`notify_delay_alerts_${userKey}`);
    const savedMarketingAlerts = localStorage.getItem(`notify_marketing_alerts_${userKey}`);
    const savedDigestFreq = localStorage.getItem(`notify_digest_freq_${userKey}`);

    // Developer API
    const savedApiKeys = localStorage.getItem(`dev_api_keys_${userKey}`);
    const savedWebhookUrl = localStorage.getItem(`dev_webhook_url_${userKey}`);
    const savedWebhookEvents = localStorage.getItem(`dev_webhook_events_${userKey}`);

    // Privacy
    const savedVisibility = localStorage.getItem(`privacy_visibility_${userKey}`);
    const savedShareHistory = localStorage.getItem(`privacy_share_history_${userKey}`);
    const savedAnalyticsConsent = localStorage.getItem(`privacy_analytics_consent_${userKey}`);
    const savedRetention = localStorage.getItem(`privacy_retention_${userKey}`);

    setTimeout(() => {
      setName(savedName || user?.name || "User");
      if (savedUsername) setUsername(savedUsername);
      setEmail(savedEmail || user?.email || "");
      if (savedPhone) setPhone(savedPhone);
      if (savedBio) setBio(savedBio);

      if (saved2FaEnabled !== null) setTwoFactorEnabled(saved2FaEnabled === "true");
      if (saved2FaMethod) setTwoFactorMethod(saved2FaMethod as "app" | "sms");
      if (savedSessionTimeout) setSessionTimeout(savedSessionTimeout);
      if (savedIpList) setIpList(JSON.parse(savedIpList));
      if (savedSessions) setSessions(JSON.parse(savedSessions));

      if (savedEmailAlerts !== null) setEmailAlerts(savedEmailAlerts === "true");
      if (savedPushAlerts !== null) setPushAlerts(savedPushAlerts === "true");
      if (savedSmsAlerts !== null) setSmsAlerts(savedSmsAlerts === "true");
      if (savedPnrUpdates !== null) setPnrStatusUpdates(savedPnrUpdates === "true");
      if (savedDelayAlerts !== null) setDelayAlerts(savedDelayAlerts === "true");
      if (savedMarketingAlerts !== null) setMarketingAlerts(savedMarketingAlerts === "true");
      if (savedDigestFreq) setDigestFrequency(savedDigestFreq);

      if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys));
      if (savedWebhookUrl) setWebhookUrl(savedWebhookUrl);
      if (savedWebhookEvents) setWebhookEvents(JSON.parse(savedWebhookEvents));

      if (savedVisibility) setProfileVisibility(savedVisibility as "public" | "private");
      if (savedShareHistory !== null) setShareHistory(savedShareHistory === "true");
      if (savedAnalyticsConsent !== null) setAnalyticsConsent(savedAnalyticsConsent === "true");
      if (savedRetention) setDataRetention(savedRetention);
    }, 0);
  }, [userKey, user?.name, user?.email]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.");
      return;
    }

    try {
      const res = await changePassword({
        current: currentPassword,
        newPass: newPassword,
      });

      if (res.error) {
        showToast(res.error);
      } else {
        showToast(res.success || "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred. Please try again.");
    }
  };

  const handleRevokeSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem("security_sessions", JSON.stringify(updated));
    showToast("Session logged out successfully.");
  };

  const handleRevokeAllOtherSessions = () => {
    const updated = sessions.filter((s) => s.isCurrent);
    setSessions(updated);
    localStorage.setItem("security_sessions", JSON.stringify(updated));
    showToast("All other active sessions have been terminated.");
  };

  const handleGenerateApiKey = () => {
    if (!newKeyName.trim()) {
      showToast("Please enter an API key name.");
      return;
    }
    const freshKey: ApiKey = {
      id: `k-${Date.now()}`,
      name: newKeyName.trim(),
      key: `sk_live_pnr_${Math.random().toString(36).substring(2, 16)}`,
      created: "Just now",
      lastUsed: "Never",
    };
    const updated = [...apiKeys, freshKey];
    setApiKeys(updated);
    localStorage.setItem("dev_api_keys", JSON.stringify(updated));
    setNewKeyName("");
    setShowKeyModal(false);
    showToast(`API Key "${freshKey.name}" created!`);
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    showToast("API Key copied to clipboard!");
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleRevokeApiKey = (id: string) => {
    const updated = apiKeys.filter((k) => k.id !== id);
    setApiKeys(updated);
    localStorage.setItem("dev_api_keys", JSON.stringify(updated));
    showToast("API Key revoked.");
  };

  const handleAddIp = () => {
    if (!whitelistedIp || ipList.includes(whitelistedIp)) return;
    const updated = [...ipList, whitelistedIp];
    setIpList(updated);
    localStorage.setItem("security_ip_list", JSON.stringify(updated));
    setWhitelistedIp("");
    showToast("IP address whitelisted.");
  };

  const handleRemoveIp = (ip: string) => {
    const updated = ipList.filter((item) => item !== ip);
    setIpList(updated);
    localStorage.setItem("security_ip_list", JSON.stringify(updated));
    showToast("IP address removed from whitelist.");
  };

  const handleExportData = () => {
    const userData = {
      profile: { name, username, email, phone, bio },
      security: { twoFactorEnabled, twoFactorMethod, sessionTimeout, whitelistedIps: ipList },
      preferences: { themeMode, language, timezone, dateFormat, fontSize, reducedMotion, highContrast },
      notifications: { emailAlerts, pushAlerts, smsAlerts, pnrStatusUpdates, delayAlerts, marketingAlerts, digestFrequency },
      developer: { webhookUrl, webhookEvents },
      privacy: { profileVisibility, shareHistory, analyticsConsent, dataRetention },
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pnr-tracking-user-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("User data export started!");
  };

  const handleSaveChanges = async () => {
    localStorage.setItem(`profile_name_${userKey}`, name);
    localStorage.setItem(`profile_username_${userKey}`, username);
    localStorage.setItem(`profile_email_${userKey}`, email);
    localStorage.setItem(`profile_phone_${userKey}`, phone);
    localStorage.setItem(`profile_bio_${userKey}`, bio);

    // Save security settings
    localStorage.setItem(`security_2fa_enabled_${userKey}`, String(twoFactorEnabled));
    localStorage.setItem(`security_2fa_method_${userKey}`, twoFactorMethod);
    localStorage.setItem(`security_session_timeout_${userKey}`, sessionTimeout);
    localStorage.setItem(`security_ip_list_${userKey}`, JSON.stringify(ipList));
    localStorage.setItem(`security_sessions_${userKey}`, JSON.stringify(sessions));

    // Save notification preferences
    localStorage.setItem(`notify_email_alerts_${userKey}`, String(emailAlerts));
    localStorage.setItem(`notify_push_alerts_${userKey}`, String(pushAlerts));
    localStorage.setItem(`notify_sms_alerts_${userKey}`, String(smsAlerts));
    localStorage.setItem(`notify_pnr_updates_${userKey}`, String(pnrStatusUpdates));
    localStorage.setItem(`notify_delay_alerts_${userKey}`, String(delayAlerts));
    localStorage.setItem(`notify_marketing_alerts_${userKey}`, String(marketingAlerts));
    localStorage.setItem(`notify_digest_freq_${userKey}`, digestFrequency);

    // Save developer settings
    localStorage.setItem(`dev_api_keys_${userKey}`, JSON.stringify(apiKeys));
    localStorage.setItem(`dev_webhook_url_${userKey}`, webhookUrl);
    localStorage.setItem(`dev_webhook_events_${userKey}`, JSON.stringify(webhookEvents));

    // Save privacy settings
    localStorage.setItem(`privacy_visibility_${userKey}`, profileVisibility);
    localStorage.setItem(`privacy_share_history_${userKey}`, String(shareHistory));
    localStorage.setItem(`privacy_analytics_consent_${userKey}`, String(analyticsConsent));
    localStorage.setItem(`privacy_retention_${userKey}`, dataRetention);

    try {
      const res = await updateProfile({ name, email });
      if (res.error) {
        showToast(`Error: ${res.error}`);
      } else {
        showToast(res.success || "All settings saved and synchronized with server.");
        if (onProfileUpdate) {
          onProfileUpdate(name, email);
        }
      }
    } catch {
      showToast("Failed to save changes.");
    }
  };

  const { t } = useTranslation();

  const tabs = [
    { id: "account" as TabType, name: t("accountProfile"), icon: User, desc: "Personal info & username" },
    { id: "security" as TabType, name: t("securityLogin"), icon: Shield, desc: "Password, 2FA, Sessions & Logs" },
    { id: "preferences" as TabType, name: t("preferences"), icon: Sliders, desc: "Theme, Language & Accessibility" },
    { id: "notifications" as TabType, name: t("notifications"), icon: Bell, desc: "Alert channels & PNR updates" },
    { id: "developer" as TabType, name: t("developerApi"), icon: Code, desc: "API keys & Webhook subscriptions" },
    { id: "privacy" as TabType, name: t("privacyStorage"), icon: Lock, desc: "Visibility, Export & Data Retention" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eaddcd] dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("systemSettingsTitle")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your account identity, multi-factor authentication, security policies, API credentials, and preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-[#c05621] hover:bg-[#a8481b] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {t("saveChanges")}
          </button>
        </div>
      </div>

      {/* Grid Layout: Left Tabs + Main Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Category Tabs */}
        <div className="lg:col-span-4 bg-[#faf8f5] dark:bg-slate-900/60 p-2.5 rounded-2xl border border-[#eaddcd] dark:border-slate-800 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                  isActive
                    ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm border border-[#e2d5c3] dark:border-slate-800"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/40"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isActive
                      ? "bg-[#c05621] text-white"
                      : "bg-amber-100/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{t.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-[#eaddcd] dark:border-slate-800 shadow-xs">
          {/* TAB 1: ACCOUNT / PROFILE */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("accountProfileSettings")}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("accountProfileDesc")}</p>
              </div>

              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#faf8f5] dark:bg-slate-900 border border-[#f2eae1] dark:border-slate-800">
                <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{name}</h3>
                  <p className="text-xs text-slate-500">@{username} • {user?.role || t("passenger")}</p>
                  <button
                    onClick={() => showToast("Avatar upload modal opened.")}
                    className="mt-2 text-[11px] font-semibold text-[#c05621] hover:underline"
                  >
                    {t("changeProfilePicture")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("fullName")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("username")}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("emailAddress")}</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {t("verified")}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("phoneNumber")}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("bioNotes")}</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-hidden resize-none"
                />
              </div>

              {/* Danger Zone */}
              <div className="border-t border-red-100 dark:border-red-950/40 pt-5 mt-6">
                <h4 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> {t("dangerZone")}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t("dangerZoneDesc")}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => showToast("Account deactivation requested. Confirmation email sent.")}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/50 dark:hover:bg-red-900/60 dark:text-red-300 text-xs font-semibold rounded-lg transition-all"
                  >
                    {t("deactivateAccount")}
                  </button>
                  <button
                    onClick={() => showToast("Data deletion modal initialized.")}
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-all"
                  >
                    {t("deleteAccountData")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & LOGIN */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Security Controls & Authentication</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure password strength, 2FA, session timeout, IP whitelisting, and view active sessions.</p>
              </div>

              {/* Password Management */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <Key className="w-4 h-4" /> Password Management
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-hidden"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPassword ? "Hide passwords" : "Show passwords"}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* Two-Factor Authentication (2FA) */}
              <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-slate-900 border border-[#f2eae1] dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                      <p className="text-[11px] text-slate-500">Require an authenticator code or SMS during sign-in.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => {
                        setTwoFactorEnabled(e.target.checked);
                        showToast(e.target.checked ? "2FA Protection Enabled." : "2FA Protection Disabled.");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {twoFactorEnabled && (
                  <div className="pt-2 flex items-center gap-4 border-t border-slate-200/60 dark:border-slate-800">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="2fa-method"
                        checked={twoFactorMethod === "app"}
                        onChange={() => setTwoFactorMethod("app")}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      Authenticator App (TOTP)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="2fa-method"
                        checked={twoFactorMethod === "sms"}
                        onChange={() => setTwoFactorMethod("sms")}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      SMS Security Code
                    </label>
                  </div>
                )}
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> Active Device Sessions
                  </h3>
                  <button
                    onClick={handleRevokeAllOtherSessions}
                    className="text-[11px] text-red-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log out all other sessions
                  </button>
                </div>

                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/50"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {s.device}
                          {s.isCurrent && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {s.location} • IP: {s.ip} • Last active: {s.lastActive}
                        </div>
                      </div>
                      {!s.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="text-[11px] text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-red-950 px-2 py-1 rounded-lg"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Security: Timeout & IP Whitelist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white">Session Idle Timeout</label>
                  <p className="text-[10px] text-slate-500">Automatically sign out after idle period.</p>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => {
                      setSessionTimeout(e.target.value);
                      showToast(`Idle timeout set to ${e.target.value} minutes.`);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="60">1 Hour</option>
                    <option value="240">4 Hours</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white">IP Whitelisting</label>
                  <p className="text-[10px] text-slate-500">Restrict admin/staff API & portal access.</p>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1.100"
                      value={whitelistedIp}
                      onChange={(e) => setWhitelistedIp(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddIp}
                      className="px-2.5 py-1.5 bg-[#c05621] text-white text-xs font-bold rounded-lg hover:bg-[#a8481b]"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ipList.map((ip) => (
                      <span key={ip} className="inline-flex items-center gap-1 text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                        {ip}
                        <button type="button" onClick={() => handleRemoveIp(ip)} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security Audit Trail */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <History className="w-4 h-4" /> Security Audit Log
                </h3>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2.5">Event Action</th>
                        <th className="p-2.5">IP & Location</th>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="p-2.5 font-medium text-slate-900 dark:text-white">{log.action}</td>
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">{log.ip} ({log.location})</td>
                          <td className="p-2.5 text-slate-500 text-[11px]">{log.timestamp}</td>
                          <td className="p-2.5">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                log.status === "Success"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREFERENCES & APPEARANCE */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("preferencesDisplayTitle")}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("preferencesDisplayDesc")}</p>
              </div>

              {/* Theme Mode Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">{t("colorTheme")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "light" as const, name: t("saharaLight"), icon: Sun },
                    { id: "dark" as const, name: t("onyxDark"), icon: Moon },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = themeMode === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setThemeMode(item.id);
                          applyTheme(item.id);
                          showToast(`Theme switched to ${item.name}`);
                        }}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? "border-[#c05621] bg-amber-50/50 dark:bg-slate-900 text-[#c05621] font-bold"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language & Regional */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("language")}</label>
                  <select
                    value={language}
                    onChange={(e) => {
                      const code = e.target.value as LanguageCode;
                      setLanguage(code);
                      setSavedLanguage(code);
                      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === code);
                      showToast(`Language updated to ${langConfig?.label || code}`);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("timezone")}</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    <option>Asia/Kolkata (IST +5:30)</option>
                    <option>UTC / GMT</option>
                    <option>America/New_York (EST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("dateFormat")}</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              {/* Accessibility Toggles & Font Size */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t("accessibilityOptions")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t("textScaling")}</label>
                    <select
                      value={fontSize}
                      onChange={(e) => {
                        const val = e.target.value as TextScaleMode;
                        setFontSize(val);
                        applyTextScaling(val);
                        showToast(`Text scaling set to ${val}`);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    >
                      <option value="small">{t("smallUI")}</option>
                      <option value="medium">{t("mediumUI")}</option>
                      <option value="large">{t("largeUI")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <div>
                      <span className="font-bold block">{t("reducedMotion")}</span>
                      <span className="text-[10px] text-slate-500">{t("reducedMotionDesc")}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={(e) => {
                        setReducedMotion(e.target.checked);
                        applyReducedMotion(e.target.checked);
                        showToast(e.target.checked ? "Reduced motion enabled." : "Reduced motion disabled.");
                      }}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <div>
                      <span className="font-bold block">High Contrast Mode</span>
                      <span className="text-[10px] text-slate-500">Enhance text legibility and outline contrast.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => {
                        setHighContrast(e.target.checked);
                        applyHighContrast(e.target.checked);
                        showToast(e.target.checked ? "High contrast mode enabled." : "High contrast mode disabled.");
                      }}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose how and when you receive Live PNR updates and system notifications.</p>
              </div>

              {/* Channels */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Alert Channels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer">
                    <span className="font-semibold">Email Alerts</span>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                  <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer">
                    <span className="font-semibold">Browser Push</span>
                    <input
                      type="checkbox"
                      checked={pushAlerts}
                      onChange={(e) => setPushAlerts(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                  <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer">
                    <span className="font-semibold">SMS Dispatch</span>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                </div>
              </div>

              {/* Event Subscriptions & Digest Frequency */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Event Categories & Frequency</h3>
                  <select
                    value={digestFrequency}
                    onChange={(e) => setDigestFrequency(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <option value="instant">Instant Real-Time Alerts</option>
                    <option value="daily">Daily Email Digest</option>
                    <option value="weekly">Weekly Summary</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <div>
                      <span className="font-bold block">Live PNR Status Changes</span>
                      <span className="text-[10px] text-slate-500">Real-time alerts when seat status moves from WL/RAC to CNF.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pnrStatusUpdates}
                      onChange={(e) => setPnrStatusUpdates(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <div>
                      <span className="font-bold block">Train Delays & Platform Alerts</span>
                      <span className="text-[10px] text-slate-500">Instant dispatch for train delays exceeding 15 minutes.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={delayAlerts}
                      onChange={(e) => setDelayAlerts(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <div>
                      <span className="font-bold block">Promotions & System Digests</span>
                      <span className="text-[10px] text-slate-500">Occasional platform announcements and updates.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketingAlerts}
                      onChange={(e) => setMarketingAlerts(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEVELOPER & API */}
          {activeTab === "developer" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Developer Settings & API Integration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage API access keys, payload webhooks, and third-party connected OAuth apps.</p>
              </div>

              {/* API Keys */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <Key className="w-4 h-4" /> Secret API Keys
                  </h3>
                  <button
                    onClick={() => setShowKeyModal(true)}
                    className="px-3 py-1.5 bg-[#c05621] text-white text-xs font-bold rounded-lg hover:bg-[#a8481b] flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Generate Key
                  </button>
                </div>

                {/* API Key Modal */}
                {showKeyModal && (
                  <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 dark:bg-slate-900 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Create New Secret API Key</h4>
                    <input
                      type="text"
                      placeholder="Key Identifier (e.g. Production-App-Key)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowKeyModal(false)}
                        className="px-3 py-1.5 border border-slate-200 text-xs font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGenerateApiKey}
                        className="px-3 py-1.5 bg-[#c05621] text-white text-xs font-bold rounded-lg"
                      >
                        Create Key
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {apiKeys.map((k) => (
                    <div
                      key={k.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/50"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{k.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">{k.key}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Created: {k.created} • Last used: {k.lastUsed}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyKey(k.key, k.id)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                        >
                          {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRevokeApiKey(k.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Webhooks & Events */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <Webhook className="w-4 h-4" /> Webhook Payload URL
                </h3>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                  <button
                    onClick={() => showToast("Test Webhook ping dispatched with HTTP 200 OK.")}
                    className="px-3.5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl"
                  >
                    Test Ping
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Subscribed Events</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.pnrStatusChange}
                        onChange={(e) => setWebhookEvents({ ...webhookEvents, pnrStatusChange: e.target.checked })}
                        className="text-amber-600 rounded-md"
                      />
                      pnr.status_change
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.delayAlert}
                        onChange={(e) => setWebhookEvents({ ...webhookEvents, delayAlert: e.target.checked })}
                        className="text-amber-600 rounded-md"
                      />
                      train.delay_alert
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.bookingCreated}
                        onChange={(e) => setWebhookEvents({ ...webhookEvents, bookingCreated: e.target.checked })}
                        className="text-amber-600 rounded-md"
                      />
                      booking.created
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.staffAction}
                        onChange={(e) => setWebhookEvents({ ...webhookEvents, staffAction: e.target.checked })}
                        className="text-amber-600 rounded-md"
                      />
                      staff.manifest_update
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRIVACY & DATA */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Privacy & Storage Retention</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Control profile visibility, export personal records, and configure retention policies.</p>
              </div>

              {/* Visibility & Toggles */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Privacy Controls</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <div>
                      <span className="font-bold block">Profile Visibility</span>
                      <span className="text-[10px] text-slate-500">Allow staff and passengers to search your public profile.</span>
                    </div>
                    <select
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value as "public" | "private")}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private (Staff only)</option>
                    </select>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <div>
                      <span className="font-bold block">Share Search History</span>
                      <span className="text-[10px] text-slate-500">Sync recent searches across active devices.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareHistory}
                      onChange={(e) => setShareHistory(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                    <div>
                      <span className="font-bold block">Anonymous Platform Analytics</span>
                      <span className="text-[10px] text-slate-500">Help improve PNR tracking speed with telemetry.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={analyticsConsent}
                      onChange={(e) => setAnalyticsConsent(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md"
                    />
                  </label>
                </div>
              </div>

              {/* Data Retention & Export */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Auto Retention Policy</span>
                    <span className="text-[10px] text-slate-500">Automatically clear historical PNR logs after period.</span>
                  </div>
                  <select
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  >
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days (Recommended)</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Download Personal Data Archive</h4>
                    <p className="text-[11px] text-slate-500">Export all saved PNR searches, tickets, and logs in JSON format.</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-3 py-2 bg-[#c05621] text-white text-xs font-bold rounded-xl hover:bg-[#a8481b] flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Data
                  </button>
                </div>

                {/* Cloud Storage Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-amber-700" /> Cloud Storage Quota
                    </span>
                    <span className="font-mono text-slate-500">1.2 GB / 5.0 GB Used</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-600 h-full w-[24%]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
