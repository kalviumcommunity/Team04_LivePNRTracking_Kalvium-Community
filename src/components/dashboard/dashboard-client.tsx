"use client";

import { useState } from "react";
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
  LayoutDashboard 
} from "lucide-react";
import { PnrTracker } from "./pnr-tracker";
import { BookingHistory, type BookingRecord } from "./booking-history";
import { SavedFavorites } from "./saved-favorites";
import { StaffPortal, type ManifestPassenger } from "./staff-portal";
import { AdminPortal, type StaffMember } from "./admin-portal";
import { SettingsPortal } from "./settings-portal";
import { DashboardOverview } from "./dashboard-overview";

interface DashboardClientProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
    } | null;
  } | null;
}

// Initial Booking Data
const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    pnr: "4109857123",
    date: "23 Dec 2026",
    trainName: "Rajdhani Express",
    trainNo: "12425",
    status: "CNF",
    statusText: "Confirmed",
    fare: "₹2,120",
  },
  {
    pnr: "1234567890",
    date: "24 Dec 2026",
    trainName: "Shatabdi Express",
    trainNo: "12004",
    status: "CNF",
    statusText: "Confirmed",
    fare: "₹515",
  },
  {
    pnr: "7103958261",
    date: "14 Sep 2026",
    trainName: "Garib Rath",
    trainNo: "12204",
    status: "CNF",
    statusText: "Confirmed",
    fare: "₹720",
  },
];

// Initial Manifest/Passenger Data
const INITIAL_PASSENGERS: ManifestPassenger[] = [
  { id: "p1", name: "Ramesh Rathore", pnr: "4109857123", from: "NDLS", to: "CNB", trainNo: "12425", status: "Boarding", seat: "A1/25" },
  { id: "p2", name: "Sunita Rathore", pnr: "4109857123", from: "NDLS", to: "CNB", trainNo: "12425", status: "Boarding", seat: "A1/26" },
  { id: "p3", name: "Suresh Kumar", pnr: "1234567890", from: "NDLS", to: "LJN", trainNo: "12004", status: "Checked In", seat: "C2/14" },
  { id: "p4", name: "Aman Gupta", pnr: "9876543210", from: "NDLS", to: "CNB", trainNo: "12425", status: "On-Board", seat: "B3/12" },
  { id: "p5", name: "Vikas Verma", pnr: "4567890123", from: "NDLS", to: "LJN", trainNo: "12004", status: "No Show", seat: "C1/5" },
];

// Initial Staff Data
const INITIAL_STAFF: StaffMember[] = [
  { id: "s1", name: "Sanjay Sharma", email: "staff@railwaypnr.com", role: "staff", status: "Active", station: "New Delhi (NDLS)" },
  { id: "s2", name: "Alok Singh", email: "alok@railwaypnr.com", role: "staff", status: "Active", station: "Kanpur (CNB)" },
  { id: "s3", name: "Priya Patel", email: "priya@railwaypnr.com", role: "staff", status: "Inactive", station: "Lucknow (LJN)" },
];

export function DashboardClient({ session }: DashboardClientProps) {
  const userRole = session?.user?.role || "passenger";
  
  // Set tab defaults dynamically
  const [activeTab, setActiveTab] = useState<string>(
    userRole === "staff" ? "manifest" : "overview"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPnr, setSelectedPnr] = useState<string | null>(null);

  // Core Lifted States
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [passengers, setPassengers] = useState<ManifestPassenger[]>(INITIAL_PASSENGERS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  const userName = session?.user?.name || "Demo User";
  const userEmail = session?.user?.email || "demo@railwaypnr.com";

  // Navigation specs per role
  const getNavigationItems = () => {
    if (userRole === "staff") {
      return [
        { id: "manifest", name: "Station Manifest", icon: Clipboard },
        { id: "ops", name: "Train Operations", icon: Volume2 },
        { id: "pnr", name: "PNR Lookup", icon: Search },
      ];
    }
    if (userRole === "admin") {
      return [
        { id: "overview", name: "System Overview", icon: Activity },
        { id: "staff", name: "Manage Staff", icon: Users },
        { id: "passengers", name: "Manage Passengers", icon: User },
      ];
    }
    return [
      { id: "overview", name: "Dashboard Overview", icon: LayoutDashboard },
      { id: "pnr", name: "Live PNR Tracker", icon: Train },
      { id: "history", name: "Booking History", icon: BookOpen },
      { id: "favorites", name: "Saved Favorites", icon: Star },
    ];
  };

  const handleCheckStatus = (pnr: string) => {
    setSelectedPnr(pnr);
    setActiveTab("pnr");
  };

  // Passenger booking trigger
  const handleBookTicket = (
    trainName: string,
    trainNo: string,
    fromCode: string,
    from: string,
    toCode: string,
    to: string,
    travelClass: string,
    passengerName: string
  ) => {
    // Generate random PNR
    const randomPnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const newBooking: BookingRecord = {
      pnr: randomPnr,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      trainName,
      trainNo,
      status: "CNF",
      statusText: "Confirmed",
      fare: travelClass.includes("AC") ? "₹1,850" : "₹620",
    };

    // Add booking record
    setBookings([newBooking, ...bookings]);

    // Add passenger manifest entry
    const newManifest: ManifestPassenger = {
      id: `p-${randomPnr}`,
      name: passengerName,
      pnr: randomPnr,
      from: fromCode,
      to: toCode,
      trainNo,
      status: "Boarding",
      seat: "A2/40",
    };
    setPassengers([newManifest, ...passengers]);

    // Shift view to booking history
    setActiveTab("history");
  };

  // Staff updates
  const handleUpdatePassengerStatus = (id: string, newStatus: ManifestPassenger["status"]) => {
    setPassengers(
      passengers.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  // Admin updates
  const handleAddStaff = (newStaff: Omit<StaffMember, "id" | "role" | "status">) => {
    const freshStaff: StaffMember = {
      id: `s-${Math.random().toString(36).substring(2, 9)}`,
      role: "staff",
      status: "Active",
      ...newStaff,
    };
    setStaff([...staff, freshStaff]);
  };

  const handleToggleStaffStatus = (id: string) => {
    setStaff(
      staff.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s))
    );
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
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-[#f2eae1] dark:border-slate-800 flex items-center gap-3">
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
          <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100/50">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={async () => {
              await signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 min-w-0 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 border-b border-[#eaddcd] dark:border-slate-800 bg-[#faf8f5]/60 dark:bg-slate-900/40 backdrop-blur-md px-6 hidden lg:flex items-center justify-between">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">
            Portal access: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Help Desk</span>
            <span>Live Alerts</span>
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-6 lg:p-8 mt-14 lg:mt-0 max-w-5xl w-full mx-auto animate-in fade-in duration-200">
          {/* Settings View */}
          {activeTab === "settings" ? (
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
                  onNavigateTab={(tabId, pnr) => {
                    if (pnr) setSelectedPnr(pnr);
                    setActiveTab(tabId);
                  }}
                />
              )}
              {activeTab === "pnr" && <PnrTracker initialPnr={selectedPnr} />}
              {activeTab === "history" && <BookingHistory bookings={bookings} />}
              {activeTab === "favorites" && (
                <SavedFavorites onCheckStatus={handleCheckStatus} onBookTicket={handleBookTicket} />
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
              {activeTab === "pnr" && <PnrTracker initialPnr={selectedPnr} />}
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
