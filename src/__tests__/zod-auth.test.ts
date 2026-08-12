import { describe, it, expect } from "vitest";
import { LoginSchema, RegisterSchema } from "@/lib/zod/auth";
import { AdminLoginSchema } from "@/lib/zod/admin-auth";

describe("Auth Zod Schemas", () => {
  describe("LoginSchema", () => {
    it("validates valid login data", () => {
      const valid = LoginSchema.safeParse({
        email: "passenger@example.com",
        password: "securepassword123",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const invalid = LoginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("rejects empty password", () => {
      const invalid = LoginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("RegisterSchema", () => {
    it("validates correct registration inputs", () => {
      const valid = RegisterSchema.safeParse({
        name: "Rahul Sharma",
        email: "rahul@example.com",
        password: "password123",
        confirmPassword: "password123",
        acceptTerms: true,
      });
      expect(valid.success).toBe(true);
    });

    it("fails when passwords do not match", () => {
      const invalid = RegisterSchema.safeParse({
        name: "Rahul Sharma",
        email: "rahul@example.com",
        password: "password123",
        confirmPassword: "differentPassword",
        acceptTerms: true,
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toBe("Passwords do not match");
      }
    });

    it("fails when terms are not accepted", () => {
      const invalid = RegisterSchema.safeParse({
        name: "Rahul Sharma",
        email: "rahul@example.com",
        password: "password123",
        confirmPassword: "password123",
        acceptTerms: false,
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("AdminLoginSchema", () => {
    it("validates full admin credentials including admin secret key", () => {
      const valid = AdminLoginSchema.safeParse({
        email: "admin@railway.gov.in",
        password: "AdminPassword123!",
        adminKey: "SECRET_KEY_999",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects missing admin secret key", () => {
      const invalid = AdminLoginSchema.safeParse({
        email: "admin@railway.gov.in",
        password: "AdminPassword123!",
        adminKey: "",
      });
      expect(invalid.success).toBe(false);
    });
  });
});
