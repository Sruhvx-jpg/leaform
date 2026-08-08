"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSignup, useLogin } from "~/hooks";
import { DefaultBackground } from "~/components/background/DefaultBackground";

export default function WelcomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");

  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Custom hooks
  const { signup, isLoading: isSignupLoading, reset: resetSignup } = useSignup();
  const { login, isLoading: isLoginLoading, reset: resetLogin } = useLogin();

  const isLoading = isSignupLoading || isLoginLoading;

  // Password strength calculation for Sign Up mode
  const getPasswordStrength = (pass: string) => {
    if (!pass)
      return {
        score: 0,
        label: "",
        color: "bg-slate-200",
        textColor: "text-slate-400",
        checks: [],
      };

    const checks = [
      { label: "At least 8 characters", met: pass.length >= 8 },
      { label: "Contains a number", met: /\d/.test(pass) },
      { label: "Contains uppercase & lowercase", met: /[a-z]/.test(pass) && /[A-Z]/.test(pass) },
      { label: "Contains special character", met: /[^A-Za-z0-9]/.test(pass) },
    ];

    const score = checks.filter((c) => c.met).length;

    if (score <= 1) {
      return { score: 1, label: "Weak", color: "bg-red-500", textColor: "text-red-500", checks };
    } else if (score === 2) {
      return {
        score: 2,
        label: "Fair",
        color: "bg-amber-500",
        textColor: "text-amber-600",
        checks,
      };
    } else if (score === 3) {
      return {
        score: 3,
        label: "Good",
        color: "bg-emerald-500",
        textColor: "text-emerald-600",
        checks,
      };
    } else {
      return {
        score: 4,
        label: "Strong",
        color: "bg-emerald-600",
        textColor: "text-emerald-700",
        checks,
      };
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const showPasswordStrength = mode === "signup" && password.length > 0;

  const handleModeChange = (newMode: "signup" | "login") => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    resetSignup();
    resetLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail) {
      setErrorMessage("Please enter your email address");
      return;
    }
    if (!cleanPassword) {
      setErrorMessage("Please enter your password");
      return;
    }

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMessage("Full name is required");
          return;
        }
        if (passwordStrength.score < 2) {
          setErrorMessage("Please choose a stronger password before continuing");
          return;
        }
      }

      // Execute signup or login directly with no artificial staged loading screen
      const res = await (mode === "signup"
        ? signup({ fullName: fullName.trim(), email: cleanEmail, password: cleanPassword })
        : login({ email: cleanEmail, password: cleanPassword }));

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(res));
      }

      setSuccessMessage(
        mode === "signup"
          ? `Welcome, ${res.fullName}! Account created successfully.`
          : `Welcome back, ${res.fullName}!`
      );

      setTimeout(() => {
        router.push("/getstarted");
      }, 800);
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "An unexpected error occurred";
      msg = msg.replace(/UNKNOWN ERROR: \+\+.*?Wait.*?\+\+/gi, "").replace(/UNAUTHORIZED ACCESS: \+\+.*?Wait.*?\+\+/gi, "").trim() || msg;
      if (msg.includes("UserService") || msg.includes("Failed query") || msg.includes("DrizzleQueryError") || msg.includes("insert into") || msg.includes("storeRefreshTokenInDB") || msg.includes("SQL")) {
        msg = "An unexpected error occurred. Please try again.";
      }
      setErrorMessage(msg);
    }
  };

  return (
    <DefaultBackground>
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans select-none overflow-x-hidden bg-transparent">
        <div className="relative w-full max-w-[420px] py-6 z-10">
          {/* Decorative Leaf backdrop in the top right */}
          <div className="absolute -top-6 -right-6 w-24 h-24 text-emerald-800/10 dark:text-emerald-400/5 pointer-events-none z-0 transform rotate-12 select-none">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.58,20.19C7.09,20.38 7.62,20.5 8.17,20.5C14.14,20.5 18,17.47 20,13C22.42,7.57 20,3 20,3C20,3 15.5,1.58 10.1,4C5.59,6 2.5,9.88 2.5,15.83C2.5,16.38 2.62,16.91 2.81,17.42L1,19.23L1.77,21L3,19.77C5.09,14.6 7.61,8.4 17,8Z" />
            </svg>
          </div>

          {/* Auth Card Container */}
          <div 
            className="relative w-full bg-white border-2 border-slate-900 p-6 sm:p-8 z-10 flex flex-col items-center min-h-[360px] justify-center backdrop-blur-md shadow-[6px_6px_0px_0px_#16a34a]"
            style={{ borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px" }}
          >
            {/* Logo & Headline */}
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
              <div className="relative w-12 sm:w-14 h-12 sm:h-14 rounded-full overflow-hidden shadow-md mb-3 border border-slate-100 dark:border-neutral-800">
                <Image
                  src="/leafform_logo.png"
                  alt="LeafForm Logo"
                  fill
                  className="object-cover scale-105"
                  priority
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                LeafForm
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1.5 sm:mt-2 max-w-xs leading-relaxed">
                Get better data with conversational forms, surveys, quizzes and more.
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="w-full mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              {/* Full Name Input (Appears in Sign Up mode) */}
              <div
                aria-hidden={mode !== "signup"}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  mode === "signup"
                    ? "max-h-24 opacity-100 transform translate-y-0"
                    : "max-h-0 opacity-0 pointer-events-none transform -translate-y-2"
                }`}
              >
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Alex Rivers"
                  value={fullName}
                  tabIndex={mode === "signup" ? 0 : -1}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-900 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:bg-white transition-all"
                  style={{ borderRadius: "120px 8px 90px 6px/6px 90px 6px 120px" }}
                  required={mode === "signup"}
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                  <span>Email Address</span>
                </label>
                 <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-900 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:bg-white transition-all"
                  style={{ borderRadius: "120px 8px 90px 6px/6px 90px 6px 120px" }}
                  required
                />
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                  <span>Password</span>
                </label>
                <div className="relative w-full flex items-center">
                   <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 bg-slate-50 border-2 border-slate-900 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:bg-white transition-all"
                    style={{ borderRadius: "120px 8px 90px 6px/6px 90px 6px 120px" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator (Sign Up Mode Only) */}
              <div
                aria-hidden={!showPasswordStrength}
                className={`w-full transition-all duration-500 ease-in-out overflow-hidden ${
                  showPasswordStrength
                    ? "max-h-64 opacity-100 scale-100 translate-y-0 my-0.5"
                    : "max-h-0 opacity-0 scale-95 -translate-y-2 my-0 pointer-events-none"
                }`}
              >
                <div className="w-full bg-slate-50/90 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-neutral-400 font-medium">Password Strength:</span>
                    <span className={`font-bold transition-colors duration-300 ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          step <= passwordStrength.score ? passwordStrength.color : "bg-slate-200 dark:bg-neutral-700"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/60 dark:border-neutral-700 text-[11px]">
                    {passwordStrength.checks.map((check, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 transition-colors duration-300 ${
                          check.met ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-neutral-500"
                        }`}
                      >
                        {check.met ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform duration-300 scale-110" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-neutral-600 shrink-0 flex items-center justify-center text-[8px]">
                            ○
                          </div>
                        )}
                        <span>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mode Switch Button */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 pt-1">
                <span>
                  {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
                </span>
                <button
                  type="button"
                  onClick={() => handleModeChange(mode === "signup" ? "login" : "signup")}
                  className="text-slate-900 dark:text-white font-semibold underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {mode === "signup" ? "Log in" : "Sign up"}
                </button>
              </div>

              {/* Submit Button */}
               <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-1 py-3.5 px-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer border-2 border-slate-900 shadow-[3px_3px_0px_0px_#000]"
                style={{ borderRadius: "120px 8px 90px 6px/6px 90px 6px 120px" }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "signup" ? "Sign up with email" : "Log in with email"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Footer Links */}
          <div className="w-full text-center text-xs text-slate-400 dark:text-neutral-500 pt-6">
            <span className="hover:text-slate-600 dark:hover:text-neutral-400 cursor-pointer">Terms of Service</span>
            <span className="mx-2">•</span>
            <span className="hover:text-slate-600 dark:hover:text-neutral-400 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </main>
    </DefaultBackground>
  );
}
