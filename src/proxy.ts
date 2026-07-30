import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Initialize NextAuth with only edge-compatible configuration to run in middleware.
// This allows authentication verification on request routing before reaching page renders.
const { auth } = NextAuth(authConfig);

// Export the auth function as 'proxy' — Next.js 16 uses this as the middleware entrypoint.
export const proxy = auth;

// Config defines which paths are intercepted by this middleware.
// Next.js 16+ uses proxy.ts (not middleware.ts) as the middleware file convention.
export const config = {
  // Match all paths except Next.js internals, static assets, and favicon.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

