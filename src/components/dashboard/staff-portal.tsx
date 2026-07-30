"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Send, 
  Check, 
  RefreshCw, 
  Volume2, 
  Coffee, 
  Calendar, 
  Package, 
  UserCheck, 
  MapPin, 
  Clock, 
  AlertOctagon, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import { 
  getWaitlistPassengers, 
  reallocateSeat, 
  updateMealStatus, 
  reportIncident, 
  getIncidents, 
  checkInAttendance, 
  checkOutAttendance, 
  getDutyShifts, 
  registerLuggage, 
  updateLuggageStatus,
  getLuggageList,
  broadcastOpsAlert
} from "@/actions/staff";

export interface ManifestPassenger {
  id: string;
  name: string;
  pnr: string;
  from: string;
  to: string;
  trainNo: string;
  status: "Boarding" | "Checked In" | "On-Board" | "No Show";
  seat: string;
  mealPreference?: string | null;
  mealStatus?: string;
}

export interface WaitlistPassenger {
  id: string;
  pnr: string;
  name: string;
  from: string;
  to: string;
  seat?: string;
  status?: string;
}

export interface IncidentRecord {
  id: string;
  trainNo: string;
  coach: string;
  seatNo?: string;
  category: string;
  description: string;
  status: string;
  severity: string;
  reporterName?: string;
  createdAt?: string | Date;
}

export interface ShiftRecord {
  id: string;
  station: string;
  trainNo?: string | null;
  date?: string | Date;
  shiftType?: string;
  status?: string;
}

export interface LuggageRecord {
  id: string;
  bookingId: string;
  barcode: string;
  weight: number;
  description?: string | null;
  status: string;
  passengerName?: string;
  pnr?: string;
}

