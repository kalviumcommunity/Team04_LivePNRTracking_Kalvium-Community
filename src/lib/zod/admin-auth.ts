/**
 * @file admin-auth.ts
 * @description Zod validation schema and TypeScript type definitions for administrative login operations.
 * Requires email, password, and the system admin verification key.
 */

import { z } from "zod";

/**
 * Validation schema for Administrator Login.
 * Enforces email, password, and the required Admin Secret Key.
 */
export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  adminKey: z.string().min(1, "Admin secret key is required"),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
