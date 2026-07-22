"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function resetPassword(values: z.infer<typeof ResetPasswordSchema>) {
  const validatedFields = ResetPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid password or token format." };
  }

  const { token, password } = validatedFields.data;

  try {
    // Find the token in the database
    const existingToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return { error: "Invalid reset token." };
    }

    // Check if token has expired
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      // Clean up the expired token
      await db.passwordResetToken.delete({
        where: { id: existingToken.id },
      });
      return { error: "Token has expired." };
    }

    // Find the user by the email associated with the token
    const user = await db.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!user) {
      return { error: "Email does not exist." };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user password in database
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the token
    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return { success: "Password successfully reset!" };
  } catch (err) {
    console.error("[RESET_PASSWORD]", err);
    return { error: "Something went wrong. Please try again." };
  }
}
