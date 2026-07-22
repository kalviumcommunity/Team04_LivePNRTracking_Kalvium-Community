"use server"; // Marks this file's functions as Next.js Server Actions, running exclusively on the server

import bcrypt from "bcryptjs";
import { RegisterSchema, type RegisterInput } from "@/lib/zod/auth";
import { db } from "@/lib/prisma";

/**
 * Server action to register a new user account.
 * Validates inputs, checks for existing emails, hashes the password, and inserts into the database.
 * 
 * @param values - Form values submitted for registration (name, email, password, acceptTerms, etc.)
 * @returns Success status or error details
 */
export async function register(values: RegisterInput) {
  // Validate schema on the server side to verify fields and check matching passwords
  const validatedFields = RegisterSchema.safeParse(values);

  // If validation fails, return an validation error message
  if (!validatedFields.success) {
    return { error: "Invalid registration inputs." };
  }

  // Destructure fields from validated data
  const { name, email, password } = validatedFields.data;

  try {
    // Check if the email address is already registered in the database
    const existing = await db.user.findUnique({
      where: { email },
    });
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    // Hash the plain text password securely using bcrypt with 12 rounds of salt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create and save the new user record in PostgreSQL with default 'passenger' role
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
    // Log unexpected errors on the server console for debugging
    console.error("[REGISTER]", err);
    return { error: "Something went wrong. Please try again." };
  }
}

