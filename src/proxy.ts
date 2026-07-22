import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Initialize NextAuth with only edge-compatible configuration to run in middleware.
// This allows authentication verification on request routing before reaching page renders.
const { auth } = NextAuth(authConfig);

// Export the auth function as 'proxy' to match middleware middleware requirements/imports.
export const proxy = auth;

// Config defines which paths are intercepted by this middleware.
export const config = {
  // Matches all request paths except for internal API routes, static assets, images, and favicon.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

