"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/lib/zod/auth";
import { login } from "@/actions/auth/login";
import { signIn } from "next-auth/react";
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

  const handleAutofill = (role: "passenger" | "staff" | "admin") => {
    const emailMap = {
      passenger: "passenger@railwaypnr.com",
      staff: "staff@railwaypnr.com",
      admin: "admin@railwaypnr.com",
    };
    setValue("email", emailMap[role], { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });
  };

  const onSubmit = (values: LoginInput) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const data = await login(values);
      if (data?.error) {
        setError(data.error);
      } else if (data?.success) {
        setSuccess(data.success);
      }
    });
  };

  return (
    <Card className="w-full max-w-[420px] border border-[#eaddcd] dark:border-slate-800 bg-[#faf8f5]/80 dark:bg-slate-950/40 backdrop-blur-xl shadow-xl transition-all duration-300 rounded-2xl p-2">
      <CardHeader className="space-y-1 pb-4 text-center">
        <CardTitle className="text-3xl font-serif text-slate-800 dark:text-white tracking-wide">
          Welcome back
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Please enter your details below to continue.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isPending}
              {...register("email")}
              className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs h-9 ${
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

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                Password
              </Label>
              <a
                href="#forgot"
                className="text-[10px] text-amber-700 dark:text-amber-500 hover:underline font-semibold"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                disabled={isPending}
                {...register("password")}
                className={`bg-white dark:bg-slate-900 pr-10 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs h-9 ${
                  errors.password ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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

          {/* Error and Success banners */}
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          {/* Helper credentials note */}
          <div className="w-full mt-2 p-3 rounded-lg border border-amber-200/40 dark:border-slate-800 bg-amber-50/20 dark:bg-slate-900/20 text-[10px] text-amber-900 dark:text-amber-400">
            <div className="flex gap-2">
              <HelpCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-amber-600" />
              <div className="space-y-1 flex-1">
                <span className="font-bold block">Autofill Demo Portals:</span>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutofill("passenger")}
                    className="text-[9px] h-6 px-2 border-amber-200/60 hover:bg-amber-50/50 text-[#c05621] bg-white dark:bg-slate-900"
                  >
                    Passenger
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutofill("staff")}
                    className="text-[9px] h-6 px-2 border-amber-200/60 hover:bg-amber-50/50 text-[#c05621] bg-white dark:bg-slate-900"
                  >
                    Staff
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutofill("admin")}
                    className="text-[9px] h-6 px-2 border-amber-200/60 hover:bg-amber-50/50 text-[#c05621] bg-white dark:bg-slate-900"
                  >
                    Admin
                  </Button>
                </div>
                <span className="block text-[8px] text-slate-400 mt-1">Password for all is: <code className="font-mono">password123</code></span>
              </div>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              setGooglePending(true);
              await signIn("google", { callbackUrl: "/dashboard" });
            }}
            disabled={googlePending}
            className="w-full h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            {googlePending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#c05621] font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
