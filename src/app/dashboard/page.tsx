import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Train, LogOut } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-6 sm:p-12 relative overflow-hidden">
      {/* Decorative ambient background glowing shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Train className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Smart PNR Tracker</span>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="outline" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </form>
        </header>

        {/* Content */}
        <main className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-800/80">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome, {session?.user?.name || "User"}!
            </h2>
            <p className="text-slate-505 dark:text-slate-400 mt-2">
              You have successfully authenticated via Auth.js v5. This dashboard validates that protected routes and redirects are working properly.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm">
              <span className="font-semibold block text-slate-700 dark:text-slate-300">Active Session Info</span>
              <pre className="mt-2 text-xs font-mono text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
