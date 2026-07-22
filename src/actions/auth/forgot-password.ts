"use server";

import { db } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function forgotPassword(values: { email: string }) {
  const validatedFields = ForgotPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email address format." };
  }

  const { email } = validatedFields.data;

  try {
    // Check if the user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "No account found with this email address." };
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Set expiration time to 1 hour from now
    const expires = new Date(Date.now() + 3600 * 1000);

    // Delete any existing password reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Save the new token to database
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Log the link in console for local testing / development
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    console.log("=========================================");
    console.log("PASSWORD RESET LINK GENERATED:");
    console.log(resetLink);
    console.log("=========================================");

    return { success: "Password reset instructions have been sent to your email!" };
  } catch (err) {
    console.error("[FORGOT_PASSWORD]", err);
    return { error: "Something went wrong. Please try again." };
  }
}
