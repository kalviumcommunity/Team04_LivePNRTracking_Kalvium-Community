"use client";

import { useState } from "react";
import { Search, FileText, Download, MessageSquare, PhoneCall, HelpCircle, X, Send } from "lucide-react";
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
}

export function BookingHistory({ bookings }: BookingHistoryProps) {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "agent", text: "Hello! Welcome to 24/7 Live Railway Support. How can I assist you with your booking today?" }
  ]);
  const [showCallToast, setShowCallToast] = useState(false);

  const filteredData = bookings.filter((booking) =>
    booking.pnr.includes(filterText) ||
    booking.trainName.toLowerCase().includes(filterText.toLowerCase()) ||
    booking.trainNo.includes(filterText)
  );

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
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t("bookingHistory")}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t("bookingHistorySub")}</p>
      </div>

      {/* Quick Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("totalBookings")}</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 block mt-1">{bookings.length}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-slate-950 border border-amber-200/50 dark:border-slate-800 flex items-center justify-center text-[#c05621] font-bold text-sm">
            {bookings.length}
          </div>
        </Card>

        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("activeUpcoming")}</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 block mt-1">
              {bookings.filter((b) => b.status === "CNF" || b.status === "WL").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-slate-950 border border-emerald-200/50 dark:border-slate-800 flex items-center justify-center text-emerald-700 font-bold text-sm">
            {bookings.filter((b) => b.status === "CNF" || b.status === "WL").length}
          </div>
        </Card>

        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("cancelledJourneys")}</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 block mt-1">
              {bookings.filter((b) => b.status === "CAN").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-slate-950 border border-red-200/50 dark:border-slate-800 flex items-center justify-center text-red-600 font-bold text-sm">
            {bookings.filter((b) => b.status === "CAN").length}
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-[#eaddcd] dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl shadow-md overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-[#f2eae1] dark:border-slate-800/50 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={t("quickFilterPlaceholder")}
              className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfbf9]/60 dark:bg-slate-900/40 border-b border-[#f2eae1] dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">PNR</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Train</th>
                <th className="px-6 py-4">{t("currentStatus")}</th>
                <th className="px-6 py-4 text-right">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2eae1] dark:divide-slate-800">
              {filteredData.length > 0 ? (
                filteredData.map((booking) => (
                  <tr key={booking.pnr} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors text-sm text-slate-700 dark:text-slate-300">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {booking.pnr}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {booking.date}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {booking.trainName} <span className="font-normal text-slate-400 text-xs">#{booking.trainNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        booking.status === "CNF"
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50"
                          : booking.status === "WL"
                          ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50"
                          : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/50"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          booking.status === "CNF" ? "bg-emerald-500" : booking.status === "WL" ? "bg-amber-500" : "bg-red-500"
                        }`} />
                        {booking.statusText}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">
                      {booking.fare}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No matching bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export Records & Support row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support Callout */}
        <Card className="border border-[#eaddcd] dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
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
              className="gap-1.5 text-xs bg-white dark:bg-slate-900 hover:bg-slate-50"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#c05621]" />
              Chat Support
            </Button>
            <Button
              onClick={handleCallTollFree}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-[#c05621] border-amber-200 hover:bg-amber-50/50"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Toll-Free
            </Button>
          </div>
        </Card>

        {/* Export Records */}
        <Card className="border border-[#eaddcd] dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#c05621]" />
              Export Records
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
              className="gap-1.5 text-xs"
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
              className="gap-1.5 text-xs"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#eaddcd] dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#FAF7F2] dark:bg-slate-950 p-4 border-b border-[#eaddcd] dark:border-slate-800 flex items-center justify-between">
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
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-none shadow-sm"
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
