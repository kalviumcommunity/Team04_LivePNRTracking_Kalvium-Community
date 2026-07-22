"use server"; // Marks this file's functions as Next.js Server Actions, running exclusively on the server

import { signIn } from "@/auth";
import { LoginSchema, type LoginInput } from "@/lib/zod/auth";
import { AuthError } from "next-auth";

/**
 * Server action to handle user login.
 * It validates inputs using a Zod schema, then triggers the NextAuth signIn method.
 * 
 * @param values - User-submitted email and password credentials
 * @returns An object indicating success or containing an error message
 */
export async function login(values: LoginInput) {
  // Validate incoming credentials against the schema to ensure safety and correct format
  const validatedFields = LoginSchema.safeParse(values);

  // If validation fails, return an error message immediately to the client
  if (!validatedFields.success) {
    return { error: "Invalid email or password format." };
  }

  // Destructure validated credentials
  const { email, password } = validatedFields.data;

  try {
    // Attempt authentication using NextAuth's credentials provider
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard", // Automatically redirects on successful authentication
    });
    return { success: "Logged in successfully!" };
  } catch (error) {
    // Handle auth errors gracefully
    if (error instanceof AuthError) {
      // Typically credentials mismatch manifests as CredentialsSignin
      return { error: "Invalid credentials!" };
    }
    // NextAuth redirects work by throwing a special error; we must rethrow it
    throw error; 
  }
}

