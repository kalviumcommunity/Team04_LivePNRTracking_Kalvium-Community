"use client";

import {
  Train,
  Ticket,
  Star,
  Clock,
  Search,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPnrMetadata } from "@/lib/pnr-utils";
import { useTranslation } from "@/lib/i18n";

interface BookingRecord {
  pnr: string;
  date: string;
  trainName: string;
  trainNo: string;
  status: string;
  statusText: string;
  fare: string;
  fromStation?: string;
  toStation?: string;
  seat?: string;
}

interface DashboardOverviewProps {
  userName: string;
  userRole: string;
  bookings: BookingRecord[];
  onNavigateTab: (tabId: string, pnr?: string) => void;
  favorites: { id: string; pnr: string; label: string }[];
  searches: string[];
}

export function DashboardOverview({
  userName,
  userRole,
  bookings,
  onNavigateTab,
  favorites,
  searches,
}: DashboardOverviewProps) {
  const { t } = useTranslation();
  // Map SQLite searches to UI layout
  const recentSearches = searches.map((pnr) => {
    const booking = bookings.find((b) => b.pnr === pnr);
    const meta = getPnrMetadata(pnr, null, booking);
    return {
      pnr,
      train: `${meta.trainName} (${meta.trainNo})`,
      route: `${meta.fromCode} → ${meta.toCode}`,
      status: booking ? booking.status : "CNF",
      time: "Query logged",
    };
  });

  // Map SQLite favorites to UI layout
  const favoritePnrs = favorites.map((fav) => {
    const booking = bookings.find((b) => b.pnr === fav.pnr);
    const meta = getPnrMetadata(fav.pnr, fav.label, booking);
    return {
      pnr: fav.pnr,
      name: meta.trainName,
      train: `${meta.trainName} (${meta.trainNo})`,
      date: booking ? booking.date : `${meta.fromCode} → ${meta.toCode}`,
      seat: booking ? `${booking.seat} (${booking.status})` : "Monitored PNR",
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#c05621] via-amber-700 to-amber-800 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute right-[-5%] top-[-20%] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} {t("portalActiveLabel")}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("welcomeBack")}, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            Your live PNR tracker is actively monitoring <span className="font-bold underline">Rajdhani Express (12425)</span>. Current Status: <span className="bg-emerald-500/30 px-2 py-0.5 rounded text-white font-bold">On Time</span>.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => onNavigateTab("pnr")}
              className="bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold h-9 px-4 rounded-xl shadow-md transition-all"
            >
              {t("trackLivePnr")} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
            <button
              onClick={() => onNavigateTab("favorites")}
              className="border border-white/30 text-white hover:bg-white/10 active:scale-[0.98] text-xs font-semibold h-9 px-4 rounded-xl transition-all"
            >
              {t("viewSavedFavorites")}
            </button>
          </div>
        </div>
        <div className="relative z-10 hidden md:block shrink-0">
          <img 
            src="/train_dashboard.png" 
            alt="Vintage Train Station" 
            className="w-96 h-56 object-contain opacity-95 hover:opacity-100 hover:scale-105 transition-all duration-300 drop-shadow-2xl mix-blend-screen"
          />
        </div>
      </div>

      {/* 2. Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t("activeBookings")}</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-slate-900 text-[#c05621]">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{bookings.length}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {t("allConfirmedActive")}
          </div>
        </Card>

        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t("confirmedSeats")}</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">100%</div>
          <div className="text-[10px] text-slate-400 mt-1">{t("zeroWaitlistRisk")}</div>
        </Card>

        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t("favoriteTrips")}</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-slate-900 text-amber-600">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{favoritePnrs.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">{t("quickOneClickBooking")}</div>
        </Card>

        <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t("totalJourneys")}</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600">
              <Train className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">12</div>
          <div className="text-[10px] text-slate-400 mt-1">{t("loggedTravelHistory")}</div>
        </Card>
      </div>

      {/* 3. Recent Searches & Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Searches */}
        <Card className="lg:col-span-6 border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c05621]" /> {t("recentSearches")}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">{t("quickRecheck")}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {recentSearches.map((item) => (
              <div
                key={item.pnr}
                onClick={() => onNavigateTab("pnr", item.pnr)}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-amber-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                    {item.pnr}
                    <span className="text-[9px] font-sans bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.train} • {item.route}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{t("queryLogged")}</span>
                  <span className="text-[11px] font-bold text-[#c05621] hover:underline">{t("track")} →</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Favorite PNRs Widget */}
        <Card className="lg:col-span-6 border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#c05621]" /> {t("pinnedFavorites")}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">{t("savedTripsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {favoritePnrs.map((fav) => (
              <div
                key={fav.pnr}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-[#faf8f5] dark:bg-slate-900 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{fav.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{fav.train} • {fav.date}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{t("seatLabel")}: {fav.seat}</div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onNavigateTab("pnr", fav.pnr)}
                  className="h-8 text-xs bg-[#c05621] hover:bg-[#a8481b] text-white rounded-lg"
                >
                  {t("viewStatus")}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 4. Quick Actions & Latest Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-6 border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">{t("quickPortalActions")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => onNavigateTab("pnr")}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 bg-slate-50 dark:bg-slate-900 text-left font-bold text-slate-900 dark:text-white hover:bg-amber-50/50 flex flex-col gap-1.5 transition-all"
            >
              <Search className="w-4 h-4 text-[#c05621]" />
              <span>{t("searchPnrStatus")}</span>
            </button>
            <button
              onClick={() => onNavigateTab("history")}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 bg-slate-50 dark:bg-slate-900 text-left font-bold text-slate-900 dark:text-white hover:bg-amber-50/50 flex flex-col gap-1.5 transition-all"
            >
              <Calendar className="w-4 h-4 text-[#c05621]" />
              <span>{t("bookingHistory")}</span>
            </button>
            <button
              onClick={() => onNavigateTab("favorites")}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 bg-slate-50 dark:bg-slate-900 text-left font-bold text-slate-900 dark:text-white hover:bg-amber-50/50 flex flex-col gap-1.5 transition-all"
            >
              <Star className="w-4 h-4 text-[#c05621]" />
              <span>{t("savedFavorites")}</span>
            </button>
            <button
              onClick={() => onNavigateTab("settings")}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 bg-slate-50 dark:bg-slate-900 text-left font-bold text-slate-900 dark:text-white hover:bg-amber-50/50 flex flex-col gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#c05621]" />
              <span>{t("accountSettings")}</span>
            </button>
          </CardContent>
        </Card>

        {/* Latest Railway Bulletins */}
        <Card className="lg:col-span-6 border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-900">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> {t("latestBulletins")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block">{t("winterScheduleTitle") || "Winter Schedule Active"}</span>
              <span className="text-[11px] text-slate-500">{t("winterScheduleDesc") || "Rajdhani Express (12425) arriving on Platform 16 at NDLS."}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block">{t("securityUpgradeTitle") || "2FA Security Upgrade Live"}</span>
              <span className="text-[11px] text-slate-500">{t("securityUpgradeDesc") || "Configure multi-factor authentication in Settings."}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
