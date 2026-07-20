import { LoginForm } from "@/components/auth/login-form";
import { Train } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center lg:grid lg:grid-cols-12 overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Decorative ambient background glowing shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] pointer-events-none" />

      {/* Left panel - Decorative Railway Tracking Visuals (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative h-full flex-col justify-between p-12 bg-slate-900 text-white overflow-hidden">
        {/* Abstract background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent)]" />
        
        {/* Glow circles inside left panel */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-violet-600/25 blur-[90px] pointer-events-none" />

        {/* Brand / Logo */}
        <div className="relative z-10 flex items-center gap-2 text-xl tracking-tight">
          <div className="p-2 rounded-xl bg-indigo-600/80 backdrop-blur border border-indigo-400/30 shadow-lg shadow-indigo-600/20">
            <Train className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wide">Ixigo Live PNR Tracker</span>
        </div>

        {/* Content Showcase */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Real-Time PNR & Train Status Tracking
          </h1>
          <p className="text-lg text-slate-300 font-light leading-relaxed">
            Monitor booking details, route changes, delay updates, and coordinate travel plans in one sleek dashboard.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div>
              <span className="block text-2xl font-bold text-indigo-400">99.8%</span>
              <span className="text-sm text-slate-400">Status Update Accuracy</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-violet-400">&lt; 30s</span>
              <span className="text-sm text-slate-400">Live Polling Intervals</span>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} LiveRail. Crafted for modern travel coordination.
        </div>
      </div>

      {/* Right panel - Glassmorphic login form */}
      <div className="lg:col-span-6 xl:col-span-5 w-full flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8 text-xl text-slate-900 dark:text-white">
          <div className="p-2 rounded-xl bg-indigo-600 border border-indigo-500/30 shadow-lg shadow-indigo-600/20">
            <Train className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wide">Ixigo Live PNR Tracker</span>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