interface StaffPortalProps {
  passengers: ManifestPassenger[];
  onUpdatePassengerStatus: (id: string, newStatus: ManifestPassenger["status"]) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

export function StaffPortal({ passengers: initialPassengers, onUpdatePassengerStatus, activeSubTab, setActiveSubTab }: StaffPortalProps) {
  const { t } = useTranslation();
  const [passengers, setPassengers] = useState<ManifestPassenger[]>(initialPassengers);
  const [selectedStation, setSelectedStation] = useState("NDLS");
  
  // Station manifest reload trigger
  useEffect(() => {
    setTimeout(() => {
      setPassengers(initialPassengers);
    }, 0);
  }, [initialPassengers]);

  // General Notification Broadcast state
  const [alertText, setAlertText] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [delayTrain, setDelayTrain] = useState("12425");
  const [delayMinutes, setDelayMinutes] = useState("15");
  const [delaySuccess, setDelaySuccess] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [delayLoading, setDelayLoading] = useState(false);

  // Feature 1: Seat Re-allocation State
  const [selectedNoShow, setSelectedNoShow] = useState<ManifestPassenger | null>(null);
  const [wlPassengers, setWlPassengers] = useState<WaitlistPassenger[]>([]);
  const [loadingWl, setLoadingWl] = useState(false);
  const [reallocatingId, setReallocatingId] = useState<string | null>(null);

  // Feature 2: Catering State
  const [updatingMealId, setUpdatingMealId] = useState<string | null>(null);

  // Feature 3: Incident Reporting State
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [incidentLoading, setIncidentLoading] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    trainNo: "12425",
    coach: "",
    seatNo: "",
    category: "AC",
    description: "",
    severity: "Medium"
  });
  const [incidentStatusMsg, setIncidentStatusMsg] = useState("");

  // Feature 4: Attendance & Roster State
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [attendance, setAttendance] = useState<{ checkIn?: string | Date; station?: string } | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Feature 5: Luggage Tracking State
  const [luggageList, setLuggageList] = useState<LuggageRecord[]>([]);
  const [luggageLoading, setLuggageLoading] = useState(false);
  const [luggageForm, setLuggageForm] = useState({
    bookingId: "",
    barcode: "",
    weight: 5.0,
    description: ""
  });
  const [luggageStatusMsg, setLuggageStatusMsg] = useState("");

  // --- Feature 3: Incident Functions ---
  const fetchIncidents = async (trainNo: string) => {
    setIncidentLoading(true);
    const data = await getIncidents(trainNo);
    setIncidents(data);
    setIncidentLoading(false);
  };

  // --- Feature 4: Attendance & Roster ---
  const fetchDutyRosterAndAttendance = async () => {
    setAttendanceLoading(true);
    const roster = await getDutyShifts();
    setShifts(roster);
    setAttendanceLoading(false);
  };

  // --- Feature 5: Luggage Functions ---
  const fetchLuggage = async () => {
    setLuggageLoading(true);
    const list = await getLuggageList();
    setLuggageList(list);
    setLuggageLoading(false);
  };

  // Fetch contextual tab data on sub-tab switch
  useEffect(() => {
    setTimeout(() => {
      if (activeSubTab === "ops") {
        fetchIncidents("12425");
      } else if (activeSubTab === "attendance") {
        fetchDutyRosterAndAttendance();
      } else if (activeSubTab === "luggage") {
        fetchLuggage();
      }
    }, 0);
  }, [activeSubTab]);

  // Broadcaster wrapper
  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertText) return;
    setBroadcastLoading(true);
    const res = await broadcastOpsAlert({
      trainNo: delayTrain,
      delayMinutes: "0",
      alertText
    });
    setBroadcastLoading(false);
    if (res.success) {
      setAlertSuccess(true);
      setAlertText("");
      setTimeout(() => setAlertSuccess(false), 3000);
    }
  };

  const handleUpdateDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    setDelayLoading(true);
    const res = await broadcastOpsAlert({
      trainNo: delayTrain,
      delayMinutes: delayMinutes,
      alertText: `Train ${delayTrain} is running delayed by ${delayMinutes} minutes.`
    });
    setDelayLoading(false);
    if (res.success) {
      setDelaySuccess(true);
      setTimeout(() => setDelaySuccess(false), 3000);
    }
  };

  // --- Feature 1: Seat Re-allocation Functions ---
  const handleOpenReallocateModal = async (noShowPassenger: ManifestPassenger) => {
    setSelectedNoShow(noShowPassenger);
    setLoadingWl(true);
    const list = await getWaitlistPassengers(noShowPassenger.trainNo);
    setWlPassengers(list);
    setLoadingWl(false);
  };

  const handleConfirmReallocate = async (wlBookingId: string) => {
    if (!selectedNoShow) return;
    setReallocatingId(wlBookingId);
    const res = await reallocateSeat(selectedNoShow.id, wlBookingId);
    setReallocatingId(null);
    if (res.success) {
      // Local state update
      setPassengers((prev) =>
        prev.map((p) => {
          if (p.id === selectedNoShow.id) {
            return { ...p, status: "No Show" };
          }
          if (p.id === wlBookingId) {
            return { ...p, seat: selectedNoShow.seat, status: "Checked In" };
          }
          return p;
        })
      );
      setSelectedNoShow(null);
    } else {
      alert(res.error || "Failed to reallocate seat.");
    }
  };

  // --- Feature 2: Catering Toggle ---
  const handleToggleMeal = async (bookingId: string, currentStatus: string) => {
    setUpdatingMealId(bookingId);
    const nextStatus = currentStatus === "Delivered" ? "Pending" : "Delivered";
    const res = await updateMealStatus(bookingId, nextStatus);
    setUpdatingMealId(null);
    if (res.success) {
      setPassengers((prev) =>
        prev.map((p) => (p.id === bookingId ? { ...p, mealStatus: nextStatus } : p))
      );
    }
  };

  // --- Feature 3: Incident Functions ---
  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.coach || !incidentForm.description) {
      setIncidentStatusMsg("Please fill out coach and description.");
      return;
    }
    setIncidentLoading(true);
    const res = await reportIncident(incidentForm);
    setIncidentLoading(false);
    if (res.success) {
      setIncidentStatusMsg("Incident reported successfully!");
      setIncidentForm((prev) => ({ ...prev, coach: "", seatNo: "", description: "" }));
      fetchIncidents(incidentForm.trainNo);
      setTimeout(() => setIncidentStatusMsg(""), 3000);
    } else {
      setIncidentStatusMsg(res.error || "Failed to report incident.");
    }
  };

  // --- Feature 4: Attendance & Roster ---
  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setAttendanceLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        const res = await checkInAttendance(latitude, longitude, selectedStation);
        setAttendanceLoading(false);
        if (res.success) {
          setAttendance(res.attendance);
        } else {
          alert(res.error || "Failed to check in.");
        }
      },
      async (err) => {
        console.warn("Geolocation failed, using mock coords", err);
        const mockLat = 28.6139;
        const mockLng = 77.2090;
        setGpsCoords({ lat: mockLat, lng: mockLng });
        const res = await checkInAttendance(mockLat, mockLng, selectedStation);
        setAttendanceLoading(false);
        if (res.success) {
          setAttendance(res.attendance);
        } else {
          alert(res.error || "Failed to check-in.");
        }
      }
    );
  };

  const handleCheckOut = async () => {
    setAttendanceLoading(true);
    const res = await checkOutAttendance();
    setAttendanceLoading(false);
    if (res.success) {
      setAttendance(null);
      setGpsCoords(null);
      alert("Successfully checked out.");
    } else {
      alert(res.error || "Failed to check out.");
    }
  };

  // --- Feature 5: Luggage Functions ---

  const handleLuggageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!luggageForm.bookingId || !luggageForm.barcode) {
      setLuggageStatusMsg("Please select a passenger and enter a barcode.");
      return;
    }
    setLuggageLoading(true);
    const res = await registerLuggage({
      bookingId: luggageForm.bookingId,
      barcode: luggageForm.barcode,
      weight: parseFloat(luggageForm.weight.toString()),
      description: luggageForm.description
    });
    setLuggageLoading(false);
    if (res.success) {
      setLuggageStatusMsg("Luggage parcel registered successfully!");
      setLuggageForm({ bookingId: "", barcode: "", weight: 5.0, description: "" });
      fetchLuggage();
      setTimeout(() => setLuggageStatusMsg(""), 3000);
    } else {
      setLuggageStatusMsg(res.error || "Failed to register luggage.");
    }
  };

  const handleUpdateLuggage = async (luggageId: string, nextStatus: string) => {
    setLuggageLoading(true);
    const res = await updateLuggageStatus(luggageId, nextStatus);
    if (res.success) {
      fetchLuggage();
    } else {
      alert(res.error || "Failed to update luggage status.");
    }
    setLuggageLoading(false);
  };

  // Filter passengers based on their boarding station
  const stationPassengers = passengers.filter(
    (p) => p.from === selectedStation
  );

  // Stats
  const totalBoarding = stationPassengers.length;
  const totalOnBoard = stationPassengers.filter((p) => p.status === "On-Board").length;
  const totalCheckedIn = stationPassengers.filter((p) => p.status === "Checked In").length;

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#eaddcd] dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveSubTab("manifest")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "manifest"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          {t("stationManifest")}
        </button>
        <button
          onClick={() => setActiveSubTab("ops")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "ops"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          {t("trainOperations")}
        </button>
        <button
          onClick={() => setActiveSubTab("catering")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "catering"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          Catering Service
        </button>
        <button
          onClick={() => setActiveSubTab("attendance")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "attendance"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Duty Roster
        </button>
        <button
          onClick={() => setActiveSubTab("luggage")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === "luggage"
              ? "border-[#c05621] text-[#c05621]"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Luggage Tracking
        </button>
      </div>

      {/* --- STATION SELECTOR AND COUNTS FOR CORRESPONDING TABS --- */}
      {(activeSubTab === "manifest" || activeSubTab === "catering") && (
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-[#faf8f5]/50 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <label htmlFor="station-select" className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
              Filter By Station Manifest:
            </label>
            <select
              id="station-select"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="NDLS">New Delhi (NDLS)</option>
              <option value="CNB">Kanpur Central (CNB)</option>
              <option value="LJN">Lucknow Jn (LJN)</option>
            </select>
          </div>

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
      )}

      {/* --- SUB TAB 1: MANIFEST & SEAT REALLOCATION --- */}
      {activeSubTab === "manifest" && (
        <div className="space-y-6">
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
                              : "bg-slate-100 text-slate-650 border-slate-200"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {p.status === "Boarding" && (
                              <>
                                <Button
                                  onClick={() => onUpdatePassengerStatus(p.id, "Checked In")}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50/50 px-2"
                                >
                                  Check In
                                </Button>
                                <Button
                                  onClick={() => onUpdatePassengerStatus(p.id, "No Show")}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50/50 px-2"
                                >
                                  No Show
                                </Button>
                              </>
                            )}
                            {p.status === "Checked In" && (
                              <>
                                <Button
                                  onClick={() => onUpdatePassengerStatus(p.id, "On-Board")}
                                  size="sm"
                                  className="h-7 text-xs bg-[#c05621] hover:bg-[#a64819] text-white px-2"
                                >
                                  Board
                                </Button>
                                <Button
                                  onClick={() => onUpdatePassengerStatus(p.id, "No Show")}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50/50 px-2"
                                >
                                  No Show
                                </Button>
                              </>
                            )}
                            {p.status === "No Show" && (
                              <Button
                                onClick={() => handleOpenReallocateModal(p)}
                                size="sm"
                                className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 animate-pulse"
                              >
                                Reallocate Seat ({p.seat})
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

          {/* Seat Re-allocation Modal */}
          {selectedNoShow && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-600" />
                    Reallocate Seat {selectedNoShow.seat}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Passenger <strong>{selectedNoShow.name}</strong> marked as No Show. Select a Waitlisted/RAC passenger on Train {selectedNoShow.trainNo} to allocate this seat.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingWl ? (
                    <div className="py-8 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                    </div>
                  ) : wlPassengers.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {wlPassengers.map((wl) => (
                        <div key={wl.id} className="flex justify-between items-center p-2.5 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-100">{wl.name}</span>
                            <div className="text-[10px] text-slate-450">
                              PNR: {wl.pnr} | Status: <span className="font-semibold text-amber-700">{wl.status}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleConfirmReallocate(wl.id)}
                            disabled={reallocatingId === wl.id}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7"
                          >
                            {reallocatingId === wl.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Assign Seat"
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center text-slate-400 py-6">
                      No waitlisted or RAC passengers found for Train {selectedNoShow.trainNo}.
                    </p>
                  )}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-105">
                    <Button variant="outline" size="sm" onClick={() => setSelectedNoShow(null)} className="text-xs">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* --- SUB TAB 2: TRAIN OPERATIONS & INCIDENTS --- */}
      {activeSubTab === "ops" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Operations: Notifications Broadcast */}
            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-[#c05621]" />
                  Passenger Broadcast
                </CardTitle>
                <CardDescription className="text-xs">
                  Send real-time alerts or platform announcements to passengers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendAlert} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="broadcast-text" className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">
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
                  <Button type="submit" disabled={broadcastLoading} className="w-full bg-[#c05621] hover:bg-[#a64819] text-white text-xs h-9 font-semibold gap-1.5 shadow-md">
                    {broadcastLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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
            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 shadow-sm">
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
                        onChange={(e) => {
                          setDelayTrain(e.target.value);
                          fetchIncidents(e.target.value);
                        }}
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
                  <Button type="submit" disabled={delayLoading} className="w-full bg-[#c05621] hover:bg-[#a64819] text-white text-xs h-9 font-semibold gap-1.5 shadow-md">
                    {delayLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
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

          <div className="space-y-6">
            {/* Feature 3: Incident Reporting Form */}
            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-650" />
                  Report Incident Log
                </CardTitle>
                <CardDescription className="text-xs">
                  File maintenance, technical, medical, or cleanliness issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIncidentSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Coach (e.g. A1, B2)</label>
                      <Input
                        required
                        placeholder="A1"
                        value={incidentForm.coach}
                        onChange={(e) => setIncidentForm({ ...incidentForm, coach: e.target.value })}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Seat (Optional)</label>
                      <Input
                        placeholder="25"
                        value={incidentForm.seatNo}
                        onChange={(e) => setIncidentForm({ ...incidentForm, seatNo: e.target.value })}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Category</label>
                      <select
                        value={incidentForm.category}
                        onChange={(e) => setIncidentForm({ ...incidentForm, category: e.target.value })}
                        className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs focus:outline-none"
                      >
                        <option value="AC">AC / Heating</option>
                        <option value="Water">Water Supply</option>
                        <option value="Medical">Medical Emergency</option>
                        <option value="Cleanliness">Cleanliness</option>
                        <option value="Other">Other Issues</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Severity</label>
                      <select
                        value={incidentForm.severity}
                        onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                        className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Description</label>
                    <textarea
                      required
                      placeholder="Specify the issue details..."
                      rows={2}
                      value={incidentForm.description}
                      onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 focus-visible:outline-none"
                    />
                  </div>

                  <Button type="submit" disabled={incidentLoading} className="w-full bg-red-650 hover:bg-red-700 text-white text-xs h-8 font-semibold">
                    {incidentLoading ? "Filing Report..." : "Log Incident"}
                  </Button>

                  {incidentStatusMsg && (
                    <p className="text-center font-bold text-xs text-slate-650 mt-1">{incidentStatusMsg}</p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Incidents List */}
            <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 shadow-sm">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-bold">Active Incidents (Train {incidentForm.trainNo})</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {incidents.length > 0 ? (
                    incidents.map((inc) => (
                      <div key={inc.id} className="p-2 border border-slate-105 rounded bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>{inc.category} ({inc.coach}{inc.seatNo ? `/Seat ${inc.seatNo}` : ""})</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            inc.severity === "Critical" ? "bg-red-100 text-red-850" : "bg-amber-100 text-amber-850"
                          }`}>{inc.severity}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{inc.description}</p>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>Status: <strong>{inc.status}</strong></span>
                          <span>Reported by: {inc.reporterName}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-450 text-xs py-4">No logged incidents for this train.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* --- SUB TAB 3: CATERING SERVICE --- */}
      {activeSubTab === "catering" && (
        <Card className="border border-[#eaddcd] dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-705" />
              On-Board Catering & Meal Services
            </CardTitle>
            <CardDescription className="text-xs">
              Check passenger dietary preferences and track delivered status.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcfbf9]/60 dark:bg-slate-900/40 border-b border-[#f2eae1] dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">{t("passengerName")}</th>
                  <th className="px-6 py-3">Seat</th>
                  <th className="px-6 py-3">Preference</th>
                  <th className="px-6 py-3">Meal Status</th>
                  <th className="px-6 py-3 text-right">Service Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2eae1] dark:divide-slate-800">
                {stationPassengers.length > 0 ? (
                  stationPassengers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors text-sm text-slate-700 dark:text-slate-300">
                      <td className="px-6 py-3 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="px-6 py-3 font-semibold text-xs">{p.seat}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-900 font-medium">
                          {p.mealPreference || "Veg"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.mealStatus === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-amber-50 text-amber-700 border border-amber-200/50"
                        }`}>
                          {p.mealStatus || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          disabled={updatingMealId === p.id}
                          onClick={() => handleToggleMeal(p.id, p.mealStatus || "Pending")}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-amber-200 text-[#c05621] hover:bg-amber-50/50"
                        >
                          {updatingMealId === p.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : p.mealStatus === "Delivered" ? (
                            "Mark Pending"
                          ) : (
                            "Mark Delivered"
                          )}
                        </Button>
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
      )}

      {/* --- SUB TAB 4: DUTY ROSTER & ATTENDANCE --- */}
      {activeSubTab === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geolocation Attendance check-in */}
          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-750" />
                GPS Attendance Log
              </CardTitle>
              <CardDescription className="text-xs">
                Log duty shifts using real-time geolocation services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-amber-50 dark:bg-slate-900 rounded-full">
                  <Clock className="w-6 h-6 text-[#c05621]" />
                </div>
                {attendance ? (
                  <div>
                    <span className="text-xs font-bold text-emerald-600 block">Duty Check-In Active</span>
                    <p className="text-[11px] text-slate-450 mt-1">Checked in at {attendance.station} station.</p>
                    {gpsCoords && (
                      <code className="text-[10px] bg-slate-100 dark:bg-slate-950 p-1 rounded font-mono mt-1 block">
                        Lat: {gpsCoords.lat.toFixed(4)}, Lng: {gpsCoords.lng.toFixed(4)}
                      </code>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">No Active Check-In</span>
                    <p className="text-[11px] text-slate-400 mt-1">Please check in when you arrive at your scheduled station.</p>
                  </div>
                )}

                <div className="pt-2 w-full max-w-xs">
                  {attendance ? (
                    <Button
                      onClick={handleCheckOut}
                      disabled={attendanceLoading}
                      className="w-full bg-red-650 hover:bg-red-700 text-white text-xs h-9 font-semibold"
                    >
                      {attendanceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check-Out Shift"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCheckIn}
                      disabled={attendanceLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold"
                    >
                      {attendanceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check-In Shift"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roster list */}
          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-750" />
                Duty Shifts
              </CardTitle>
              <CardDescription className="text-xs">
                Assigned upcoming station manifests and train duties.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {shifts.length > 0 ? (
                  shifts.map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-3 border border-slate-105 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{s.station} Station</span>
                        <div className="text-[10px] text-slate-450 mt-0.5">
                          Date: {s.date ? new Date(s.date).toLocaleDateString() : "Today"} | Shift: <span className="font-medium">{s.shiftType || "Morning"}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}>{s.status}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-450 text-xs py-8">
                    No scheduled shifts found. Try adding seed shifts or contact system admin.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- SUB TAB 5: LUGGAGE TRACKING --- */}
      {activeSubTab === "luggage" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Register Luggage Form */}
          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-750" />
                Register Parcel Luggage
              </CardTitle>
              <CardDescription className="text-xs">
                Attach heavy luggage records and weight logs to a passenger PNR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLuggageSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Associate Passenger Booking</label>
                  <select
                    value={luggageForm.bookingId}
                    onChange={(e) => setLuggageForm({ ...luggageForm, bookingId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs focus:outline-none"
                  >
                    <option value="">Select Passenger...</option>
                    {passengers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (PNR: {p.pnr})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-505">Barcode Identifier</label>
                    <Input
                      required
                      placeholder="LUG102938"
                      value={luggageForm.barcode}
                      onChange={(e) => setLuggageForm({ ...luggageForm, barcode: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-505">Weight (kg)</label>
                    <Input
                      required
                      type="number"
                      step="0.1"
                      placeholder="12.5"
                      value={luggageForm.weight}
                      onChange={(e) => setLuggageForm({ ...luggageForm, weight: parseFloat(e.target.value) })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-505">Description</label>
                  <Input
                    placeholder="Fragile items / Heavy suitcase"
                    value={luggageForm.description}
                    onChange={(e) => setLuggageForm({ ...luggageForm, description: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <Button type="submit" disabled={luggageLoading} className="w-full bg-[#c05621] hover:bg-[#a64819] text-white text-xs h-9 font-semibold">
                  {luggageLoading ? "Registering..." : "Register Luggage"}
                </Button>

                {luggageStatusMsg && (
                  <p className="text-center font-bold text-xs text-slate-650 mt-1">{luggageStatusMsg}</p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Luggage log status board */}
          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-755" />
                Luggage Status Board
              </CardTitle>
              <CardDescription className="text-xs">
                Track loaded status of parcel luggage packages.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {luggageList.length > 0 ? (
                  luggageList.map((lug) => (
                    <div key={lug.id} className="p-3 border border-slate-105 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 text-xs flex justify-between items-start">
                      <div>
                        <div className="font-bold">{lug.passengerName} (PNR: {lug.pnr})</div>
                        <div className="text-[10px] text-slate-450 mt-0.5">
                          Barcode: <code className="font-mono bg-slate-100 dark:bg-slate-900 px-1 rounded">{lug.barcode}</code> | Weight: <strong>{lug.weight} kg</strong>
                        </div>
                        {lug.description && <p className="text-slate-550 mt-1 text-[11px]">{lug.description}</p>}
                        <div className="mt-2 flex gap-1">
                          {lug.status === "Registered" && (
                            <Button
                              size="xs"
                              onClick={() => handleUpdateLuggage(lug.id, "Loaded")}
                              className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 h-6"
                            >
                              Load Package
                            </Button>
                          )}
                          {lug.status === "Loaded" && (
                            <Button
                              size="xs"
                              onClick={() => handleUpdateLuggage(lug.id, "Unloaded")}
                              className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 h-6"
                            >
                              Unload Package
                            </Button>
                          )}
                          {lug.status === "Unloaded" && (
                            <Button
                              size="xs"
                              onClick={() => handleUpdateLuggage(lug.id, "Delivered")}
                              className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 h-6"
                            >
                              Deliver Package
                            </Button>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lug.status === "Delivered" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : lug.status === "Loaded"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-800"
                      }`}>{lug.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-450 text-xs py-8">No registered luggage found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
