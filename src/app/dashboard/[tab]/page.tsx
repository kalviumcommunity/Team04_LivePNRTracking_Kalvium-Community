import { auth } from "@/auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function DashboardTabPage({ params }: PageProps) {
  const session = await auth();
  const resolvedParams = await params;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#fbf9f6] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600/30 border-t-amber-600" />
          <span className="text-xs text-slate-400 font-medium">Loading dashboard portal...</span>
        </div>
      </div>
    }>
      <DashboardClient session={session} initialTab={resolvedParams.tab} />
    </Suspense>
  );
}

