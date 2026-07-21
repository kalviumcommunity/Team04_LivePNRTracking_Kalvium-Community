"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, Train } from "lucide-react";

const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ResetPasswordInput) => {
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or expired password reset token.");
      return;
    }

    startTransition(async () => {
      // Mock API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess("Your password has been successfully reset! Redirecting to sign in…");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    });
  };

  return (
    <Card className="w-full max-w-[440px] border border-[#eaddcd] dark:border-slate-800 bg-[#faf8f5]/80 dark:bg-slate-950/40 backdrop-blur-xl shadow-xl transition-all duration-300 rounded-2xl p-2">
      <CardHeader className="space-y-1 pb-4 text-center">
        <CardTitle className="text-3xl font-serif text-slate-800 dark:text-white tracking-wide">
          Create New Password
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Please enter your new password below.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                disabled={isPending}
                {...register("password")}
                className={`h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs pr-10 focus-visible:ring-amber-500/30 focus-visible:border-amber-600 rounded-lg ${
                  errors.password ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isPending}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                disabled={isPending}
                {...register("confirmPassword")}
                className={`h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs pr-10 focus-visible:ring-amber-500/30 focus-visible:border-amber-600 rounded-lg ${
                  errors.confirmPassword ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isPending}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword.message}
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
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
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

      {/* Card Wrapper with Suspense */}
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <Card className="w-full max-w-[440px] border border-[#eaddcd] dark:border-slate-800 bg-[#faf8f5]/80 dark:bg-slate-950/40 backdrop-blur-xl shadow-xl rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#c05621]" />
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading reset page...</span>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
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
