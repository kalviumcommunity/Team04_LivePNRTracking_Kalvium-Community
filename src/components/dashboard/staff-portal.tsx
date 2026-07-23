"use client";

import { useState } from "react";
import { AlertTriangle, Send, Check, RefreshCw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

export interface ManifestPassenger {
  id: string;
  name: string;
  pnr: string;
  from: string;
  to: string;
  trainNo: string;
  status: "Boarding" | "Checked In" | "On-Board" | "No Show";
  seat: string;
}

interface StaffPortalProps {
  passengers: ManifestPassenger[];
  onUpdatePassengerStatus: (id: string, newStatus: ManifestPassenger["status"]) => void;
  activeSubTab: "manifest" | "ops";
  setActiveSubTab: (tab: "manifest" | "ops") => void;
}

export function StaffPortal({ passengers, onUpdatePassengerStatus, activeSubTab, setActiveSubTab }: StaffPortalProps) {
  const { t } = useTranslation();
  const [selectedStation, setSelectedStation] = useState("NDLS");
  const [alertText, setAlertText] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [delayTrain, setDelayTrain] = useState("12425");
  const [delayMinutes, setDelayMinutes] = useState("15");
  const [delaySuccess, setDelaySuccess] = useState(false);

  // Filter passengers based on their boarding station
  const stationPassengers = passengers.filter(
    (p) => p.from === selectedStation
  );

  // Stats
  const totalBoarding = stationPassengers.length;
  const totalOnBoard = stationPassengers.filter((p) => p.status === "On-Board").length;
  const totalCheckedIn = stationPassengers.filter((p) => p.status === "Checked In").length;

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertText) return;
    setAlertSuccess(true);
    setAlertText("");
    setTimeout(() => setAlertSuccess(false), 3000);
  };

  const handleUpdateDelay = (e: React.FormEvent) => {
    e.preventDefault();
    setDelaySuccess(true);
    setTimeout(() => setDelaySuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex gap-2 border-b border-[#eaddcd] dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveSubTab("manifest")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === "manifest"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          {t("stationManifest")}
        </button>
        <button
          onClick={() => setActiveSubTab("ops")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === "ops"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          {t("trainOperations")}
        </button>
      </div>

      {activeSubTab === "manifest" ? (
        <div className="space-y-6">
          {/* Station selector and statistics */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div>
              <label htmlFor="station-select" className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Select station manifest:
              </label>
              <select
                id="station-select"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="NDLS">New Delhi (NDLS)</option>
                <option value="CNB">Kanpur Central (CNB)</option>
                <option value="LJN">Lucknow Jn (LJN)</option>
              </select>
            </div>

            {/* Counts metrics */}
            <div className="flex gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">{t("boardingHere")}</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{totalBoarding}</span>
              </div>
              <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">{t("checkedIn")}</span>
                <span className="text-xl font-extrabold text-emerald-600">{totalCheckedIn}</span>
              </div>
              <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">{t("onBoard")}</span>
                <span className="text-xl font-extrabold text-[#c05621]">{totalOnBoard}</span>
              </div>
            </div>
          </div>

          {/* Manifest Table */}
          <Card className="border border-[#eaddcd] dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfbf9]/60 dark:bg-slate-900/40 border-b border-[#f2eae1] dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">{t("passengerName")}</th>
                    <th className="px-6 py-4">PNR</th>
                    <th className="px-6 py-4">{t("seat")}</th>
                    <th className="px-6 py-4">{t("currentStatus")}</th>
                    <th className="px-6 py-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2eae1] dark:divide-slate-800">
                  {stationPassengers.length > 0 ? (
                    stationPassengers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors text-sm text-slate-700 dark:text-slate-300">
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                        <td className="px-6 py-4 font-mono text-xs">{p.pnr}</td>
                        <td className="px-6 py-4 font-semibold text-xs">{p.seat}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            p.status === "On-Board"
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {p.status === "Boarding" && (
                              <Button
                                onClick={() => onUpdatePassengerStatus(p.id, "Checked In")}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50/50 px-2"
                              >
                                Check In
                              </Button>
                            )}
                            {(p.status === "Boarding" || p.status === "Checked In") && (
                              <Button
                                onClick={() => onUpdatePassengerStatus(p.id, "On-Board")}
                                size="sm"
                                className="h-7 text-xs bg-[#c05621] hover:bg-[#a64819] text-white px-2"
                              >
                                Board
                              </Button>
                            )}
                            {p.status === "On-Board" && (
                              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                On Board
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No passengers boarding at this station.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operations: Notifications Broadcast */}
          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#c05621]" />
                Passenger Station Broadcast
              </CardTitle>
              <CardDescription className="text-xs">
                Send real-time alerts or platform announcements to passengers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendAlert} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="broadcast-text" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Alert Message
                  </label>
                  <textarea
                    id="broadcast-text"
                    value={alertText}
                    onChange={(e) => setAlertText(e.target.value)}
                    placeholder="Enter platform change or boarding announcement..."
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 focus-visible:outline-none"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#c05621] hover:bg-[#a64819] text-white text-xs h-9 font-semibold gap-1.5 shadow-md shadow-[#c05621]/10">
                  <Send className="w-3.5 h-3.5" />
                  Broadcast Announcement
                </Button>

                {alertSuccess && (
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-xs text-center font-bold">
                    Announcement broadcasted successfully!
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Operations: Delay updates */}
          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-500" />
                Train Delay Controller
              </CardTitle>
              <CardDescription className="text-xs">
                Update expected delays for PNR timetable status synchronization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateDelay} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="delay-train" className="text-xs font-bold text-slate-500 uppercase">Train Number</label>
                    <select
                      id="delay-train"
                      value={delayTrain}
                      onChange={(e) => setDelayTrain(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs focus:outline-none"
                    >
                      <option value="12425">Rajdhani Exp (#12425)</option>
                      <option value="12004">Shatabdi Exp (#12004)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="delay-minutes" className="text-xs font-bold text-slate-500 uppercase">Delay Status</label>
                    <select
                      id="delay-minutes"
                      value={delayMinutes}
                      onChange={(e) => setDelayMinutes(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs focus:outline-none"
                    >
                      <option value="0">On Time</option>
                      <option value="15">15 Mins Delay</option>
                      <option value="30">30 Mins Delay</option>
                      <option value="60">60 Mins Delay</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#c05621] hover:bg-[#a64819] text-white text-xs h-9 font-semibold gap-1.5 shadow-md shadow-[#c05621]/10">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Update Timetable
                </Button>

                {delaySuccess && (
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-xs text-center font-bold">
                    Delay timing updated successfully!
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
