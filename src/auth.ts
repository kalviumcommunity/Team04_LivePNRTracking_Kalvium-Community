import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // ── Demo / seed accounts (hardcoded) ──────────────────────────
        if (password === "password123") {
          if (email === "demo@railwaypnr.com" || email === "passenger@railwaypnr.com") {
            return { id: "1", name: "Ramesh Rathore", email: "passenger@railwaypnr.com", role: "passenger" };
          }
          if (email === "staff@railwaypnr.com") {
            return { id: "2", name: "Sanjay Sharma", email: "staff@railwaypnr.com", role: "staff" };
          }
          if (email === "admin@railwaypnr.com") {
            return { id: "3", name: "Priyanka Rathore", email: "admin@railwaypnr.com", role: "admin" };
          }
        }

        // ── Real users stored in PostgreSQL ───────────────────────────
        try {
          const user = await db.user.findUnique({
            where: { email },
          });
          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (e) {
          console.error("Authorize error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "passenger";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) ?? "passenger";
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});
