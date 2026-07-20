"use server";

import { signIn } from "@/auth";
import { LoginSchema, type LoginInput } from "@/lib/zod/auth";
import { AuthError } from "next-auth";

export async function login(values: LoginInput) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email or password format." };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { success: "Logged in successfully!" };
  } catch (error) {
    if (error instanceof AuthError) {
      // Typically credentials mismatch manifests as CredentialsSignin
      return { error: "Invalid credentials!" };
    }
    throw error; // Rethrow redirect or internal next.js errors
  }
}
