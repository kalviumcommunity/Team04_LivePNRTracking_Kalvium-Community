import { LoginForm } from "@/components/auth/login-form";
import { Train } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#f9f5f0] dark:bg-slate-950 font-sans p-6">
      {/* Ambient warm glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center relative z-10 py-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#c05621] text-white shadow-md shadow-[#c05621]/20">
            <Train className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">ixigo</span>
        </div>
        <div className="flex gap-4 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
          <span>Support</span>
          <span>Careers</span>
        </div>
      </header>

      {/* Center Form */}
      <main className="w-full flex items-center justify-center py-12 relative z-10">
        <LoginForm />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto border-t border-slate-200 dark:border-slate-800/80 pt-6 pb-2 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 font-medium relative z-10">
        <div>
          &copy; {new Date().getFullYear()} ixigo / LiveRail Technologies Ltd. India
        </div>
        <div className="flex gap-6">
          <a href="#privacy" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</a>
          <a href="#terms" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</a>
          <a href="#cookies" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">Cookie Settings</a>
          <a href="#contact" className="hover:underline hover:text-slate-600 dark:hover:text-slate-300">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
