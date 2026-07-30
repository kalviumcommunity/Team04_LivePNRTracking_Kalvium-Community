import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

/**
 * Configure and export NextAuth utilities.
 * This file is run in standard Node.js environments (allowing database and cryptography operations).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Use PrismaAdapter to allow NextAuth to read/write user accounts and sessions in PostgreSQL database
  adapter: PrismaAdapter(db),
  providers: [
    // 1. Google OAuth Provider for signing in with Google accounts
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // 2. Custom Credentials Provider for email/password sign-in
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        // Ensure credentials are provided
        if (!email || !password) return null;

        // ── Demo / seed accounts (hardcoded check for testing & staging) ──
        if (password === "password123") {
          // Mock passengers
          if (email === "demo@railwaypnr.com") {
            return { id: "1", name: "Demo User", email: "demo@railwaypnr.com", role: "passenger" };
          }
          if (email === "passenger@railwaypnr.com") {
            return { id: "4", name: "Ramesh Rathore", email: "passenger@railwaypnr.com", role: "passenger" };
          }
          // Mock staff
          if (email === "staff@railwaypnr.com") {
            return { id: "2", name: "Sanjay Sharma", email: "staff@railwaypnr.com", role: "staff" };
          }
          // Mock admin
          if (email === "admin@railwaypnr.com") {
            return { id: "3", name: "Priyanka Rathore", email: "admin@railwaypnr.com", role: "admin" };
          }
        }

        // ── Real users stored in PostgreSQL ───────────────────────────
        try {
          // Fetch user record from database matching email
          const user = await db.user.findUnique({
            where: { email },
          });
          
          // Verify user exists and has a password (OAuth-only users might not have a password field)
          if (!user || !user.password) return null;

          // Compare provided password with hashed password in database
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null; // Incorrect password

          // Return user object on success
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (e) {
          console.error("Authorize error:", e);
          return null; // Return null on database or network failures
        }
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback is invoked when JSON Web Token is created or updated.
     * We persist custom fields like the user role here.
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "passenger";
      }
      return token;
    },
    /**
     * Session callback is invoked when a session is checked.
     * Copies the role from token (from jwt callback) onto the session.user object.
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) ?? "passenger";
      }
      return session;
    },
  },
});

