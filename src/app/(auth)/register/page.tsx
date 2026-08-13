/**
 * @file page.tsx
 * @description User registration route component.
 * Displays the RegisterForm component surrounded by a consistent theme layout.
 */

import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { Home } from "lucide-react";

export const metadata = {
  title: "Create Account - ixigo PNR Tracker",
  description: "Sign up for ixigo PNR Tracker. Track trains, book tickets, and manage your journeys.",
};

/**
 * RegisterPage Component. Renders registration container layout.
 */
export default function RegisterPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-[#f9f5f0] dark:bg-slate-950 relative overflow-hidden px-4 py-12"
    >
      {/* Decorative ambient glows */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-1/3 w-[300px] h-[250px] rounded-full bg-orange-300/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center mb-8 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#c05621] text-white shadow-lg shadow-[#c05621]/25">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">ixigo</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wider uppercase">
          Railway PNR Tracking System
        </p>
      </div>

      {/* Home Button near the form */}
      <div className="relative z-10 w-full max-w-md mb-4 flex justify-start">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-sm"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Home</span>
        </Link>
      </div>

      {/* Register Form */}
      <div className="relative z-10 w-full flex justify-center">
        <RegisterForm />
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-8 flex items-center gap-6 text-[10px] text-slate-400 font-medium">
        <span>Help & Support</span>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span>Privacy Policy</span>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span>Terms of Service</span>
      </div>
    </main>
  );
}
