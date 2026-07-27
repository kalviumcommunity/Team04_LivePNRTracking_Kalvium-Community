"use client";

import { useState } from "react";
import { 
  Search, 
  FileText, 
  Download, 
  MessageSquare, 
  PhoneCall, 
  HelpCircle, 
  X, 
  Send, 
  Copy, 
  Check, 
  Activity, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Filter,
  Train,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

export interface BookingRecord {
  pnr: string;
  date: string;
  trainName: string;
  trainNo: string;
  status: "CNF" | "WL" | "CAN";
  statusText: string;
  fare: string;
  fromStation?: string;
  toStation?: string;
  seat?: string;
}

interface BookingHistoryProps {
  bookings: BookingRecord[];
  onCheckStatus?: (pnr: string) => void;
}

export function BookingHistory({ bookings, onCheckStatus }: BookingHistoryProps) {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedPnr, setCopiedPnr] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "agent", text: "Hello! Welcome to 24/7 Live Railway Support. How can I assist you with your booking today?" }
  ]);
  const [showCallToast, setShowCallToast] = useState(false);

  // Copy PNR to Clipboard with visual feedback
  const handleCopyPnr = (pnr: string) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(null), 2000);
  };

  const filteredData = bookings.filter((booking) => {
    const matchesSearch = 
      booking.pnr.includes(filterText) ||
      booking.trainName.toLowerCase().includes(filterText.toLowerCase()) ||
      booking.trainNo.includes(filterText);
    
    const matchesStatus = 
      statusFilter === "ALL" || 
      booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let reply = "Thank you for reaching out! A travel specialist is reviewing your request.";
      if (userText.toLowerCase().includes("cancel") || userText.toLowerCase().includes("refund")) {
        reply = "For ticket cancellations and instant refunds, you can initiate cancellation directly under your Booking Details or call 139.";
      } else if (userText.toLowerCase().includes("seat") || userText.toLowerCase().includes("upgrade")) {
        reply = "Seat upgrades are subject to chart preparation 4 hours before departure.";
      }
      setChatMessages((prev) => [...prev, { sender: "agent", text: reply }]);
    }, 800);
  };

  const handleCallTollFree = () => {
    setShowCallToast(true);
    window.location.href = "tel:139";
    setTimeout(() => setShowCallToast(false), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t("bookingHistory")}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t("bookingHistorySub")}</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-3.5 py-2 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
          <Activity className="w-4 h-4 animate-pulse text-[#c05621]" />
          <span>Auto-sync active: connected to IRCTC gateway</span>
        </div>
      </div>

      {/* Quick Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Bookings Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t("totalBookings")}</span>
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100 block">{bookings.length}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-slate-900 border border-amber-200/50 dark:border-slate-800/50 flex items-center justify-center text-[#c05621] transition-transform duration-300 group-hover:rotate-6">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 text-[11px] text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <span>Across all registered mobile credentials</span>
          </div>
        </div>

        {/* Confirmed / Active Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t("activeUpcoming")}</span>
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100 block">
                {bookings.filter((b) => b.status === "CNF" || b.status === "WL").length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-slate-900 border border-emerald-200/50 dark:border-slate-800/50 flex items-center justify-center text-emerald-600 transition-transform duration-300 group-hover:rotate-6">
              <Train className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 text-[11px] text-emerald-600 dark:text-emerald-450 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live status monitoring active</span>
          </div>
        </div>

        {/* Cancelled Journeys Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-300 group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t("cancelledJourneys")}</span>
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100 block">
                {bookings.filter((b) => b.status === "CAN").length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-slate-900 border border-rose-200/50 dark:border-slate-800/50 flex items-center justify-center text-rose-600 transition-transform duration-300 group-hover:rotate-6">
              <X className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 text-[11px] text-rose-500 dark:text-rose-450 font-medium flex items-center gap-1.5">
            <span>• Refunds credited to source accounts</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Bookings Content */}
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-white/40 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search by PNR, train name, or train number..."
              className="pl-9 h-10 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#c05621]/20 focus:border-[#c05621] rounded-xl text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            {[
              { id: "ALL", label: "All Bookings" },
              { id: "CNF", label: "Confirmed" },
              { id: "WL", label: "Waitlisted" },
              { id: "CAN", label: "Cancelled" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-[#c05621] text-white shadow-sm"
                    : "bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop View Table (hidden on mobile) */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/30 backdrop-blur-xl shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfbf9]/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">PNR Number</th>
                <th className="px-6 py-4">Journey Date</th>
                <th className="px-6 py-4">Train & Route Details</th>
                <th className="px-6 py-4">{t("currentStatus")}</th>
                <th className="px-6 py-4 text-right">Fare Paid</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredData.length > 0 ? (
                filteredData.map((booking) => (
                  <tr key={booking.pnr} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors text-sm text-slate-750 dark:text-slate-300 animate-in fade-in duration-150">
                    {/* PNR Number */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100 tracking-wide">
                          {booking.pnr}
                        </span>
                        <button
                          onClick={() => handleCopyPnr(booking.pnr)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Copy PNR"
                        >
                          {copiedPnr === booking.pnr ? (
                            <Check className="w-3.5 h-3.5 text-emerald-650" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{booking.date}</span>
                      </div>
                    </td>

                    {/* Train Info */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span className="text-amber-700 dark:text-amber-500 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30">
                            {booking.trainNo}
                          </span>
                          <span className="truncate max-w-[180px]">{booking.trainName}</span>
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {booking.fromStation || "NDLS"} → {booking.toStation || "HWH"}
                          </span>
                          {booking.seat && (
                            <span className="ml-1.5 font-semibold text-slate-505 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">
                              {booking.seat}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                        booking.status === "CNF"
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50"
                          : booking.status === "WL"
                          ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50"
                          : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-250/30"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          booking.status === "CNF" 
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" 
                            : booking.status === "WL" 
                            ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-pulse" 
                            : "bg-rose-500"
                        }`} />
                        {booking.statusText}
                      </span>
                    </td>

                    {/* Fare */}
                    <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 font-mono text-base">
                      {booking.fare}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {onCheckStatus && booking.status !== "CAN" ? (
                        <Button
                          onClick={() => onCheckStatus(booking.pnr)}
                          size="sm"
                          className="h-8 px-3 rounded-lg text-xs font-bold bg-[#c05621]/10 hover:bg-[#c05621] text-[#c05621] hover:text-white transition-all shadow-none flex items-center gap-1 mx-auto"
                        >
                          Track Live
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-450 font-medium">
                    No matching bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Ticket-Style Card Layout (hidden on desktop) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredData.length > 0 ? (
            filteredData.map((booking) => (
              <div 
                key={booking.pnr} 
                className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-150"
              >
                {/* Perforation Slits side visual helper */}
                <div className="absolute -left-3 top-[55%] -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 z-10" />
                <div className="absolute -right-3 top-[55%] -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 z-10" />

                {/* Ticket Top Half */}
                <div className="p-5 pb-4 space-y-3.5">
                  {/* PNR & Status Row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PNR</span>
                      <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-lg leading-none">
                        {booking.pnr}
                      </span>
                      <button
                        onClick={() => handleCopyPnr(booking.pnr)}
                        className="p-1 text-slate-405 hover:text-slate-950 active:scale-95"
                      >
                        {copiedPnr === booking.pnr ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      booking.status === "CNF"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250/20"
                        : booking.status === "WL"
                        ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-250/20"
                        : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-250/20"
                    }`}>
                      {booking.statusText}
                    </span>
                  </div>

                  {/* Train info */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                      TRAIN #{booking.trainNo}
                    </div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                      {booking.trainName}
                    </div>
                  </div>

                  {/* Journey Date and Route */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50 dark:border-slate-900">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block uppercase">Journey Date</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{booking.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block uppercase">Route</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                        {booking.fromStation || "NDLS"} → {booking.toStation || "HWH"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perforation Line Separator */}
                <div className="relative flex items-center justify-between px-3">
                  <div className="w-full border-t-2 border-dashed border-slate-100 dark:border-slate-900" />
                </div>

                {/* Ticket Bottom Half */}
                <div className="p-5 pt-4 bg-slate-50/50 dark:bg-slate-950/25 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Fare Paid</span>
                    <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-base">{booking.fare}</span>
                  </div>
                  
                  {onCheckStatus && booking.status !== "CAN" ? (
                    <Button
                      onClick={() => onCheckStatus(booking.pnr)}
                      size="sm"
                      className="h-8 px-4 rounded-xl text-xs font-bold bg-[#c05621] hover:bg-[#a8481b] text-white transition-all flex items-center gap-1"
                    >
                      Track Status
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-slate-405">Cancelled Ticket</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No matching bookings found.
            </div>
          )}
        </div>
      </div>

      {/* Export Records & Support row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support Callout */}
        <Card className="border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 p-6 flex flex-col justify-between space-y-4 rounded-2xl">
          <div className="space-y-2">
            <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#c05621]" />
              Need help with a booking?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our 24/7 dedicated travel support desk is available to assist you with seat upgrades, cancellation refunds, and ticket rebooking.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsChatOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl"
            >
              <MessageSquare className="w-4 h-4 text-[#c05621]" />
              Chat Support
            </Button>
            <Button
              onClick={handleCallTollFree}
              variant="outline"
              size="sm"
              className="gap-2 text-xs text-[#c05621] border-amber-200 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 rounded-xl"
            >
              <PhoneCall className="w-4 h-4" />
              Call Toll-Free
            </Button>
          </div>
        </Card>

        {/* Export Records */}
        <Card className="border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 p-6 flex flex-col justify-between space-y-4 rounded-2xl">
          <div className="space-y-2">
            <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#c05621]" />
              Export Statements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Retrieve full transaction spreadsheets or generate optimized print-ready PDFs of your travel history for expense claims.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                if (bookings.length === 0) return;
                const printWindow = window.open("", "_blank");
                if (!printWindow) return;
                
                const bookingsHtml = bookings
                  .map(
                    (b) => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: monospace;">${b.pnr}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${b.date}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><b>${b.trainName}</b> (#${b.trainNo})</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${b.statusText}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${b.fare}</td>
                  </tr>
                `
                  )
                  .join("");

                printWindow.document.write(`
                  <html>
                    <head>
                      <title>ixigo PNR - Travel History Statement</title>
                      <style>
                        body { font-family: system-ui, -apple-system, sans-serif; color: #333; padding: 40px; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #c05621; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { font-size: 24px; font-weight: bold; color: #c05621; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #faf8f5; text-align: left; padding: 12px 10px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }
                        .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <div>
                          <div class="logo">ixigo PNR Tracker</div>
                          <div style="font-size: 12px; margin-top: 5px; color: #666;">Premium Member Travel Statement</div>
                        </div>
                        <div style="text-align: right; font-size: 12px; color: #666;">
                          <div>Date Generated: ${new Date().toLocaleDateString("en-GB")}</div>
                          <div>Total Bookings: ${bookings.length}</div>
                        </div>
                      </div>
                      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Travel History Statement</h2>
                      <table>
                        <thead>
                          <tr>
                            <th>PNR Number</th>
                            <th>Travel Date</th>
                            <th>Train Details</th>
                            <th>Status</th>
                            <th style="text-align: right;">Fare</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${bookingsHtml}
                        </tbody>
                      </table>
                      <div class="footer">
                        This is an automatically generated travel statement from your ixigo PNR Tracker portal.
                      </div>
                      <script>
                        window.onload = function() {
                          window.print();
                          window.close();
                        };
                      </script>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }}
              variant="outline"
              size="sm"
              className="gap-2 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl"
              disabled={bookings.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
              PDF Statement
            </Button>
            <Button
              onClick={() => {
                if (bookings.length === 0) return;
                const headers = ["PNR Number", "Travel Date", "Train Name", "Train No", "Status", "Fare"];
                const rows = bookings.map((b) => [
                  b.pnr,
                  b.date,
                  b.trainName,
                  b.trainNo,
                  b.statusText,
                  b.fare,
                ]);
                const csvContent =
                  "data:text/csv;charset=utf-8," +
                  [headers.join(","), ...rows.map((e) => e.map(val => `"${val}"`).join(","))].join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `ixigo_pnr_bookings_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="outline"
              size="sm"
              className="gap-2 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl"
              disabled={bookings.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </Button>
          </div>
        </Card>
      </div>

      {/* Toll-Free Call Toast Banner */}
      {showCallToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#c05621] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <PhoneCall className="w-5 h-5 text-amber-200 animate-pulse" />
          <div>
            <p className="text-xs font-bold">Dialing Railway Toll-Free Helpline...</p>
            <p className="text-[11px] text-amber-100 font-mono">1800-111-139 / 139</p>
          </div>
          <button onClick={() => setShowCallToast(false)} className="ml-2 hover:bg-white/20 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 24/7 Chat Support Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#FAF7F2] dark:bg-slate-950 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c05621] text-white flex items-center justify-center font-bold text-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">24/7 Railway Support</h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Agent Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/50 dark:bg-slate-950/30">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#c05621] text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-none shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <Input
                type="text"
                placeholder="Ask about seat upgrades, cancellations..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500/30"
              />
              <Button type="submit" size="sm" className="h-10 px-3.5 bg-[#c05621] hover:bg-[#a8481b] text-white rounded-xl">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
