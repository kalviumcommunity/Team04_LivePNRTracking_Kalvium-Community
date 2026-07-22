"use client";

import { useState } from "react";
import { Star, Plus, RefreshCw, Calendar, Clock, ArrowRight, ShieldCheck, Tag, Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BookingRecord {
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

interface SavedFavoritesProps {
  favorites: { id: string; pnr: string; label: string }[];
  bookings: BookingRecord[];
  onAddFavorite: (pnr: string, label: string) => void;
  onDeleteFavorite: (id: string) => void;
  onCheckStatus: (pnr: string) => void;
  onBookTicket: (
    trainName: string,
    trainNo: string,
    fromCode: string,
    from: string,
    toCode: string,
    to: string,
    travelClass: string,
    passengerName: string
  ) => void;
}

export function SavedFavorites({ 
  favorites, 
  bookings, 
  onAddFavorite, 
  onDeleteFavorite, 
  onCheckStatus, 
  onBookTicket 
}: SavedFavoritesProps) {
  const [bookingIndex, setBookingIndex] = useState<number | null>(null);
  const [passengerName, setPassengerName] = useState("Ramesh Rathore");
  const [travelClass, setTravelClass] = useState("AC 3 Tier (3A)");

  // Form states for creating new favorite
  const [isAdding, setIsAdding] = useState(false);
  const [newPnr, setNewPnr] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [formError, setFormError] = useState("");

  // Map database favorites to UI layout details
  const routes = favorites.map((fav) => {
    const booking = bookings.find((b) => b.pnr === fav.pnr);
    return {
      id: fav.id,
      pnr: fav.pnr,
      trainName: booking ? booking.trainName : "Express Special",
      trainNo: booking ? booking.trainNo : "12000",
      from: booking?.fromStation ?? "New Delhi",
      fromCode: booking?.fromStation ?? "NDLS",
      to: booking?.toStation ?? "Mumbai Central",
      toCode: booking?.toStation ?? "MMCT",
      schedule: "Daily Runs",
      duration: "4h 45m",
      label: fav.label || "Pinned Route",
    };
  });

  const handleBookSubmit = (route: typeof routes[0]) => {
    if (!passengerName) return;
    onBookTicket(
      route.trainName,
      route.trainNo,
      route.fromCode,
      route.from,
      route.toCode,
      route.to,
      travelClass,
      passengerName
    );
    setBookingIndex(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!/^\d{10}$/.test(newPnr)) {
      setFormError("PNR must be exactly 10 numeric digits.");
      return;
    }

    if (!newLabel) {
      setFormError("Please enter a custom name label.");
      return;
    }

    onAddFavorite(newPnr, newLabel);
    setNewPnr("");
    setNewLabel("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Saved Favorites</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your frequent routes and monitor live PNR status in one tap.</p>
      </div>

      {/* Grid of Favorite Cards + Add New Button */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routes.map((route, index) => {
          const isBooking = bookingIndex === index;
          return (
            <Card key={route.id} className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl shadow-md flex flex-col justify-between overflow-hidden relative min-h-[260px] transition-all duration-300">
              <CardHeader className="pb-3 border-b border-[#f2eae1] dark:border-slate-800/50">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-500 tracking-wider">Favorite Route</span>
                    <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">{route.trainName}</CardTitle>
                    <CardDescription className="text-xs">PNR: {route.pnr} • #{route.trainNo}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onDeleteFavorite(route.id)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove Favorite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1.5 rounded-full bg-amber-50 dark:bg-slate-900 border border-amber-200/50 text-[#c05621]">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-between gap-4">
                {isBooking ? (
                  // Booking Form view
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div>
                        <label htmlFor={`passenger-${index}`} className="text-[9px] font-bold text-slate-500 uppercase">Passenger Name</label>
                        <Input
                          id={`passenger-${index}`}
                          value={passengerName}
                          onChange={(e) => setPassengerName(e.target.value)}
                          placeholder="Passenger Name"
                          className="h-8 text-xs bg-white mt-0.5"
                        />
                      </div>
                      <div>
                        <label htmlFor={`class-${index}`} className="text-[9px] font-bold text-slate-500 uppercase">Travel Class</label>
                        <select
                          id={`class-${index}`}
                          value={travelClass}
                          onChange={(e) => setTravelClass(e.target.value)}
                          className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs mt-0.5 focus:outline-none"
                        >
                          <option value="AC 3 Tier (3A)">AC 3 Tier (3A)</option>
                          <option value="AC 2 Tier (2A)">AC 2 Tier (2A)</option>
                          <option value="Sleeper Class (SL)">Sleeper Class (SL)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => setBookingIndex(null)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleBookSubmit(route)}
                        size="sm"
                        className="flex-1 text-xs h-8 bg-[#c05621] hover:bg-[#a64819] text-white"
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Default details view
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Route connection */}
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col">
                          <span className="text-lg font-extrabold">{route.fromCode}</span>
                          <span className="text-[10px] text-slate-400 truncate w-20">{route.from}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                        <div className="flex flex-col text-right">
                          <span className="text-lg font-extrabold">{route.toCode}</span>
                          <span className="text-[10px] text-slate-400 truncate w-20">{route.to}</span>
                        </div>
                      </div>

                      {/* Stats list */}
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-[#f2eae1] dark:border-slate-800/80 pt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {route.schedule}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {route.duration}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onCheckStatus(route.pnr)}
                        variant="outline"
                        className="flex-1 border-[#c05621] text-[#c05621] hover:bg-amber-50/50 text-xs font-semibold h-9"
                      >
                        PNR Status
                      </Button>
                      <Button
                        onClick={() => {
                          setPassengerName("Ramesh Rathore");
                          setBookingIndex(index);
                        }}
                        className="flex-1 bg-[#c05621] hover:bg-[#a64819] text-white text-xs font-semibold h-9"
                      >
                        <Ticket className="w-3.5 h-3.5 mr-1" />
                        Book Ticket
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Favorite Card / Form */}
        {isAdding ? (
          <Card className="border border-amber-300 dark:border-slate-800 bg-white/90 p-5 flex flex-col justify-between min-h-[260px]">
            <form onSubmit={handleAddSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Pin New Route</span>
                <div>
                  <label htmlFor="fav-pnr" className="text-[9px] font-bold text-slate-500 uppercase">10-Digit PNR</label>
                  <Input
                    id="fav-pnr"
                    value={newPnr}
                    onChange={(e) => setNewPnr(e.target.value)}
                    placeholder="e.g. 4109857123"
                    className="h-8 text-xs bg-white mt-0.5"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label htmlFor="fav-label" className="text-[9px] font-bold text-slate-500 uppercase">Custom Label</label>
                  <Input
                    id="fav-label"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Home to Delhi Trip"
                    className="h-8 text-xs bg-white mt-0.5"
                  />
                </div>
                {formError && (
                  <span className="text-[10px] text-red-500 font-semibold block">{formError}</span>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setFormError("");
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="flex-1 text-xs h-8 bg-[#c05621] hover:bg-[#a64819] text-white"
                >
                  Save Favorite
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card 
            onClick={() => setIsAdding(true)}
            className="border-2 border-dashed border-[#d8c3ae] dark:border-slate-800 bg-[#fdfcfb]/40 dark:bg-slate-950/10 flex flex-col items-center justify-center p-6 text-center hover:bg-[#fbf9f6]/80 hover:border-[#c05621] dark:hover:border-slate-700 transition-all cursor-pointer min-h-[260px]"
          >
            <div className="p-3 rounded-full bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 text-[#c05621] mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Add New Favorite</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
              Save a new PNR number or frequent train route for fast lookup.
            </span>
          </Card>
        )}
      </div>

      {/* Recent Route Searches list */}
      <Card className="border border-[#eaddcd] dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#f2eae1] dark:border-slate-800/50 p-4">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-700 dark:text-amber-500" />
            Recent Route Searches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#f2eae1] dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Bangalore (SBC)</span>
                <span className="text-slate-300 mx-2">→</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Mumbai (CSMT)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Searched 4 hours ago</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 font-bold">
                  Seats Available
                </span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">New Delhi (NDLS)</span>
                <span className="text-slate-300 mx-2">→</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Lucknow (LJN)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Searched Yesterday</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 font-bold">
                  On Time
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promos Section (Zero Cancellation Banner & Partner Offers) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Zero Cancellation Banner */}
        <div className="md:col-span-8 p-5 rounded-2xl bg-gradient-to-r from-amber-950 to-stone-900 text-amber-50 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg border border-amber-900/10">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_right,rgba(245,158,11,0.1),transparent)] pointer-events-none" />
          <div className="space-y-1.5 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              LiveRail Assured
            </span>
            <h3 className="text-lg font-bold">Zero Cancellation Fee</h3>
            <p className="text-xs text-amber-200/80 leading-relaxed max-w-sm">
              Get full refunds on train ticket cancellations. Upgrade for a worry-free booking experience in just one click.
            </p>
          </div>
          <Button className="bg-[#c05621] hover:bg-[#a64819] text-white px-5 font-bold text-xs h-9 z-10 shrink-0">
            Upgrade Now
          </Button>
        </div>

        {/* Partner Offers */}
        <Card className="md:col-span-4 border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-500">
              <Tag className="w-3.5 h-3.5" />
              Special Promo
            </span>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Exclusive Partner Offers</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Save up to ₹500 on first-time bookings using partner credit cards.
            </p>
          </div>
          <Button variant="link" className="p-0 h-auto text-xs font-bold text-[#c05621] hover:text-[#a64819] justify-start flex items-center gap-1">
            Check details <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
