"use client";

import { useState } from "react";
import {
  Users,
  Server,
  ShieldCheck,
  Activity,
  UserPlus,
  UserMinus,
  Clipboard,
  Trash2,
  ClipboardList,
  Search,
  Filter,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ManifestPassenger } from "./staff-portal";
import { useTranslation } from "@/lib/i18n";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "staff" | "admin";
  subRole?: string | null;
  status: "Active" | "Inactive";
  station: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  rawTimestamp: string;
  userName: string;
  userEmail: string;
}

export interface AdminStats {
  totalStaff: number;
  totalBookings: number;
  activeStaff: number;
  passengerCount: number;
  systemUptime: string;
}

interface AdminPortalProps {
  staff: StaffMember[];
  passengers: ManifestPassenger[];
  auditLogs: AuditLogEntry[];
  adminStats: AdminStats;
  onAddStaff: (newStaff: Omit<StaffMember, "id" | "role" | "status">) => Promise<void>;
  onToggleStaffStatus: (id: string) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  activeSubTab: "overview" | "staff" | "passengers" | "auditlogs";
  onSubTabChange: (tab: string) => void;
}

// Toast notification component
function Toast({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300 ${
        type === "success"
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : "bg-red-50 text-red-800 border-red-200"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
      )}
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 text-slate-400 hover:text-slate-600">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Confirmation dialog component
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Action badge colours
const ACTION_BADGE: Record<string, string> = {
  ADD_STAFF: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DELETE_STAFF: "bg-red-50 text-red-700 border-red-200",
  TOGGLE_STAFF_STATUS: "bg-blue-50 text-blue-700 border-blue-200",
  BROADCAST_ALERT: "bg-amber-50 text-amber-700 border-amber-200",
  UPDATE_BOARDING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  REPORT_INCIDENT: "bg-orange-50 text-orange-700 border-orange-200",
  UPDATE_INCIDENT_STATUS: "bg-purple-50 text-purple-700 border-purple-200",
  SEAT_REALLOCATION: "bg-cyan-50 text-cyan-700 border-cyan-200",
  UPDATE_MEAL_STATUS: "bg-lime-50 text-lime-700 border-lime-200",
  REGISTER_LUGGAGE: "bg-slate-100 text-slate-700 border-slate-200",
  UPDATE_LUGGAGE_STATUS: "bg-slate-100 text-slate-700 border-slate-200",
  ATTENDANCE_CHECKIN: "bg-teal-50 text-teal-700 border-teal-200",
  ATTENDANCE_CHECKOUT: "bg-teal-50 text-teal-700 border-teal-200",
};

const SUB_ROLES = [
  { value: "", label: "No Sub-role" },
  { value: "ttr", label: "TTR (Travelling Ticket Reviewer)" },
  { value: "pantry", label: "Pantry Manager" },
  { value: "maintenance", label: "Maintenance Engineer" },
];

const STATIONS = [
  "New Delhi (NDLS)",
  "Kanpur (CNB)",
  "Lucknow (LJN)",
  "Amritsar (ASR)",
  "Mumbai (CSTM)",
  "Pune (PUNE)",
  "Bangalore (SBC)",
  "Chennai (MAS)",
  "Hyderabad (HYB)",
  "Kolkata (KOAA)",
];

export function AdminPortal({
  staff,
  passengers,
  auditLogs,
  adminStats,
  onAddStaff,
  onToggleStaffStatus,
  onDeleteStaff,
  activeSubTab,
  onSubTabChange,
}: AdminPortalProps) {
  const { t } = useTranslation();

  // Add staff form states
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffStation, setNewStaffStation] = useState("New Delhi (NDLS)");
  const [newStaffSubRole, setNewStaffSubRole] = useState("");

  // Loading states
  const [addingStaff, setAddingStaff] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Search / filter states
  const [passengerSearch, setPassengerSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("ALL");

  // Toast state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    setAddingStaff(true);
    try {
      await onAddStaff({
        name: newStaffName.trim(),
        email: newStaffEmail.trim(),
        station: newStaffStation,
        subRole: newStaffSubRole || null,
      });
      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffSubRole("");
      showToast("success", `Staff account for ${newStaffName} created successfully!`);
    } catch {
      showToast("error", "Failed to create staff account. Please try again.");
    } finally {
      setAddingStaff(false);
    }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await onToggleStaffStatus(id);
      showToast("success", "Staff status updated successfully.");
    } catch {
      showToast("error", "Failed to update staff status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await onDeleteStaff(confirmDeleteId);
      showToast("success", "Staff member permanently deleted.");
    } catch {
      showToast("error", "Failed to delete staff member.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Filtered lists
  const filteredPassengers = passengers.filter((p) => {
    const q = passengerSearch.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.pnr.includes(q) ||
      p.trainNo.includes(q) ||
      p.from.toLowerCase().includes(q) ||
      p.to.toLowerCase().includes(q)
    );
  });

  const filteredStaff = staff.filter((s) => {
    const q = staffSearch.toLowerCase();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.station.toLowerCase().includes(q)
    );
  });

  const filteredAuditLogs =
    auditFilter === "ALL" ? auditLogs : auditLogs.filter((l) => l.action === auditFilter);

  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action)));

  const TABS = [
    { id: "overview", label: t("systemOverview"), icon: Activity },
    { id: "staff", label: t("manageStaff"), icon: Users },
    { id: "passengers", label: t("managePassengers"), icon: Clipboard },
    { id: "auditlogs", label: "Audit Log", icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete Staff Member"
          message="This action is permanent and cannot be undone. All associated records (attendance, shifts, incidents) will also be deleted."
          confirmLabel="Yes, Delete Permanently"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
          isPending={!!deletingId}
        />
      )}

      {/* Sub Tab Navigation */}
      <div className="flex gap-1 border-b border-[#eaddcd] dark:border-slate-800 pb-px overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onSubTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? "border-[#c05621] text-[#c05621]"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === "auditlogs" && auditLogs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c05621]/10 text-[#c05621]">
                  {auditLogs.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ──────────── OVERVIEW TAB ──────────── */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Live Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Total Staff</span>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white block mt-1">
                    {adminStats.totalStaff}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {adminStats.activeStaff} active
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-[#c05621] border border-amber-200 dark:border-amber-800/50">
                  <Users className="w-4.5 h-4.5" />
                </div>
              </div>
            </Card>

            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Passengers</span>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white block mt-1">
                    {adminStats.passengerCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">registered</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 border border-indigo-200 dark:border-indigo-800/50">
                  <Clipboard className="w-4.5 h-4.5" />
                </div>
              </div>
            </Card>

            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Total Bookings</span>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white block mt-1">
                    {adminStats.totalBookings}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">all time</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 border border-blue-200 dark:border-blue-800/50">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
              </div>
            </Card>

            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">API Uptime</span>
                  <span className="text-2xl font-extrabold text-emerald-600 block mt-1">
                    {adminStats.systemUptime}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">healthy</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 border border-emerald-200 dark:border-emerald-800/50">
                  <Server className="w-4.5 h-4.5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Audit log recent summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* System Control Panel */}
            <Card className="border border-[#eaddcd] bg-white/70 dark:bg-slate-900/60 shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-[#c05621]">
                  <ShieldCheck className="w-5 h-5" />
                  {t("adminControlTitle")}
                </CardTitle>
                <CardDescription className="text-xs">{t("adminControlDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed">
                  As System Administrator, you have total diagnostic authority over passenger
                  records, staff shifts, API synchronization intervals, and delay announcement
                  dispatch controls. Maintain proper security access levels when creating new staff
                  accounts.
                </p>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      {t("serverCluster")}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Node-A: Operational (17ms)
                    </span>
                    <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Node-B: Operational (22ms)
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      {t("corridorSync")}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3 text-emerald-500" />
                      Northern Railway: Synced
                    </span>
                    <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <BadgeCheck className="w-3 h-3 text-emerald-500" />
                      Eastern Railway: Synced
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent audit actions */}
            <Card className="border border-[#eaddcd] bg-white/70 dark:bg-slate-900/60 shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <TrendingUp className="w-4 h-4 text-[#c05621]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No audit logs yet.</p>
                ) : (
                  <div className="divide-y divide-[#f2eae1] dark:divide-slate-800">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="px-6 py-3 flex items-start gap-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                            ACTION_BADGE[log.action] || "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {log.details}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ──────────── MANAGE STAFF TAB ──────────── */}
      {activeSubTab === "staff" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Staff form */}
          <div className="lg:col-span-4">
            <Card className="border border-[#eaddcd] bg-white/70 dark:bg-slate-900/60 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#c05621]" />
                  {t("addNewStaff")}
                </CardTitle>
                <CardDescription className="text-xs">
                  Create a new duty staff account. Default password:{" "}
                  <code className="bg-amber-50 dark:bg-slate-800 px-1 rounded font-mono text-[10px]">
                    password123
                  </code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddStaffSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="staff-name"
                      className="text-[10px] font-bold text-slate-500 uppercase"
                    >
                      {t("staffName")}
                    </label>
                    <Input
                      id="staff-name"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="Enter full name"
                      className="h-9 bg-white dark:bg-slate-900 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="staff-email"
                      className="text-[10px] font-bold text-slate-500 uppercase"
                    >
                      {t("email")}
                    </label>
                    <Input
                      id="staff-email"
                      type="email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="staff@railwaypnr.com"
                      className="h-9 bg-white dark:bg-slate-900 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="staff-subrole"
                      className="text-[10px] font-bold text-slate-500 uppercase"
                    >
                      Sub-Role
                    </label>
                    <select
                      id="staff-subrole"
                      value={newStaffSubRole}
                      onChange={(e) => setNewStaffSubRole(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs focus:outline-none font-medium text-slate-700 dark:text-slate-200"
                    >
                      {SUB_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="staff-station"
                      className="text-[10px] font-bold text-slate-500 uppercase"
                    >
                      {t("assignedStation")}
                    </label>
                    <select
                      id="staff-station"
                      value={newStaffStation}
                      onChange={(e) => setNewStaffStation(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs focus:outline-none font-medium text-slate-700 dark:text-slate-200"
                    >
                      {STATIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={addingStaff}
                    className="w-full bg-[#c05621] hover:bg-[#a64819] text-white text-xs h-9 font-semibold shadow-md shadow-[#c05621]/10 mt-1"
                  >
                    {addingStaff ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 mr-2" />
                        {t("addStaffBtn")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Staff directory */}
          <div className="lg:col-span-8 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search by name, email or station..."
                className="h-9 pl-8 bg-white dark:bg-slate-900 text-xs border-[#eaddcd] dark:border-slate-700"
              />
            </div>

            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fcfbf9]/60 dark:bg-slate-900/60 border-b border-[#f2eae1] dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3.5">{t("staffName")}</th>
                      <th className="px-5 py-3.5">Sub-Role</th>
                      <th className="px-5 py-3.5 hidden sm:table-cell">{t("stationLocation")}</th>
                      <th className="px-5 py-3.5">{t("currentStatus")}</th>
                      <th className="px-5 py-3.5 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2eae1] dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400">
                          {staffSearch ? "No staff matching search." : "No staff members yet."}
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block text-xs">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{s.email}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            {s.subRole ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                                {s.subRole.toUpperCase()}
                              </span>
                            ) : s.role === "admin" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                                ADMIN
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                            {s.station}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                s.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400"
                                  : "bg-red-50 text-red-700 border-red-200/50 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${s.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`}
                              />
                              {s.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                onClick={() => handleToggle(s.id)}
                                disabled={togglingId === s.id}
                                size="sm"
                                variant="outline"
                                className={`h-7 text-xs px-2 ${
                                  s.status === "Active"
                                    ? "border-red-200 text-red-600 hover:bg-red-50/50 dark:border-red-900/50 dark:text-red-400"
                                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50/50 dark:border-emerald-900/50 dark:text-emerald-400"
                                }`}
                              >
                                {togglingId === s.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : s.status === "Active" ? (
                                  <span className="flex items-center gap-1">
                                    <UserMinus className="w-3 h-3" /> Deactivate
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <UserPlus className="w-3 h-3" /> Activate
                                  </span>
                                )}
                              </Button>
                              {/* Don't allow deleting admin accounts */}
                              {s.role !== "admin" && (
                                <Button
                                  onClick={() => setConfirmDeleteId(s.id)}
                                  disabled={!!deletingId}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2 border-red-200 text-red-600 hover:bg-red-50/50 dark:border-red-900/50 dark:text-red-400"
                                  title="Delete permanently"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ──────────── MANAGE PASSENGERS TAB ──────────── */}
      {activeSubTab === "passengers" && (
        <div className="space-y-3">
          {/* Search */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={passengerSearch}
                onChange={(e) => setPassengerSearch(e.target.value)}
                placeholder="Search by name, PNR, train, or station..."
                className="h-9 pl-8 bg-white dark:bg-slate-900 text-xs border-[#eaddcd] dark:border-slate-700"
              />
            </div>
            {passengerSearch && (
              <button
                onClick={() => setPassengerSearch("")}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <span className="text-xs text-slate-400 shrink-0 font-medium">
              {filteredPassengers.length} of {passengers.length}
            </span>
          </div>

          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfbf9]/60 dark:bg-slate-900/60 border-b border-[#f2eae1] dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">{t("passengerName")}</th>
                    <th className="px-6 py-4">PNR</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Train</th>
                    <th className="px-6 py-4 hidden md:table-cell">{t("routeInfo")}</th>
                    <th className="px-6 py-4 hidden lg:table-cell">{t("seat")}</th>
                    <th className="px-6 py-4 text-right">{t("currentStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2eae1] dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                  {filteredPassengers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-400">
                        {passengerSearch
                          ? "No passengers match your search."
                          : "No passenger records found."}
                      </td>
                    </tr>
                  ) : (
                    filteredPassengers.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-xs">
                          {p.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{p.pnr}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                          {p.trainNo}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">
                          {p.from}{" "}
                          <span className="text-slate-300 mx-1">→</span> {p.to}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold hidden lg:table-cell">
                          {p.seat}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              p.status === "On-Board"
                                ? "bg-amber-50 text-[#c05621] border-amber-200/50"
                                : p.status === "Checked In"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                                : p.status === "No Show"
                                ? "bg-red-50 text-red-700 border-red-200/50"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ──────────── AUDIT LOG TAB ──────────── */}
      {activeSubTab === "auditlogs" && (
        <div className="space-y-3">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => setAuditFilter("ALL")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                auditFilter === "ALL"
                  ? "bg-[#c05621] text-white border-[#c05621]"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#c05621] hover:text-[#c05621]"
              }`}
            >
              ALL ({auditLogs.length})
            </button>
            {uniqueActions.map((action) => (
              <button
                key={action}
                onClick={() => setAuditFilter(action)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  auditFilter === action
                    ? "bg-[#c05621] text-white border-[#c05621]"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#c05621] hover:text-[#c05621]"
                }`}
              >
                {action.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-md overflow-hidden">
            {filteredAuditLogs.length === 0 ? (
              <div className="py-12 text-center">
                <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No audit logs found.</p>
                <p className="text-[10px] text-slate-300 mt-1">
                  Actions by admins and staff will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f2eae1] dark:divide-slate-800">
                {filteredAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Action badge */}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 leading-none ${
                        ACTION_BADGE[log.action] ||
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {log.action.replace(/_/g, " ")}
                    </span>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {log.details}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                        {log.userName && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                            {log.userName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
