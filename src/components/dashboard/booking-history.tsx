"use client";

import { useState } from "react";
import { Search, FileText, Download, MessageSquare, PhoneCall, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export interface BookingRecord {
  pnr: string;
  date: string;
  trainName: string;
  trainNo: string;
  status: "CNF" | "WL" | "CAN";
  statusText: string;
  fare: string;
}

interface BookingHistoryProps {
  bookings: BookingRecord[];
}

export function BookingHistory({ bookings }: BookingHistoryProps) {
  const [filterText, setFilterText] = useState("");

  const filteredData = bookings.filter((booking) =>
    booking.pnr.includes(filterText) ||
    booking.trainName.toLowerCase().includes(filterText.toLowerCase()) ||
    booking.trainNo.includes(filterText)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Booking History</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your past and upcoming train journeys.</p>
      </div>

      {/* Quick Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Bookings</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 block mt-1">45</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-slate-950 border border-amber-200/50 dark:border-slate-800 flex items-center justify-center text-[#c05621] font-bold text-sm">
            45
          </div>
        </Card>

        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active / Upcoming</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 block mt-1">3</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-slate-950 border border-emerald-200/50 dark:border-slate-800 flex items-center justify-center text-emerald-700 font-bold text-sm">
            3
          </div>
        </Card>

        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cancelled Journeys</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 block mt-1">7</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-slate-950 border border-red-200/50 dark:border-slate-800 flex items-center justify-center text-red-700 font-bold text-sm">
            7
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
              placeholder="Search PNR or Train..."
              className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfbf9]/60 dark:bg-slate-900/40 border-b border-[#f2eae1] dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">PNR Number</th>
                <th className="px-6 py-4">Travel Date</th>
                <th className="px-6 py-4">Train Details</th>
                <th className="px-6 py-4">Status</th>
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
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Support
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-[#c05621] border-amber-200 hover:bg-amber-50/50">
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
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              PDF Statement
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
