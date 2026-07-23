"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { 
  Train, 
  BookOpen, 
  Star, 
  Settings, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Clipboard, 
  Volume2, 
  Search, 
  Activity, 
  Users,
  LayoutDashboard,
  Sun,
  Moon
} from "lucide-react";
import { applyTheme } from "@/lib/theme-utils";
import { t, getSavedLanguage, LanguageCode } from "@/lib/i18n";
import { PnrTracker } from "./pnr-tracker";
import { BookingHistory, type BookingRecord } from "./booking-history";
import { SavedFavorites } from "./saved-favorites";
import { StaffPortal, type ManifestPassenger } from "./staff-portal";
import { AdminPortal, type StaffMember } from "./admin-portal";
import { SettingsPortal } from "@/components/dashboard/settings-portal";
import { DashboardOverview } from "./dashboard-overview";
import { getBookings, bookTicket, getFavorites, getSearchHistory, addFavorite, removeFavorite } from "@/actions/passenger";
import { getStaffMembers, getPassengersList, addStaffMember, toggleStaffStatus } from "@/actions/admin";
import { updatePassengerBoarding } from "@/actions/staff";

interface DashboardClientProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
    } | null;
  } | null;
}

export function DashboardClient({ session }: DashboardClientProps) {
  const userRole = session?.user?.role || "passenger";
  
  // Set tab defaults dynamically
  const [activeTab, setActiveTab] = useState<string>(
    userRole === "staff" ? "manifest" : "overview"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPnr, setSelectedPnr] = useState<string | null>(null);

  // Core Lifted States (populated from SQLite backend)
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [passengers, setPassengers] = useState<ManifestPassenger[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [favorites, setFavorites] = useState<{ id: string; pnr: string; label: string }[]>([]);
  const [searches, setSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = session?.user?.name || "Demo User";
  const userEmail = session?.user?.email || "demo@railwaypnr.com";

  // Data Loading Trigger
  const loadPortalData = async () => {
    setLoading(true);
    try {
      if (userRole === "passenger") {
        const userBookings = await getBookings();
        setBookings(userBookings);
        const favs = await getFavorites();
        setFavorites(favs);
        const history = await getSearchHistory();
        setSearches(history);
      } else if (userRole === "admin") {
        const staffList = await getStaffMembers();
        setStaff(staffList);
        const pList = await getPassengersList();
        setPassengers(pList);
      } else if (userRole === "staff") {
        // Staff manifests are loaded per-station inside the StaffPortal,
        // but we can load all passengers as a fallback manifest list
        const pList = await getPassengersList();
        setPassengers(pList);
      }
    } catch (err) {
      console.error("Error loading portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPortalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => getSavedLanguage());

  useEffect(() => {
    const handleLangChange = (e: CustomEvent<LanguageCode>) => {
      setCurrentLang(e.detail);
    };
    window.addEventListener("languageChange", handleLangChange as EventListener);
    return () => {
      window.removeEventListener("languageChange", handleLangChange as EventListener);
    };
  }, []);

  // Navigation specs per role
  const getNavigationItems = () => {
    if (userRole === "staff") {
      return [
        { id: "manifest", name: t("staffPortal", currentLang), icon: Clipboard },
        { id: "ops", name: "Train Operations", icon: Volume2 },
        { id: "pnr", name: t("livePnrTracker", currentLang), icon: Search },
      ];
    }
    if (userRole === "admin") {
      return [
        { id: "overview", name: t("dashboardOverview", currentLang), icon: Activity },
        { id: "staff", name: "Manage Staff", icon: Users },
        { id: "passengers", name: "Manage Passengers", icon: User },
      ];
    }
    return [
      { id: "overview", name: t("dashboardOverview", currentLang), icon: LayoutDashboard },
      { id: "pnr", name: t("livePnrTracker", currentLang), icon: Train },
      { id: "history", name: t("bookingHistory", currentLang), icon: BookOpen },
      { id: "favorites", name: t("savedFavorites", currentLang), icon: Star },
    ];
  };

  const handleCheckStatus = (pnr: string) => {
    setSelectedPnr(pnr);
    setActiveTab("pnr");
  };

  // Passenger booking trigger
  const handleBookTicket = async (
    trainName: string,
    trainNo: string,
    fromCode: string,
    from: string,
    toCode: string,
    to: string,
    travelClass: string,
    passengerName: string
  ) => {
    const res = await bookTicket({
      trainName,
      trainNo,
      fromCode,
      from,
      toCode,
      to,
      travelClass,
      passengerName,
    });

    if (res.success) {
      // Refresh passenger booking history from database
      await loadPortalData();
      // Shift view to booking history
      setActiveTab("history");
    } else {
      alert(res.error || "Failed to book ticket");
    }
  };

  // Staff updates passenger manifest check-in status
  const handleUpdatePassengerStatus = async (id: string, newStatus: ManifestPassenger["status"]) => {
    const res = await updatePassengerBoarding(id, newStatus);
    if (res.success) {
      await loadPortalData();
    } else {
      alert("Failed to update boarding status.");
    }
  };

  // Admin updates
  const handleAddStaff = async (newStaff: Omit<StaffMember, "id" | "role" | "status">) => {
    const res = await addStaffMember(newStaff);
    if (res.success) {
      await loadPortalData();
    } else {
      alert(res.error || "Failed to add staff member.");
    }
  };

  const handleToggleStaffStatus = async (id: string) => {
    const res = await toggleStaffStatus(id);
    if (res.success) {
      await loadPortalData();
    } else {
      alert("Failed to update staff status.");
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen flex bg-[#fbf9f6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      {/* Mobile Header Bar */}
      <div className="lg:hidden w-full bg-[#faf8f5] dark:bg-slate-900 border-b border-[#f2eae1] dark:border-slate-850 absolute top-0 left-0 h-14 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#c05621] text-white">
            <Train className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-sm">ixigo</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#faf8f5] dark:bg-slate-900 border-r border-[#eaddcd] dark:border-slate-800 flex flex-col justify-between p-5 transform transition-transform duration-300 lg:translate-x-0 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="space-y-6">
          {/* Brand/Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 rounded-xl bg-[#c05621] text-white shadow-md shadow-[#c05621]/20">
              <Train className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ixigo</span>
          </div>

          {/* Profile Card */}
          <div 
            onClick={() => {
              setActiveTab("settings");
              setMobileMenuOpen(false);
            }}
            className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-[#f2eae1] dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-amber-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-slate-900 flex items-center justify-center text-[#c05621] border border-amber-200 dark:border-slate-800 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-850 dark:text-slate-100 block text-xs truncate">{userName}</span>
              <span className="text-[9px] text-slate-400 block truncate">{userEmail}</span>
              <span className="text-[8px] text-amber-700 dark:text-amber-500 font-bold block uppercase tracking-wider mt-0.5">
                {userRole === "admin" 
                  ? "System Administrator" 
                  : userRole === "staff" 
                  ? "Duty Officer" 
                  : "Premium Member"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#c05621] text-white shadow-sm shadow-[#c05621]/15"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-amber-50/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-1.5 border-t border-[#f2eae1] dark:border-slate-800 pt-4">
          <button
            onClick={() => {
              setActiveTab("settings");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "settings"
                ? "bg-[#c05621] text-white shadow-sm shadow-[#c05621]/15"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/50"
            }`}
          >
            <Settings className="w-4 h-4" />
            {t("settings", currentLang)}
          </button>
          <button
            onClick={async () => {
              await signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            {t("signOut", currentLang)}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 min-w-0 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 border-b border-[#eaddcd] dark:border-slate-800 bg-[#faf8f5]/60 dark:bg-slate-900/40 backdrop-blur-md px-6 hidden lg:flex items-center justify-between">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">
            {t("portalAccess", currentLang)}: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t("helpDesk", currentLang)}</span>
            <span>{t("liveAlerts", currentLang)}</span>
            <button
              onClick={() => {
                const isDark = document.documentElement.classList.contains("dark");
                applyTheme(isDark ? "light" : "dark");
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              title="Toggle Theme Mode"
            >
              <Sun className="w-3.5 h-3.5 hidden dark:block text-amber-400" />
              <Moon className="w-3.5 h-3.5 block dark:hidden text-slate-600" />
              <span className="text-[11px] font-bold">Theme</span>
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-6 lg:p-8 mt-14 lg:mt-0 max-w-5xl w-full mx-auto animate-in fade-in duration-200">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600/30 border-t-amber-600" />
                <span className="text-xs text-slate-400 font-medium">Connecting to central railway database...</span>
              </div>
            </div>
          ) : activeTab === "settings" ? (
            <SettingsPortal user={session?.user} />
          ) : (
            <>
          {userRole === "passenger" && (
            <>
              {activeTab === "overview" && (
                <DashboardOverview
                  userName={userName}
                  userRole={userRole}
                  bookings={bookings}
                  favorites={favorites}
                  searches={searches}
                  onNavigateTab={(tabId, pnr) => {
                    if (pnr) setSelectedPnr(pnr);
                    setActiveTab(tabId);
                  }}
                />
              )}
              {activeTab === "pnr" && (
                <PnrTracker
                  initialPnr={selectedPnr}
                  favorites={favorites}
                  onAddFavorite={async (pnr, label) => {
                    const res = await addFavorite(pnr, label || "Pinned Route");
                    if (res.success) {
                      await loadPortalData();
                    } else {
                      alert(res.error || "Failed to add favorite");
                    }
                  }}
                  onRemoveFavorite={async (id) => {
                    const res = await removeFavorite(id);
                    if (res.success) {
                      await loadPortalData();
                    } else {
                      alert(res.error || "Failed to remove favorite");
                    }
                  }}
                />
              )}
              {activeTab === "history" && <BookingHistory bookings={bookings} />}
              {activeTab === "favorites" && (
                <SavedFavorites 
                  favorites={favorites} 
                  bookings={bookings} 
                  onAddFavorite={async (pnr, label) => {
                    const res = await addFavorite(pnr, label);
                    if (res.success) {
                      await loadPortalData();
                    } else {
                      alert(res.error || "Failed to add favorite");
                    }
                  }}
                  onDeleteFavorite={async (id) => {
                    const res = await removeFavorite(id);
                    if (res.success) {
                      await loadPortalData();
                    } else {
                      alert(res.error || "Failed to delete favorite");
                    }
                  }}
                  onCheckStatus={handleCheckStatus} 
                  onBookTicket={handleBookTicket} 
                />
              )}
            </>
          )}

          {/* Staff Views */}
          {userRole === "staff" && (
            <>
              {(activeTab === "manifest" || activeTab === "ops") && (
                <StaffPortal 
                  passengers={passengers} 
                  onUpdatePassengerStatus={handleUpdatePassengerStatus} 
                  activeSubTab={activeTab as "manifest" | "ops"}
                  setActiveSubTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === "pnr" && (
                <PnrTracker
                  initialPnr={selectedPnr}
                  favorites={favorites}
                  onAddFavorite={async (pnr, label) => {
                    const res = await addFavorite(pnr, label || "Pinned Route");
                    if (res.success) {
                      await loadPortalData();
                    } else {
                      alert(res.error || "Failed to add favorite");
                    }
                  }}
                  onRemoveFavorite={async (id) => {
                    const res = await removeFavorite(id);
                    if (res.success) {
                      await loadPortalData();
                    } else {
                      alert(res.error || "Failed to remove favorite");
                    }
                  }}
                />
              )}
            </>
          )}

          {/* Admin Views */}
          {userRole === "admin" && (
            <AdminPortal
              staff={staff}
              passengers={passengers}
              onAddStaff={handleAddStaff}
              onToggleStaffStatus={handleToggleStaffStatus}
              activeSubTab={activeTab as "overview" | "staff" | "passengers"}
              onSubTabChange={setActiveTab}
            />
          )}
            </>
          )}
        </main>
      </div>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-30 lg:hidden"
        />
      )}
    </div>
  );
}
