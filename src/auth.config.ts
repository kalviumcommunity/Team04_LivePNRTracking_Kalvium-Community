import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Edge-compatible authentication configuration for NextAuth.
 * This object contains configuration that does not depend on Node.js APIs,
 * allowing it to run within Vercel Edge Middleware/Functions.
 * Node.js-only modules like bcrypt and pg should NOT be imported here.
 */
export const authConfig: NextAuthConfig = {
  // Define custom authentication pages
  pages: {
    signIn: "/login", // Route to redirect unauthenticated users to when trying to access protected pages
  },
  // Configure session parameters
  session: {
    strategy: "jwt", // Use JSON Web Tokens (JWT) for session management instead of database sessions
  },
  // Providers list is empty here; provider initialization is done in auth.ts which runs in standard Node runtime
  providers: [],
  // Custom callbacks to intercept and manage request routing/authorization
  callbacks: {
    /**
     * The authorized callback verifies if a user is allowed to access a page.
     * It runs before middleware routes request to destination.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user; // Check if user has an active session
      const pathname = nextUrl.pathname;
      const isOnDashboard = pathname.startsWith("/dashboard"); // Determine if requesting a dashboard route

      if (!isOnDashboard) {
        return true; // Allow access to all public pages (landing, login, register, etc.)
      }

      // User must be logged in to access any dashboard route
      if (!isLoggedIn) {
        return false; // Redirect unauthenticated users to /login
      }

      // Extract role from the JWT token (populated in auth.ts jwt callback)
      const role = (auth as { user?: { role?: string } })?.user?.role ?? "passenger";

      // ── Admin-only tab routes ──
      // Only admins can access /dashboard/overview, /dashboard/staff, /dashboard/passengers, /dashboard/auditlogs
      const adminOnlyTabs = ["/dashboard/overview", "/dashboard/staff", "/dashboard/passengers", "/dashboard/auditlogs"];
      const isAdminTab = adminOnlyTabs.some((tab) => pathname.startsWith(tab));

      if (isAdminTab && role !== "admin") {
        // Redirect non-admins away from admin tabs to their own default
        const defaultTab =
          role === "staff"
            ? "/dashboard/manifest"
            : "/dashboard/pnr";
        return Response.redirect(new URL(defaultTab, nextUrl));
      }

      // ── Staff-only tab routes ──
      // Only staff (or admin) can access staff-specific tabs
      const staffOnlyTabs = [
        "/dashboard/manifest",
        "/dashboard/trainPassengers",
        "/dashboard/ops",
        "/dashboard/catering",
        "/dashboard/attendance",
        "/dashboard/luggage",
      ];
      const isStaffTab = staffOnlyTabs.some((tab) => pathname.startsWith(tab));

      if (isStaffTab && role !== "staff" && role !== "admin") {
        // Redirect passengers away from staff tabs
        return Response.redirect(new URL("/dashboard/pnr", nextUrl));
      }

      return true; // Allow access if all checks pass
    },
  },
};
