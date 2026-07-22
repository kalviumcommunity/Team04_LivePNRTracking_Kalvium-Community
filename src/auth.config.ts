import type { NextAuthConfig } from "next-auth";

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
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard"); // Determine if requesting a dashboard route

      if (isOnDashboard) {
        if (isLoggedIn) return true; // Allow access if logged in
        return false; // Automatically redirect unauthenticated users to the signIn page (/login)
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        // If user is already logged in and tries to access the login page, redirect them to dashboard
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true; // Allow access to other pages (e.g. landing page, public routes)
    },
  },
};

