"use client";

import { useState } from "react";
import { Users, Server, ShieldCheck, Activity, UserPlus, UserMinus, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ManifestPassenger } from "./staff-portal";
import { useTranslation } from "@/lib/i18n";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "staff" | "admin";
  status: "Active" | "Inactive";
  station: string;
}

interface AdminPortalProps {
  staff: StaffMember[];
  passengers: ManifestPassenger[];
  onAddStaff: (newStaff: Omit<StaffMember, "id" | "role" | "status">) => void;
  onToggleStaffStatus: (id: string) => void;
  activeSubTab: "overview" | "staff" | "passengers";
  onSubTabChange: (tab: string) => void;
}

export function AdminPortal({ staff, passengers, onAddStaff, onToggleStaffStatus, activeSubTab, onSubTabChange }: AdminPortalProps) {
  const { t } = useTranslation();

  // Form states
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffStation, setNewStaffStation] = useState("New Delhi (NDLS)");
  const [addSuccess, setAddSuccess] = useState(false);

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;

    onAddStaff({
      name: newStaffName,
      email: newStaffEmail,
      station: newStaffStation,
    });

    setNewStaffName("");
    setNewStaffEmail("");
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex gap-2 border-b border-[#eaddcd] dark:border-slate-800 pb-px">
        <button
          onClick={() => onSubTabChange("overview")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${activeSubTab === "overview"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
        >
          {t("systemOverview")}
        </button>
        <button
          onClick={() => onSubTabChange("staff")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${activeSubTab === "staff"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
        >
          {t("manageStaff")}
        </button>
        <button
          onClick={() => onSubTabChange("passengers")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${activeSubTab === "passengers"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
        >
          {t("managePassengers")}
        </button>
      </div>

      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">{t("totalStaff")}</span>
                <span className="text-2xl font-extrabold text-slate-800 block mt-1">{staff.length}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#c05621] border border-amber-200">
                <Users className="w-5 h-5" />
              </div>
            </Card>

            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">{t("passengersMonitored")}</span>
                <span className="text-2xl font-extrabold text-slate-800 block mt-1">{passengers.length}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
                <Clipboard className="w-5 h-5" />
              </div>
            </Card>

            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">{t("apiSystemStatus")}</span>
                <span className="text-2xl font-extrabold text-emerald-600 block mt-1">99.98%</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
                <Server className="w-5 h-5" />
              </div>
            </Card>

            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">{t("diagnostics")}</span>
                <span className="text-2xl font-extrabold text-slate-850 block mt-1">{t("healthy")}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-200">
                <Activity className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* System Control Panel Info */}
          <Card className="border border-[#eaddcd] bg-white/70 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[#c05621]">
                <ShieldCheck className="w-5 h-5" />
                {t("adminControlTitle")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("adminControlDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed">
                As System Administrator, you have total diagnostic authority over passenger records, staff shifts, API synchronization intervals, and delay announcement dispatch controls. Maintain proper security access levels when creating new staff accounts.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="font-bold text-slate-800 block mb-1">{t("serverCluster")}</span>
                  <span className="text-slate-500">Node-A: Operational (17ms lat)</span>
                  <span className="text-slate-500 block">Node-B: Operational (22ms lat)</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-1">{t("corridorSync")}</span>
                  <span className="text-slate-500">Northern Railway: Synced</span>
                  <span className="text-slate-500 block">Eastern Railway: Synced</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "staff" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Staff form */}
          <div className="lg:col-span-4">
            <Card className="border border-[#eaddcd] bg-white/70 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#c05621]" />
                  {t("addNewStaff")}
                </CardTitle>
                <CardDescription className="text-xs">
                  Create a new duty staff account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="staff-name" className="text-[10px] font-bold text-slate-500 uppercase">{t("staffName")}</label>
                    <Input
                      id="staff-name"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="Enter name"
                      className="h-9 bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="staff-email" className="text-[10px] font-bold text-slate-500 uppercase">{t("email")}</label>
                    <Input
                      id="staff-email"
                      type="email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="staff@railwaypnr.com"
                      className="h-9 bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="staff-station" className="text-[10px] font-bold text-slate-500 uppercase">{t("assignedStation")}</label>
                    <select
                      id="staff-station"
                      value={newStaffStation}
                      onChange={(e) => setNewStaffStation(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:outline-none font-medium"
                    >
                      <option value="New Delhi (NDLS)">New Delhi (NDLS)</option>
                      <option value="Kanpur (CNB)">Kanpur (CNB)</option>
                      <option value="Lucknow (LJN)">Lucknow (LJN)</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-[#c05621] hover:bg-[#a64819] text-white text-xs h-9 font-semibold shadow-md shadow-[#c05621]/10">
                    {t("addStaffBtn")}
                  </Button>

                  {addSuccess && (
                    <div className="p-2 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs text-center font-bold">
                      Staff created successfully!
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Staff directory */}
          <div className="lg:col-span-8">
            <Card className="border border-[#eaddcd] bg-white/70 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fcfbf9]/60 border-b border-[#f2eae1] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">{t("staffName")}</th>
                      <th className="px-6 py-4">{t("stationLocation")}</th>
                      <th className="px-6 py-4">{t("currentStatus")}</th>
                      <th className="px-6 py-4 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2eae1] text-sm text-slate-700">
                    {staff.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 block">{s.name}</span>
                          <span className="text-xs text-slate-400">{s.email}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{s.station}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                              : "bg-red-50 text-red-700 border-red-200/50"
                            }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => onToggleStaffStatus(s.id)}
                            size="sm"
                            variant="outline"
                            className={`h-7 text-xs px-2 ${s.status === "Active"
                                ? "border-red-200 text-red-600 hover:bg-red-50/50"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50/50"
                              }`}
                          >
                            {s.status === "Active" ? (
                              <span className="flex items-center gap-1"><UserMinus className="w-3.5 h-3.5" /> Deactivate</span>
                            ) : (
                              <span className="flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Activate</span>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeSubTab === "passengers" && (
        <Card className="border border-[#eaddcd] bg-white/70 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcfbf9]/60 border-b border-[#f2eae1] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">{t("passengerName")}</th>
                  <th className="px-6 py-4">PNR</th>
                  <th className="px-6 py-4">{t("routeInfo")}</th>
                  <th className="px-6 py-4">{t("seat")}</th>
                  <th className="px-6 py-4 text-right">{t("currentStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2eae1] text-sm text-slate-700">
                {passengers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{p.pnr}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {p.from} <span className="text-slate-300 mx-1">→</span> {p.to}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold">{p.seat}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${p.status === "On-Board"
                          ? "bg-amber-50 text-[#c05621] border-amber-200/50"
                          : p.status === "Checked In"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                            : p.status === "No Show"
                              ? "bg-red-50 text-red-700 border-red-200/50"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
