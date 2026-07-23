"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@/lib/zod/auth";
import { register } from "@/actions/auth/register";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const acceptTerms = useWatch({ control, name: "acceptTerms" });

  const onSubmit = (values: RegisterInput) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const data = await register(values);
      if (data?.error) {
        setError(data.error);
      } else if (data?.success) {
        setSuccess(data.success);
        // Redirect to login after a short delay so user sees the success message
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    });
  };

  const handleGoogleSignIn = async () => {
    setGooglePending(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <Card className="w-full max-w-[440px] border border-[#eaddcd] dark:border-slate-800 bg-[#faf8f5]/80 dark:bg-slate-950/40 backdrop-blur-xl shadow-xl transition-all duration-300 rounded-2xl p-2">
      <CardHeader className="space-y-1 pb-4 text-center">
        <CardTitle className="text-3xl font-serif text-slate-800 dark:text-white tracking-wide">
          {t("registerCreateAccount")}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          {t("registerSubtitle")}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
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
            {t("registerContinueGoogle")}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{t("registerOrEmail")}</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              {t("registerFullName")}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              {...registerField("name")}
              className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs focus-visible:ring-amber-500/30 focus-visible:border-amber-600 rounded-lg"
            />
            {errors.name && (
              <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              {t("registerEmailLabel")}
            </Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="Enter your email"
              {...registerField("email")}
              className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs focus-visible:ring-amber-500/30 focus-visible:border-amber-600 rounded-lg"
            />
            {errors.email && (
              <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              {t("registerPasswordLabel")}
            </Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                {...registerField("password")}
                className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs pr-10 focus-visible:ring-amber-500/30 focus-visible:border-amber-600 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            <Label htmlFor="confirm-password" className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              {t("registerConfirmPassword")}
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                {...registerField("confirmPassword")}
                className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs pr-10 focus-visible:ring-amber-500/30 focus-visible:border-amber-600 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3 pt-1">
            <button
              type="button"
              id="accept-terms"
              onClick={() => setValue("acceptTerms", !acceptTerms, { shouldValidate: true })}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                acceptTerms
                  ? "bg-[#c05621] border-[#c05621] text-white"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              }`}
            >
              {acceptTerms && (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <label htmlFor="accept-terms" className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer">
              {t("registerAcceptTerms")} ixigo&apos;s{" "}
              <span className="text-[#c05621] font-semibold hover:underline cursor-pointer">{t("registerTermsLink")}</span>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold flex items-center gap-1 -mt-2">
              <AlertCircle className="w-3 h-3" />
              {errors.acceptTerms.message}
            </p>
          )}

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
                {t("registerCreatingAccount")}
              </>
            ) : (
              t("registerCreateBtn")
            )}
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            {t("registerAlreadyAccount")}{" "}
            <Link href="/login" className="text-[#c05621] font-bold hover:underline">
              {t("loginSignIn")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
