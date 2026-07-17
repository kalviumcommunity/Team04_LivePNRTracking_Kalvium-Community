import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

        // ── Real users stored in MongoDB ───────────────────────────────
        try {
          await connectDB();
          const user = await User.findOne({ email }).select("+password");
          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "passenger";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) ?? "passenger";
      }
      return session;
    },
  },
});
