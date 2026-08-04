import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as { role?: string; subRole?: string | null } | undefined;
  const userRole = user?.role || "passenger";
  const userSubRole = user?.subRole;

  let defaultTab = "overview";
  if (userRole === "staff") {
    if (userSubRole === "pantry") {
      defaultTab = "catering";
    } else if (userSubRole === "maintenance") {
      defaultTab = "ops";
    } else {
      defaultTab = "manifest";
    }
  } else if (userRole === "admin") {
    defaultTab = "overview";
  }

  redirect(`/dashboard/${defaultTab}`);
}
