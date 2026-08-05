"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Moon,
  Ticket,
  Coffee,
  Calendar,
  Package,
  Bell,
  HelpCircle,
  MessageSquare,
  Send,
  PhoneCall
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
import { TicketBooking } from "./ticket-booking";
import { getBookings, bookTicket, getFavorites, getSearchHistory, addFavorite, removeFavorite, getNotifications, markNotificationsAsRead } from "@/actions/passenger";
import { getStaffMembers, getPassengersList, addStaffMember, toggleStaffStatus } from "@/actions/admin";
import { updatePassengerBoarding, getManifest } from "@/actions/staff";

interface DashboardClientProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
      subRole?: string | null;
    } | null;
  } | null;
  initialTab?: string;
}

export function DashboardClient({ session, initialTab }: DashboardClientProps) {
  const router = useRouter();
  const userRole = session?.user?.role || "passenger";
  const userSubRole = session?.user?.subRole || null;
  
  // Validate initialTab against userRole to prevent blank screens on unauthorized tab URLs
  const staffTabs = ["manifest", "trainPassengers", "ops", "catering", "attendance", "luggage"];
  const adminTabs = ["overview", "staff", "passengers"];

  const getValidTab = (requestedTab?: string) => {
    if (userRole === "passenger") {
      if (!requestedTab || staffTabs.includes(requestedTab) || adminTabs.includes(requestedTab)) {
        return "overview";
      }
      return requestedTab;
    }
    if (userRole === "admin") {
      if (!requestedTab || !adminTabs.includes(requestedTab)) {
        return "overview";
      }
      return requestedTab;
    }
    if (userRole === "staff") {
      let allowedTabs = ["attendance", "pnr"];
      let defaultTab = "manifest";
      if (!userSubRole || userSubRole === "ttr") {
        allowedTabs = ["manifest", "trainPassengers", "ops", "attendance"];
        defaultTab = "manifest";
      } else if (userSubRole === "pantry") {
        allowedTabs = ["catering", "attendance"];
        defaultTab = "catering";
      } else if (userSubRole === "maintenance") {
        allowedTabs = ["ops", "attendance", "luggage", "pnr"];
        defaultTab = "ops";
      }
      
      if (!requestedTab || !allowedTabs.includes(requestedTab)) {
        return defaultTab;
      }
      return requestedTab;
    }
    return requestedTab || "overview";
  };

  // Set tab defaults dynamically
  const [activeTab, setRawActiveTab] = useState<string>(
    getValidTab(initialTab)
  );

  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setRawActiveTab(getValidTab(initialTab));
  }

  const searchParams = useSearchParams();
  const urlPnr = searchParams.get("pnr");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPnr, setSelectedPnr] = useState<string | null>(urlPnr);

  useEffect(() => {
    if (urlPnr) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedPnr(urlPnr);
    }
  }, [urlPnr]);

  const setActiveTab = (tabId: string) => {
    if (!tabId.startsWith("pnr")) {
      setSelectedPnr(null);
    }
    const cleanTab = tabId.split("?")[0];
    setRawActiveTab(cleanTab);
    window.history.pushState(null, "", `/dashboard/${tabId}`);
  };

  // Core Lifted States (populated from SQLite backend)
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [passengers, setPassengers] = useState<ManifestPassenger[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [favorites, setFavorites] = useState<{ id: string; pnr: string; label: string }[]>([]);
  const [searches, setSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState("NDLS");

  // Notifications and Help Desk States
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; read: boolean; createdAt: string }[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "agent", text: "Hello! Welcome to 24/7 Live Railway Support. How can I assist you with your booking or query today?" }
  ]);
  const [showCallToast, setShowCallToast] = useState(false);

  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== "undefined" && session?.user?.email) {
      const savedName = localStorage.getItem(`profile_name_${session.user.email}`);
      if (savedName) return savedName;
    }
    return session?.user?.name || "Demo User";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== "undefined" && session?.user?.email) {
      const savedEmail = localStorage.getItem(`profile_email_${session.user.email}`);
      if (savedEmail) return savedEmail;
    }
    return session?.user?.email || "demo@railwaypnr.com";
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: "user", text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput("");

    // Simulate automated agent response
    setTimeout(() => {
      let reply = "I'm checking the live railway feed for you. Could you please specify your PNR or query details?";
      const lower = currentInput.toLowerCase();
      if (lower.includes("pnr") || lower.includes("status")) {
        reply = "Sure! You can check your PNR status instantly by navigating to the Live PNR Tracker tab in the sidebar and entering your PNR number.";
      } else if (lower.includes("book") || lower.includes("ticket")) {
        reply = "To book a ticket, click on 'Book Ticket Now' in the sidebar, fill in the journey details, and hit Book.";
      } else if (lower.includes("delay") || lower.includes("late")) {
        reply = "Currently, train delay updates are managed live by the duty officer. Check the PNR status to see if your train has been updated.";
      }
      setChatMessages((prev) => [...prev, { sender: "agent", text: reply }]);
    }, 1000);
  };

  const handleCallTollFree = () => {
    setShowCallToast(true);
    setTimeout(() => setShowCallToast(false), 5000);
  };

  // Data Loading Trigger
  const loadPortalData = async (stationToFetch = selectedStation) => {
    const hasData = bookings.length > 0 || passengers.length > 0 || staff.length > 0 || favorites.length > 0;
    if (!hasData) {
      setLoading(true);
    }
    try {
      if (userRole === "passenger") {
        const userBookings = await getBookings();
        setBookings(userBookings);
        const favs = await getFavorites();
        setFavorites(favs);
        const history = await getSearchHistory();
        setSearches(history);
        const userNotifs = await getNotifications();
        setNotifications(userNotifs);
      } else if (userRole === "admin") {
        const staffList = await getStaffMembers();
        setStaff(staffList);
        const pList = await getPassengersList();
        setPassengers(pList);
      } else if (userRole === "staff") {
        const manifestPassengers = await getManifest(stationToFetch);
        setPassengers(manifestPassengers);
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
  }, [userRole, selectedStation]);

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
      const items = [];
      if (!userSubRole || userSubRole === "ttr") {
        items.push(
          { id: "manifest", name: t("staffPortal", currentLang), icon: Clipboard },
          { id: "trainPassengers", name: t("trainPassengers", currentLang), icon: Train },
          { id: "ops", name: "Train Operations", icon: Volume2 }
        );
      } else if (userSubRole === "pantry") {
        items.push(
          { id: "catering", name: "Catering Service", icon: Coffee }
        );
      } else if (userSubRole === "maintenance") {
        items.push(
          { id: "ops", name: "Train Operations", icon: Volume2 },
          { id: "luggage", name: "Luggage Tracking", icon: Package }
        );
      }
      // Common staff items
      items.push({ id: "attendance", name: "Duty Roster", icon: Calendar });
      if (userSubRole !== "pantry" && userSubRole !== "ttr" && userSubRole) {
        items.push({ id: "pnr", name: t("livePnrTracker", currentLang), icon: Search });
      }
      return items;
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
      { id: "book", name: t("bookTicketNow", currentLang) || "Book Ticket", icon: Ticket },
      { id: "pnr", name: t("livePnrTracker", currentLang), icon: Train },
      { id: "history", name: t("bookingHistory", currentLang), icon: BookOpen },
      { id: "favorites", name: t("savedFavorites", currentLang), icon: Star },
    ];
  };

  const handleCheckStatus = (pnr: string) => {
    setSelectedPnr(pnr);
    setActiveTab(`pnr?pnr=${pnr}`);
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
      alert(res.error || "Failed to update boarding status.");
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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsHelpDeskOpen(true)}
            className="p-1.5 text-slate-500 hover:text-[#c05621] dark:text-slate-400 dark:hover:text-amber-500 transition-colors"
            title="Help Desk"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={async () => {
              setIsNotificationsOpen(true);
              if (notifications.some((n) => !n.read)) {
                await markNotificationsAsRead();
                const updated = await getNotifications();
                setNotifications(updated);
              }
            }}
            className="p-1.5 text-slate-500 hover:text-[#c05621] dark:text-slate-400 dark:hover:text-amber-500 transition-colors relative"
            title="Live Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
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
          {session?.user ? (
            <button
              onClick={async () => {
                await signOut({ callbackUrl: "/login", redirect: true });
                router.push("/login");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              {t("signOut", currentLang)}
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
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
            <button 
              onClick={() => setIsHelpDeskOpen(true)}
              className="hover:text-[#c05621] dark:hover:text-amber-500 transition-colors flex items-center gap-1 font-bold"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#c05621] dark:text-amber-500" />
              <span>{t("helpDesk", currentLang)}</span>
            </button>
            <button 
              onClick={async () => {
                setIsNotificationsOpen(true);
                if (notifications.some((n) => !n.read)) {
                  await markNotificationsAsRead();
                  const updated = await getNotifications();
                  setNotifications(updated);
                }
              }}
              className="hover:text-[#c05621] dark:hover:text-amber-500 transition-colors flex items-center gap-1 font-bold relative"
            >
              <Bell className="w-3.5 h-3.5 text-[#c05621] dark:text-amber-500" />
              <span>{t("liveAlerts", currentLang)}</span>
              {notifications.some((n) => !n.read) && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.5 text-[8px] font-bold text-white bg-red-600 rounded-full animate-pulse">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
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
            {session?.user ? (
              <button
                onClick={async () => {
                  await signOut({ callbackUrl: "/login", redirect: true });
                  router.push("/login");
                }}
                className="px-3 py-1 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 font-semibold transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t("signOut", currentLang)}</span>
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-3.5 py-1.5 rounded-lg bg-[#c05621] hover:bg-[#a8481b] text-white font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-6 lg:p-8 mt-14 lg:mt-0 max-w-5xl w-full mx-auto animate-in fade-in duration-200">
          {loading ? (
            <div className="flex items-center justify-center min-h-75">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600/30 border-t-amber-600" />
                <span className="text-xs text-slate-400 font-medium">Connecting to central railway database...</span>
              </div>
            </div>
          ) : activeTab === "settings" ? (
            <SettingsPortal 
              user={{ ...session?.user, name: userName, email: userEmail }} 
              onProfileUpdate={(name, email) => {
                setUserName(name);
                setUserEmail(email);
              }}
            />
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
                    if (pnr) {
                      setSelectedPnr(pnr);
                      setActiveTab(`${tabId}?pnr=${pnr}`);
                    } else {
                      setActiveTab(tabId);
                    }
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
              {activeTab === "book" && (
                <TicketBooking 
                  onBookSuccess={async () => {
                    await loadPortalData();
                  }}
                  bookTicketAction={bookTicket}
                />
              )}
              {activeTab === "history" && (
                <BookingHistory 
                  bookings={bookings} 
                  onCheckStatus={handleCheckStatus} 
                />
              )}
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
              {(activeTab === "manifest" || activeTab === "trainPassengers" || activeTab === "ops" || activeTab === "catering" || activeTab === "attendance" || activeTab === "luggage") && (
                <StaffPortal 
                  passengers={passengers} 
                  onUpdatePassengerStatus={handleUpdatePassengerStatus} 
                  activeSubTab={activeTab}
                  setActiveSubTab={(tab) => setActiveTab(tab)}
                  selectedStation={selectedStation}
                  setSelectedStation={setSelectedStation}
                  onRefreshData={loadPortalData}
                  userSubRole={userSubRole}
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

      {/* Help Desk / Support Modal */}
      {isHelpDeskOpen && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-132 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#FAF7F2] dark:bg-slate-950 p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c05621] text-white flex items-center justify-center font-bold text-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">24/7 Travel Support Desk</h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Assistant Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpDeskOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/30 dark:bg-slate-950/20">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#c05621] text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-750 rounded-bl-none shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Action shortcuts */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                onClick={() => {
                  setChatInput("Check PNR Status");
                  setTimeout(() => {
                    const btn = document.getElementById("send-chat-btn");
                    btn?.click();
                  }, 50);
                }}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-800 hover:border-amber-400 rounded-full bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 transition-colors"
              >
                🔍 Check PNR
              </button>
              <button
                onClick={() => {
                  setChatInput("How to cancel my booking?");
                  setTimeout(() => {
                    const btn = document.getElementById("send-chat-btn");
                    btn?.click();
                  }, 50);
                }}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-800 hover:border-amber-400 rounded-full bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 transition-colors"
              >
                ❌ Cancellation
              </button>
              <button
                onClick={handleCallTollFree}
                className="px-2.5 py-1 text-[10px] font-bold border border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-full text-[#c05621] dark:text-amber-500 transition-colors flex items-center gap-1"
              >
                📞 Call Toll-Free
              </button>
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask about seat confirmation, delays, cancellation..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 h-10 text-xs px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#c05621] text-slate-900 dark:text-white"
              />
              <button id="send-chat-btn" type="submit" className="h-10 w-10 shrink-0 bg-[#c05621] hover:bg-[#a8481b] text-white rounded-xl flex items-center justify-center transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Live Alerts / Notifications Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-112 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#FAF7F2] dark:bg-slate-950 p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-500 flex items-center justify-center">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Broadcast & Alerts</h3>
                  <p className="text-[10px] text-slate-500">Real-time schedule changes & announcements</p>
                </div>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/30 dark:bg-slate-950/20">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      notif.read
                        ? "bg-slate-50/60 dark:bg-slate-900/30 border-slate-105 dark:border-slate-850 opacity-80"
                        : "bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-xs text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                        {!notif.read && <span className="w-1.5 h-1.5 bg-[#c05621] rounded-full shrink-0" />}
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-slate-350" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-650 dark:text-slate-300">All Clear!</h4>
                  <p className="text-[11px] max-w-50">No active route delay bulletins or security alerts found.</p>
                </div>
              )}
            </div>

            {/* Notifications Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="px-4 py-1.5 bg-[#c05621] hover:bg-[#a8481b] text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toll-Free Call Toast Banner */}
      {showCallToast && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#c05621] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <PhoneCall className="w-5 h-5 text-amber-200 animate-pulse" />
          <div>
            <p className="text-xs font-bold font-sans">Dialing Railway Toll-Free Helpline...</p>
            <p className="text-[11px] text-amber-100 font-mono">1800-111-139 / 139</p>
          </div>
          <button onClick={() => setShowCallToast(false)} className="ml-2 hover:bg-white/20 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
