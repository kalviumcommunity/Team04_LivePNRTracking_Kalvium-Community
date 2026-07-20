"use server";

import bcrypt from "bcryptjs";
import { RegisterSchema, type RegisterInput } from "@/lib/zod/auth";
import { db } from "@/lib/prisma";

export async function register(values: RegisterInput) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid registration inputs." };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Check if email is already taken
    const existing = await db.user.findUnique({
      where: { email },
    });
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save the new user
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "passenger",
      },
    });

    return { success: "Account created! Redirecting to sign in…" };
  } catch (err) {
    console.error("[REGISTER]", err);
    return { error: "Something went wrong. Please try again." };
  }
}
