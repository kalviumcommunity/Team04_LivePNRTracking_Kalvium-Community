"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/lib/zod/auth";
import { login } from "@/actions/auth/login";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleAutofill = () => {
    setValue("email", "demo@railwaypnr.com", { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });
  };

  const handleGoogleSignIn = async () => {
    setGooglePending(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Failed to sign in with Google.");
      setGooglePending(false);
    }
  };

  const onSubmit = (values: LoginInput) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const data = await login(values);
        if (data?.error) {
          setError(data.error);
        } else if (data?.success) {
          setSuccess(data.success);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Card className="w-full max-w-md border border-white/10 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl shadow-2xl transition-all duration-300">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Enter your email and password to access your dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={isPending}
                {...register("email")}
                className={`bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 focus-visible:ring-amber-500/20 text-slate-900 dark:text-slate-100 ${
                  errors.email ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#c05621] dark:text-orange-400 hover:underline hover:text-[#a64819]"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isPending}
                {...register("password")}
                className={`bg-white/50 dark:bg-slate-900/50 pr-10 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 focus-visible:ring-amber-500/20 text-slate-900 dark:text-slate-100 ${
                  errors.password ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                disabled={isPending}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error and Success banners */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full bg-[#c05621] hover:bg-[#a64819] dark:bg-[#c05621] dark:hover:bg-[#a64819] text-white font-medium shadow-lg shadow-[#c05621]/15 dark:shadow-none transition-all"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="relative w-full flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <span className="relative bg-white dark:bg-slate-950 px-2.5 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              Or continue with
            </span>
          </div>

          {/* Social Sign-in button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-medium transition-all"
            disabled={isPending || googlePending}
            onClick={handleGoogleSignIn}
          >
            {googlePending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            Google
          </Button>

          {/* Helper credentials note */}
          <div className="w-full mt-2 p-3 rounded-lg border border-[#eaddcd] dark:border-slate-800/80 bg-amber-50/20 dark:bg-slate-900/20 text-xs text-amber-900 dark:text-amber-400 flex items-start justify-between gap-2">
            <div className="flex gap-2">
              <HelpCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-650" />
              <div className="space-y-1">
                <span className="font-semibold block">Demo Account Details</span>
                <p>Email: <code className="bg-amber-100/50 dark:bg-slate-900/50 px-1 py-0.5 rounded font-mono">demo@railwaypnr.com</code></p>
                <p>Password: <code className="bg-amber-100/50 dark:bg-slate-900/50 px-1 py-0.5 rounded font-mono">password123</code></p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutofill}
              className="text-xs h-7 px-2 border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-amber-50/30 dark:hover:bg-slate-900/50 text-[#c05621] dark:text-orange-400"
            >
              Autofill
            </Button>
          </div>
          
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#c05621] dark:text-orange-400 font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
