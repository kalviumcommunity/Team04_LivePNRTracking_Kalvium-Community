"use client";

import { useState } from "react";
import { Search, Train, User, MapPin, ChevronRight, AlertCircle, Map, Info, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Passenger {
  name: string;
  bookingStatus: string;
  currentStatus: string;
}

interface PnrDetails {
  pnr: string;
  trainName: string;
  trainNo: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  date: string;
  class: string;
  delayStatus: string;
  passengers: Passenger[];
}

const MOCK_PNR_DATA: Record<string, PnrDetails> = {
  "4109857123": {
    pnr: "4109857123",
    trainName: "Rajdhani Express",
    trainNo: "12425",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Kanpur Central",
    toCode: "CNB",
    date: "23 Dec 2026",
    class: "AC 3 Tier (3A)",
    delayStatus: "On Time",
    passengers: [
      { name: "Passenger 1", bookingStatus: "CNF / A1 / 25", currentStatus: "CNF" },
      { name: "Passenger 2", bookingStatus: "CNF / A1 / 26", currentStatus: "CNF" },
    ],
  },
  "1234567890": {
    pnr: "1234567890",
    trainName: "Shatabdi Express",
    trainNo: "12004",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Lucknow Jn",
    toCode: "LJN",
    date: "24 Dec 2026",
    class: "AC Chair Car (CC)",
    delayStatus: "15 Mins Delay",
    passengers: [
      { name: "Suresh Kumar", bookingStatus: "WL / 12", currentStatus: "CNF / C2 / 14" },
    ],
  },
};

interface PnrTrackerProps {
  initialPnr?: string | null;
}

export function PnrTracker({ initialPnr }: PnrTrackerProps = {}) {
  const [pnrInput, setPnrInput] = useState("");
  const [activePnr, setActivePnr] = useState<PnrDetails | null>(MOCK_PNR_DATA["4109857123"]);
  const [error, setError] = useState("");

  const [prevPnr, setPrevPnr] = useState(initialPnr);

  if (initialPnr !== prevPnr) {
    setPrevPnr(initialPnr);
    setPnrInput(initialPnr || "");
    if (initialPnr && MOCK_PNR_DATA[initialPnr]) {
      setActivePnr(MOCK_PNR_DATA[initialPnr]);
    } else if (initialPnr && initialPnr.length === 10 && /^\d+$/.test(initialPnr)) {
      setActivePnr({
        pnr: initialPnr,
        trainName: "Garib Rath Express",
        trainNo: "12204",
        from: "New Delhi",
        fromCode: "NDLS",
        to: "Kathgodam",
        toCode: "KGM",
        date: "25 Dec 2026",
        class: "AC 3 Tier (3A)",
        delayStatus: "On Time",
        passengers: [
          { name: "Passenger 1", bookingStatus: "RAC / 2", currentStatus: "CNF / G5 / 4" }
        ]
      });
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pnrInput.length !== 10 || !/^\d+$/.test(pnrInput)) {
      setError("Please enter a valid 10-digit numeric PNR.");
      setActivePnr(null);
      return;
    }

    if (MOCK_PNR_DATA[pnrInput]) {
      setActivePnr(MOCK_PNR_DATA[pnrInput]);
    } else {
      // Generate randomized tracking data if not in mock records
      setActivePnr({
        pnr: pnrInput,
        trainName: "Garib Rath Express",
        trainNo: "12204",
        from: "New Delhi",
        fromCode: "NDLS",
        to: "Kathgodam",
        toCode: "KGM",
        date: "25 Dec 2026",
        class: "AC 3 Tier (3A)",
        delayStatus: "On Time",
        passengers: [
          { name: "Passenger 1", bookingStatus: "RAC / 2", currentStatus: "CNF / G5 / 4" }
        ]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Live PNR Tracking</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time updates of your train booking status.</p>
      </div>

      {/* PNR Search Box */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={pnrInput}
            onChange={(e) => setPnrInput(e.target.value)}
            placeholder="Enter 10-digit PNR Number"
            className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 focus-visible:ring-amber-500/20 text-slate-900 dark:text-slate-100"
          />
        </div>
        <Button type="submit" className="h-11 bg-[#c05621] hover:bg-[#a64819] text-white px-6 font-medium shadow-md shadow-[#c05621]/10">
          Check PNR Status
        </Button>
      </form>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activePnr && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left - Main Details Card */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border border-[#eaddcd] dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl shadow-md">
              <CardHeader className="border-b border-[#f2eae1] dark:border-slate-800/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-slate-900 border border-amber-200/50 dark:border-slate-800 text-[#c05621]">
                      <Train className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {activePnr.trainName} <span className="text-slate-400 dark:text-slate-500">#{activePnr.trainNo}</span>
                      </CardTitle>
                      <CardDescription className="text-xs font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider mt-0.5">
                        PNR: {activePnr.pnr}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      activePnr.delayStatus === "On Time" 
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50" 
                        : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50"
                    }`}>
                      {activePnr.delayStatus}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Station Timeline */}
                <div className="relative py-4 flex items-center justify-between">
                  {/* Background connect line */}
                  <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-[#ebdcd0] dark:bg-slate-800" />
                  
                  {/* Source Station */}
                  <div className="relative z-10 flex flex-col items-center bg-[#fbf9f6] dark:bg-slate-950 p-2 rounded-xl border border-dashed border-[#e3d0c0] dark:border-slate-800 w-24">
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{activePnr.fromCode}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center truncate w-full">{activePnr.from}</span>
                  </div>

                  {/* Active Train Icon Indicator in center */}
                  <div className="relative z-10 p-2 bg-[#c05621] text-white rounded-full border-4 border-[#fbf9f6] dark:border-slate-950 shadow-md">
                    <Train className="w-4 h-4 animate-pulse" />
                  </div>

                  {/* Destination Station */}
                  <div className="relative z-10 flex flex-col items-center bg-[#fbf9f6] dark:bg-slate-950 p-2 rounded-xl border border-dashed border-[#e3d0c0] dark:border-slate-800 w-24">
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{activePnr.toCode}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center truncate w-full">{activePnr.to}</span>
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#fcfbf9] dark:bg-slate-900/40 border border-[#f2eae1] dark:border-slate-800/80 text-sm">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-xs">Date of Journey</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5 block">{activePnr.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-xs">Travel Class</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5 block">{activePnr.class}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 dark:text-slate-500 block text-xs">Platform Estimate</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5 block">Platform 3</span>
                  </div>
                </div>

                {/* Passengers List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Passenger Details</h3>
                  <div className="divide-y divide-[#f2eae1] dark:divide-slate-800">
                    {activePnr.passengers.map((passenger, index) => (
                      <div key={index} className="py-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 block">{passenger.name}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">Booking: {passenger.bookingStatus}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {passenger.currentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Sidebar Visuals (Order Food & Map) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Promo Card: Order Food */}
            <Card className="border-none bg-[#3b2a1a] text-amber-50 shadow-lg relative overflow-hidden">
              {/* Background gradient shapes */}
              <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 rounded-full bg-amber-500/20 blur-xl pointer-events-none" />
              <CardContent className="p-5 flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center text-[#f28e2b] border border-amber-500/20 shrink-0">
                  <Coffee className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base leading-tight">Order Food in Train</h3>
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    Get restaurant food delivered right to your train seat. Safe, hot, and hygienic.
                  </p>
                  <Button variant="link" className="text-xs font-bold text-amber-400 hover:text-amber-300 p-0 h-auto flex items-center gap-1">
                    Order Now <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Map Layout Placeholder */}
            <Card className="border border-[#eaddcd] dark:border-slate-800/80 overflow-hidden bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl">
              <CardHeader className="border-b border-[#f2eae1] dark:border-slate-800/50 p-4">
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Map className="w-4 h-4 text-amber-700 dark:text-amber-500" />
                  Live Route Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-44 bg-slate-100 dark:bg-slate-950 relative flex items-center justify-center">
                  {/* Simulated Map visual */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_1px,transparent_1px)] bg-[size:10px_10px]" />
                  {/* Simulated Route Line */}
                  <svg className="w-4/5 h-1/2 absolute text-[#c05621]" viewBox="0 0 100 50">
                    <path d="M 10,25 Q 50,10 90,25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
                    <circle cx="10" cy="25" r="4" fill="#c05621" />
                    <circle cx="90" cy="25" r="4" fill="#319795" />
                    {/* Live Train Dot */}
                    <circle cx="45" cy="19" r="5" fill="#c05621" className="animate-ping" />
                    <circle cx="45" cy="19" r="3.5" fill="#ffffff" stroke="#c05621" strokeWidth="2.5" />
                  </svg>
                  
                  {/* Labels on Map */}
                  <div className="absolute left-4 top-2/3 text-[10px] font-bold text-slate-700 dark:text-slate-400">{activePnr.fromCode}</div>
                  <div className="absolute right-4 top-2/3 text-[10px] font-bold text-slate-700 dark:text-slate-400">{activePnr.toCode}</div>
                  
                  <span className="text-xs bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm relative z-10 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#c05621]" />
                    Passing Aligarh Jn
                  </span>
                </div>
                <div className="p-3 bg-[#fcfbf9] dark:bg-slate-900/40 border-t border-[#f2eae1] dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Updates every 2 mins
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Delay: None</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
