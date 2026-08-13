/**
 * @file page.tsx
 * @description Forgot password request route component.
 * Provides a form interface for users to enter their registered email address,
 * initiating a password reset process by invoking the forgotPassword server action.
 */

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Train } from "lucide-react";
import Link from "next/link";

import { forgotPassword } from "@/actions/auth/forgot-password";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

/**
 * ForgotPasswordPage Component. Renders the forgot password form.
 */
export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordInput) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await forgotPassword(values);
      
      if (response?.error) {
        setError(response.error);
      } else if (response?.success) {
        setSuccess(response.success);
      }
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f9f5f0] dark:bg-slate-950 relative overflow-hidden px-4 py-12">
      {/* Decorative ambient glows */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-1/3 w-[300px] h-[250px] rounded-full bg-orange-300/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center mb-8 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#c05621] text-white shadow-lg shadow-[#c05621]/25">
            <Train className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">ixigo</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wider uppercase">
          Railway PNR Tracking System
        </p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full flex justify-center">
        <Card className="w-full max-w-[440px] border border-[#eaddcd] dark:border-slate-800 bg-[#faf8f5]/80 dark:bg-slate-950/40 backdrop-blur-xl shadow-xl transition-all duration-300 rounded-2xl p-2">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-3xl font-serif text-slate-800 dark:text-white tracking-wide">
              Reset Password
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Enter your email and we will send you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  disabled={isPending}
                  {...register("email")}
                  className={`h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs focus-visible:ring-amber-500/30 focus-visible:border-amber-600 rounded-lg ${
                    errors.email ? "border-red-500 focus:ring-red-500/20" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Error and Success */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-[#c05621] hover:bg-[#a64819] text-white font-semibold text-xs h-10 shadow-sm shadow-[#c05621]/10 rounded-lg transition-all"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                <Link href="/login" className="inline-flex items-center gap-1 text-[#c05621] font-bold hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-8 flex items-center gap-6 text-[10px] text-slate-400 font-medium">
        <span>Help & Support</span>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span>Privacy Policy</span>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span>Terms of Service</span>
      </div>
    </main>
  );
}
