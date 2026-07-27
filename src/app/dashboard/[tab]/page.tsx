import { auth } from "@/auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function DashboardTabPage({ params }: PageProps) {
  const session = await auth();
  const resolvedParams = await params;

  return <DashboardClient session={session} initialTab={resolvedParams.tab} />;
}
