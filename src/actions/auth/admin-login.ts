"use server";

import { signIn } from "@/auth";
import { db } from "@/lib/prisma";
import { AdminLoginSchema, type AdminLoginInput } from "@/lib/zod/admin-auth";
import { AuthError } from "next-auth";

/**
 * Server Action for Administrator Login.
 * Validates credentials, verifies the required Admin Secret Key,
 * logs security audit events in the database, and initiates the session.
 */
export async function adminLogin(values: AdminLoginInput) {
  // 1. Validate inputs via Zod schema
  const validatedFields = AdminLoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid input format. Please check all fields." };
  }

  const { email, password, adminKey } = validatedFields.data;
  const expectedSecret = process.env.ADMIN_SECRET_KEY || "RAILWAY-ADMIN-SECURE-2026";

  // 2. Pre-flight user & role verification
  let targetUser = null;
  try {
    targetUser = await db.user.findUnique({ where: { email } });
  } catch (e) {
    console.error("Admin pre-flight DB lookup failed:", e);
  }

  // Handle non-admin role attempt
  if (targetUser && targetUser.role !== "admin") {
    try {
      await db.auditLog.create({
        data: {
          action: "ADMIN_LOGIN_BLOCKED",
          details: `Unauthorized admin login attempt by non-admin user (${email})`,
          userId: targetUser.id,
        },
      });
    } catch (auditErr) {
      console.error("Audit log creation error:", auditErr);
    }
    return { error: "Access Denied: Your account does not have administrator privileges." };
  }

  // Verify Admin Secret Key pre-flight check
  if (adminKey !== expectedSecret) {
    if (targetUser) {
      try {
        await db.auditLog.create({
          data: {
            action: "ADMIN_LOGIN_FAILED_KEY",
            details: `Failed admin secret key verification for account (${email})`,
            userId: targetUser.id,
          },
        });
      } catch (auditErr) {
        console.error("Audit log creation error:", auditErr);
      }
    }
    return { error: "Invalid Admin Secret Security Key." };
  }

  // 3. Perform NextAuth Credentials Sign In
  try {
    if (targetUser) {
      await db.auditLog.create({
        data: {
          action: "ADMIN_LOGIN_SUCCESS",
          details: `Successful 2FA Administrator Login for (${email})`,
          userId: targetUser.id,
        },
      });
    }

    await signIn("credentials", {
      email,
      password,
      adminKey,
      redirectTo: "/dashboard/overview",
    });

    return { success: "Admin authenticated successfully!" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password credentials." };
    }
    // NextAuth throws a redirect error on successful auth; rethrow it
    throw error;
  }
}
