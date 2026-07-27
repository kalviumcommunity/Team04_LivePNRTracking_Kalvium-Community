import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  const userRole = user?.role || "passenger";
  const defaultTab = userRole === "staff" ? "manifest" : "overview";
  redirect(`/dashboard/${defaultTab}`);
}
