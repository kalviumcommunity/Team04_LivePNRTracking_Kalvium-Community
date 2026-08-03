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

        // 1. Check real users stored in database first
        try {
          const user = await db.user.findUnique({
            where: { email },
          });

          if (user && user.password) {
            const valid = await bcrypt.compare(password, user.password);
            if (valid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
              };
            }
          }
        } catch (e) {
          console.error("Authorize database error:", e);
        }

        // 2. Demo / seed accounts fallback for quick testing
        if (password === "password123") {
          if (email === "demo@railwaypnr.com") {
            return { id: "1", name: "Demo User", email: "demo@railwaypnr.com", role: "passenger" };
          }
          if (email === "passenger@railwaypnr.com") {
            return { id: "4", name: "Ramesh Rathore", email: "passenger@railwaypnr.com", role: "passenger" };
          }
          if (email === "staff@railwaypnr.com") {
            return { id: "2", name: "Sanjay Sharma", email: "staff@railwaypnr.com", role: "staff" };
          }
          if (email === "admin@railwaypnr.com") {
            return { id: "3", name: "Priyanka Rathore", email: "admin@railwaypnr.com", role: "admin" };
          }
        }

        return null;
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

