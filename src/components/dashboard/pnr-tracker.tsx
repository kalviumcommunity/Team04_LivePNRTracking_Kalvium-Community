"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Train,
  User,
  ChevronRight,
  AlertCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Share2,
  CheckCircle2,
  Sparkles,
  Star,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

export interface Passenger {
  name: string;
  bookingStatus: string;
  currentStatus: string;
}

export interface PnrDetails {
  pnr: string;
  trainName: string;
  trainNo: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime?: string;
  arrivalTime?: string;
  date: string;
  class: string;
  chartStatus?: string;
  platform?: string;
  delayStatus: string;
  lastUpdated?: string;
  passengers: Passenger[];
}

interface PnrTrackerProps {
  initialPnr?: string | null;
  favorites?: { id: string; pnr: string; label: string }[];
  onAddFavorite?: (pnr: string, label?: string) => Promise<void>;
  onRemoveFavorite?: (id: string) => Promise<void>;
}

export function PnrTracker({
  initialPnr,
  favorites = [],
  onAddFavorite,
  onRemoveFavorite,
}: PnrTrackerProps = {}) {
  const { t } = useTranslation();
  const [pnrInput, setPnrInput] = useState(initialPnr || "");
  const [activePnr, setActivePnr] = useState<PnrDetails | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [favLoading, setFavLoading] = useState(false);

  const existingFav = favorites.find((f) => f.pnr === activePnr?.pnr);
  const isFavorite = !!existingFav;

  const handleClearSearch = () => {
    setPnrInput("");
    setActivePnr(null);
    setError("");
  };

  const handleToggleFavorite = async () => {
    if (!activePnr?.pnr) return;
    setFavLoading(true);
    try {
      if (isFavorite && existingFav) {
        if (onRemoveFavorite) {
          await onRemoveFavorite(existingFav.id);
        }
      } else {
        if (onAddFavorite) {
          const encodedLabel = `${activePnr.trainName}|${activePnr.trainNo}|${activePnr.from}|${activePnr.fromCode}|${activePnr.to}|${activePnr.toCode}`;
          await onAddFavorite(
            activePnr.pnr,
            encodedLabel
          );
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setFavLoading(false);
    }
  };

  // Core API Fetch Function
  const fetchLivePnr = useCallback(async (pnrNumber: string, isAutoPoll = false) => {
    if (!pnrNumber) return;
    if (!isAutoPoll) setLoading(true);
    else setIsRefreshing(true);
    setError("");

    try {
      const res = await fetch(`/api/pnr/${pnrNumber}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Unable to fetch live PNR status.");
        setActivePnr(null);
      } else {
        setActivePnr(json.data);
        setLastRefreshedAt(new Date().toLocaleTimeString());
      }
    } catch {
      setError("Network error fetching PNR. Please check your connection.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial lookup handling
  useEffect(() => {
    if (initialPnr) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPnrInput(initialPnr);
      Promise.resolve().then(() => fetchLivePnr(initialPnr));
    }
  }, [initialPnr, fetchLivePnr]);

  // 30-Second Auto-Polling Effect
  useEffect(() => {
    if (!activePnr?.pnr) return;

    const intervalId = setInterval(() => {
      fetchLivePnr(activePnr.pnr, true);
    }, 30000); // 30 Seconds Auto Refresh

    return () => clearInterval(intervalId);
  }, [activePnr?.pnr, fetchLivePnr]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPnr = pnrInput.trim();

    if (!cleanedPnr) {
      setActivePnr(null);
      setError("Please enter a 10-digit PNR number.");
      return;
    }

    if (!/^\d{10}$/.test(cleanedPnr)) {
      setError("PNR must be exactly 10 numeric digits.");
      return;
    }

    fetchLivePnr(cleanedPnr);
  };

  const handleCopyPnr = () => {
    if (!activePnr?.pnr) return;
    navigator.clipboard.writeText(activePnr.pnr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSharePnr = () => {
    if (!activePnr) return;
    const shareText = `Train ${activePnr.trainName} (${activePnr.trainNo}) | PNR: ${activePnr.pnr} | Status: ${activePnr.delayStatus}`;
    if (navigator.share) {
      navigator.share({ title: "Live PNR Tracker", text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <Card className="border border-[#eaddcd] dark:border-slate-800 bg-[#faf8f5]/90 dark:bg-slate-900/60 backdrop-blur-md shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Train className="w-5 h-5 text-[#c05621]" />
            {t("livePnrTracker")}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            {t("realTimePnrDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                maxLength={10}
                placeholder={t("searchPnrPlaceholder")}
                value={pnrInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPnrInput(val);
                  if (!val) {
                    setActivePnr(null);
                    setError("");
                  }
                }}
                className="pl-10 pr-10 h-11 bg-white dark:bg-slate-950 border-[#e2d5c3] dark:border-slate-800 text-xs font-mono tracking-wider focus-visible:ring-amber-500/30 rounded-xl"
              />
              {pnrInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={t("clearSearch")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 bg-[#c05621] hover:bg-[#a8481b] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t("fetchingLive")}
                </>
              ) : (
                <>{t("getPnrStatus")}</>
              )}
            </Button>
          </form>

          {/* Inline Validation Error */}
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active PNR Result Display */}
      {activePnr && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Live Sync Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-amber-50/70 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold">{t("liveAutoPolling")}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{t("refreshesEvery30s")}</span>
            </div>
            <div className="flex items-center gap-3">
              {lastRefreshedAt && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" /> {t("updated")}: {lastRefreshedAt}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchLivePnr(activePnr.pnr, true)}
                disabled={isRefreshing}
                className="h-7 text-[11px] px-2 text-[#c05621] hover:bg-amber-100/60 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                {t("refreshNow")}
              </Button>
            </div>
          </div>

          {/* Main Journey Ticket Card */}
          <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md rounded-2xl overflow-hidden">
            <div className="bg-[#faf8f5] dark:bg-slate-900 border-b border-[#f2eae1] dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
                    PNR: {activePnr.pnr}
                  </span>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favLoading}
                    className={`p-1 rounded-md transition-all flex items-center gap-1 text-xs font-semibold ${
                      isFavorite
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                        : "text-slate-400 hover:text-amber-500 hover:bg-amber-50/60 dark:hover:bg-slate-800"
                    }`}
                    title={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFavorite ? "fill-amber-400 text-amber-500" : ""
                      } ${favLoading ? "animate-pulse" : ""}`}
                    />
                    <span className="text-[10px]">
                      {isFavorite ? t("savedToFavorites") : t("addFavoriteLabel")}
                    </span>
                  </button>
                  <button
                    onClick={handleCopyPnr}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-1"
                    title={t("copyPnr")}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleSharePnr}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title={t("sharePnr")}
                  >
                    {shared ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                  {activePnr.trainName} ({activePnr.trainNo})
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  {activePnr.chartStatus || "Chart Prepared"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    activePnr.delayStatus.includes("Delay")
                      ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {activePnr.delayStatus}
                </span>
                {activePnr.platform && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {activePnr.platform}
                  </span>
                )}
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Route & Schedule Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-[#faf8f5]/60 dark:bg-slate-900/40 p-4 rounded-xl border border-[#f2eae1] dark:border-slate-850">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">{t("boardingStation")}</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{activePnr.from}</div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-mono font-bold">
                    {activePnr.fromCode} • {activePnr.departureTime || "16:55"}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{activePnr.date}</div>
                  <div className="flex items-center gap-1 my-1 text-[#c05621]">
                    <div className="w-2 h-2 rounded-full bg-[#c05621]" />
                    <div className="w-16 h-0.5 bg-gradient-to-r from-[#c05621] to-amber-400" />
                    <ChevronRight className="w-4 h-4 -ml-2" />
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">{activePnr.class}</div>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs text-slate-400 uppercase font-semibold">{t("destinationStation")}</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{activePnr.to}</div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-mono font-bold">
                    {activePnr.toCode} • {activePnr.arrivalTime || "21:45"}
                  </div>
                </div>
              </div>

              {/* Passenger Status Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#c05621]" /> {t("passengerBreakdown")}
                </h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf8f5] dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">{t("passenger")}</th>
                        <th className="p-3">{t("bookingBerths")}</th>
                        <th className="p-3">{t("currentStatus")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {activePnr.passengers.map((p: Passenger, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">{p.bookingStatus}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                              <CheckCircle2 className="w-3 h-3" />
                              {p.currentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Feature Tip Footer */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> {t("autoSyncTip")}
                </span>
                <span className="font-mono text-[10px] text-slate-400">API Endpoint: /api/pnr/{activePnr.pnr}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Initial Empty State Prompt */}
      {!activePnr && !loading && !error && (
        <Card className="border border-dashed border-[#e2d5c3] dark:border-slate-800 bg-[#faf8f5]/50 dark:bg-slate-900/30 p-8 text-center rounded-2xl">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-[#c05621] flex items-center justify-center mb-3">
            <Train className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t("trackLivePnrStatus")}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {t("enterPnrPrompt")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              Sample PNR: 4109857123
            </span>
            <span className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              Sample PNR: 1234567890
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
