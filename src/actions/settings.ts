"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Helper to authenticate user and return DB record
async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please sign in.");
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    throw new Error("Unauthorized: User record not found.");
  }
  return user;
}

// 1. Update Profile (Name & Email)
export async function updateProfile(data: { name: string; email: string }) {
  try {
    const user = await getAuthenticatedUser();

    // If changing email, check if it's already taken
    if (data.email !== user.email) {
      const existing = await db.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        return { error: "An account with this email already exists." };
      }
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        email: data.email,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "UPDATE_PROFILE",
        details: `Updated name to "${data.name}" and email to "${data.email}"`,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: "Profile details updated successfully!" };
  } catch (error: unknown) {
    console.error("[UPDATE_PROFILE]", error);
    return { error: (error as Error).message || "Failed to update profile." };
  }
}

// 2. Change Password
export async function changePassword(data: { current: string; newPass: string }) {
  try {
    const user = await getAuthenticatedUser();

    // Verify user password exists (might be empty if Google login)
    if (!user.password) {
      return { error: "Accounts registered via Google OAuth do not have a password. Please sign in via Google." };
    }

    // Verify current password
    const isMatched = await bcrypt.compare(data.current, user.password);
    if (!isMatched) {
      return { error: "The current password you entered is incorrect." };
    }

    // Hash new password
    const hashed = await bcrypt.hash(data.newPass, 12);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "CHANGE_PASSWORD",
        details: `Changed account password`,
        userId: user.id,
      },
    });

    return { success: "Password changed successfully!" };
  } catch (error: unknown) {
    console.error("[CHANGE_PASSWORD]", error);
    return { error: (error as Error).message || "Failed to change password." };
  }
}

// 3. Delete Account
export async function deleteAccount() {
  try {
    const user = await getAuthenticatedUser();

    // Cascade delete user data (automatically handled by onDelete: Cascade in Prisma schema relations)
    await db.user.delete({
      where: { id: user.id },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("[DELETE_ACCOUNT]", error);
    return { error: (error as Error).message || "Failed to delete account." };
  }
}
