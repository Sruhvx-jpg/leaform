"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Star,
  Globe,
  ChevronDown,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSignup, useLogin } from "~/hooks";

export default function WelcomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const slides = [
    {
      subtitle: "Form builder",
      title: "Build refreshingly different forms",
      brandBadge: "GLOSSY LOCKS ®",
      fontBadge: "Aa",
      formTitle: "Rate The Shampoo",
      primaryColor: "bg-[#134e3b]",
      dropColor1: "bg-[#134e3b]",
      dropColor2: "bg-[#b999eb]",
      dropColor3: "bg-white",
      canvasGradient: "from-[#ebdcfc] via-[#e5d2fa] to-[#dfc4f8]",
      peekBg: "bg-[#dfc4f8]/40",
      type: "shampoo",
    },
    {
      subtitle: "Surveys & Quizzes",
      title: "Get better data with conversational flows",
      brandBadge: "LEAF FORM ®",
      fontBadge: "Bb",
      formTitle: "Customer Satisfaction",
      primaryColor: "bg-[#0d5c41]",
      dropColor1: "bg-[#0d5c41]",
      dropColor2: "bg-[#34d399]",
      dropColor3: "bg-white",
      canvasGradient: "from-[#d1fae5] via-[#a7f3d0] to-[#6ee7b7]",
      peekBg: "bg-[#a7f3d0]/40",
      type: "survey",
    },
    {
      subtitle: "Analytics & Insights",
      title: "Real-time responses & metrics at scale",
      brandBadge: "METRICS LAB ®",
      fontBadge: "Cc",
      formTitle: "Product Onboarding",
      primaryColor: "bg-[#065f46]",
      dropColor1: "bg-[#065f46]",
      dropColor2: "bg-[#fbbf24]",
      dropColor3: "bg-white",
      canvasGradient: "from-[#fef3c7] via-[#fde68a] to-[#fcd34d]",
      peekBg: "bg-[#fde68a]/40",
      type: "analytics",
    },
  ];

  // Auto-play carousel slider with interval reset on manual action
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, slides.length]);

  const handleSlideNavigation = (newIndex: number) => {
    setActiveSlide(newIndex);
    // Restart timer interval on manual navigation
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }, 3800);
    }
  };

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
    const cleanPassword = password.trim();

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
        const res = await signup({
          fullName: fullName.trim(),
          email: cleanEmail,
          password: cleanPassword,
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(res));
        }
        setSuccessMessage(`Welcome, ${res.fullName}! Account created successfully.`);
        setTimeout(() => {
          router.push("/getstarted");
        }, 1200);
      } else {
        const res = await login({ email: cleanEmail, password: cleanPassword });
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(res));
        }
        setSuccessMessage(`Welcome back, ${res.fullName}!`);
        setTimeout(() => {
          router.push("/getstarted");
        }, 1200);
      }
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "An unexpected error occurred";
      // Clean up template prefixes or raw internal stack traces
      msg =
        msg
          .replace(/UNKNOWN ERROR: \+\+.*?Wait.*?\+\+/gi, "")
          .replace(/UNAUTHORIZED ACCESS: \+\+.*?Wait.*?\+\+/gi, "")
          .trim() || msg;

      if (
        msg.includes("UserService") ||
        msg.includes("Failed query") ||
        msg.includes("DrizzleQueryError") ||
        msg.includes("insert into") ||
        msg.includes("storeRefreshTokenInDB") ||
        msg.includes("SQL")
      ) {
        msg = "An unexpected error occurred. Please try again.";
      }
      setErrorMessage(msg);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2 bg-white font-sans select-none overflow-x-hidden">
      {/* LEFT PANEL: Responsive Deep Green Carousel */}
      <div className="order-2 lg:order-1 flex flex-col justify-between items-center bg-gradient-to-br from-[#092218] via-[#0e2c20] to-[#081a13] p-4 sm:p-10 lg:p-12 relative overflow-hidden select-none w-full py-8 sm:py-10 lg:py-12 min-h-[380px] sm:min-h-[480px] lg:min-h-screen">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-500/10 rounded-full blur-[70px] sm:blur-[100px] pointer-events-none" />

        <div className="w-full hidden sm:block" />

        {/* Outer Viewport Container with Real Slide Peek */}
        <div className="w-full max-w-[340px] sm:max-w-lg lg:max-w-xl z-10 flex flex-col items-center relative my-auto">
          {/* Horizontal Sliding Track Viewport */}
          <div className="w-full overflow-hidden relative rounded-3xl py-2">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(-${activeSlide * 88}%)` }}
            >
              {slides.map((slide, idx) => {
                const isActive = activeSlide === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => !isActive && setActiveSlide(idx)}
                    className={`w-[88%] shrink-0 pr-3 sm:pr-6 transition-all duration-500 ${
                      isActive
                        ? "scale-100 opacity-100 z-10"
                        : "scale-[0.96] opacity-50 hover:opacity-80 cursor-pointer z-0"
                    }`}
                  >
                    {/* Main White Showcase Card */}
                    <div className="w-full bg-white text-slate-900 rounded-3xl p-4 sm:p-8 shadow-2xl flex flex-col items-center text-center relative border border-slate-100/80">
                      <span className="text-[10px] sm:text-xs font-medium text-slate-500 mb-1">
                        {slide.subtitle}
                      </span>
                      <h2 className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 mb-3 sm:mb-6">
                        {slide.title}
                      </h2>

                      {/* Inner Pastel Showcase Graphic Canvas */}
                      <div
                        className={`w-full h-48 sm:h-72 rounded-2xl bg-gradient-to-b ${slide.canvasGradient} relative overflow-hidden p-2.5 sm:p-4 flex items-center justify-center shadow-inner border border-white/40`}
                      >
                        {/* Floating Badge 1: Brand Name */}
                        <div className="bg-white text-slate-900 text-[8px] sm:text-[11px] font-extrabold tracking-wider px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl shadow-md border border-slate-100 absolute top-2.5 sm:top-5 left-2.5 sm:left-5 z-20 flex items-center gap-1">
                          {slide.brandBadge}
                        </div>

                        {/* Floating Badge 2: Font Symbol */}
                        <div className="bg-white text-slate-900 text-[9px] sm:text-xs font-serif font-bold w-5 h-5 sm:w-8 sm:h-8 rounded-xl shadow-md border border-slate-100 flex justify-center items-center absolute top-2.5 sm:top-5 left-28 sm:left-40 z-20">
                          {slide.fontBadge}
                        </div>

                        {/* Floating Color Drop Pills (Teardrops) */}
                        <div className="absolute top-2.5 sm:top-5 right-2.5 sm:right-5 flex items-center gap-1 sm:gap-1.5 z-20">
                          <div
                            className={`w-2.5 sm:w-4 h-3.5 sm:h-6 rounded-t-full rounded-b-md ${slide.dropColor1} shadow-sm transform -rotate-12`}
                          />
                          <div
                            className={`w-2.5 sm:w-4 h-3.5 sm:h-6 rounded-t-full rounded-b-md ${slide.dropColor2} shadow-sm transform -rotate-12`}
                          />
                          <div
                            className={`w-2.5 sm:w-4 h-3.5 sm:h-6 rounded-t-full rounded-b-md ${slide.dropColor3} shadow-sm transform -rotate-12`}
                          />
                        </div>

                        {/* Embedded Dark Form Preview Box */}
                        <div
                          className={`${slide.primaryColor} text-white p-2.5 sm:p-5 rounded-2xl shadow-2xl w-36 sm:w-56 absolute left-2.5 sm:left-5 bottom-2.5 sm:bottom-5 text-left z-20 transition-all duration-500 border border-white/10`}
                        >
                          <div className="text-[10px] sm:text-sm font-serif font-medium mb-1.5 sm:mb-3 tracking-wide text-white/95 truncate">
                            {slide.formTitle}
                          </div>
                          <div className="flex gap-0.5 sm:gap-1 text-white/90">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 stroke-[1.5]" />
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 stroke-[1.5]" />
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 stroke-[1.5]" />
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 stroke-[1.5]" />
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 stroke-[1.5]" />
                          </div>
                        </div>

                        {/* Slide Graphics Area depending on type */}
                        {slide.type === "shampoo" && (
                          <div className="absolute right-2 sm:right-6 bottom-2 sm:bottom-3 w-28 sm:w-40 h-36 sm:h-52 opacity-90 pointer-events-none z-10 overflow-hidden flex flex-wrap gap-1.5 transform rotate-[-6deg] scale-80 sm:scale-100 origin-bottom-right">
                            <div className="w-10 sm:w-14 h-18 sm:h-24 bg-gradient-to-b from-[#3a201b] to-[#1f100d] rounded-2xl border border-white/20 shadow-md p-1 flex flex-col justify-between items-center text-[5px] sm:text-[7px] text-amber-100/70">
                              <div className="w-3.5 sm:w-5 h-1 sm:h-2 bg-amber-900/60 rounded-t-sm" />
                              <div className="text-center font-serif text-[4.5px] sm:text-[6px] leading-tight">
                                GLOSSY
                                <br />
                                SHAMPOO
                              </div>
                              <div className="w-5 sm:w-8 h-1 bg-white/20 rounded" />
                            </div>
                            <div className="w-10 sm:w-14 h-18 sm:h-24 bg-gradient-to-b from-[#3a201b] to-[#1f100d] rounded-2xl border border-white/20 shadow-md p-1 flex flex-col justify-between items-center text-[5px] sm:text-[7px] text-amber-100/70">
                              <div className="w-3.5 sm:w-5 h-1 sm:h-2 bg-amber-900/60 rounded-t-sm" />
                              <div className="text-center font-serif text-[4.5px] sm:text-[6px] leading-tight">
                                GLOSSY
                                <br />
                                SHAMPOO
                              </div>
                              <div className="w-5 sm:w-8 h-1 bg-white/20 rounded" />
                            </div>
                          </div>
                        )}

                        {slide.type === "survey" && (
                          <div className="absolute right-2 sm:right-6 bottom-2 sm:bottom-4 w-24 sm:w-36 h-32 sm:h-48 opacity-90 pointer-events-none z-10 overflow-hidden flex flex-col gap-1.5 p-2 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg transform rotate-[-4deg] scale-85 sm:scale-100 origin-bottom-right">
                            <div className="w-full h-2.5 sm:h-3 bg-emerald-700/80 rounded" />
                            <div className="w-3/4 h-2 sm:h-2.5 bg-emerald-600/40 rounded" />
                            <div className="w-full h-5 sm:h-8 bg-white/80 rounded-lg shadow-sm border border-emerald-100 flex items-center px-1.5 text-[6.5px] sm:text-[8px] font-semibold text-emerald-900">
                              ✓ Very Satisfied
                            </div>
                          </div>
                        )}

                        {slide.type === "analytics" && (
                          <div className="absolute right-2 sm:right-6 bottom-2 sm:bottom-4 w-24 sm:w-36 h-32 sm:h-48 opacity-90 pointer-events-none z-10 overflow-hidden flex flex-col justify-end p-2 bg-emerald-950/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg transform rotate-[-4deg] scale-85 sm:scale-100 origin-bottom-right">
                            <div className="flex items-end justify-between h-16 sm:h-28 gap-1 px-1">
                              <div className="w-2.5 sm:w-4 h-[40%] bg-emerald-400/80 rounded-t-sm" />
                              <div className="w-2.5 sm:w-4 h-[65%] bg-emerald-400/90 rounded-t-sm" />
                              <div className="w-2.5 sm:w-4 h-[85%] bg-amber-300 rounded-t-sm" />
                              <div className="w-2.5 sm:w-4 h-[100%] bg-white rounded-t-sm" />
                            </div>
                            <div className="w-full h-1.5 sm:h-2 bg-white/20 rounded mt-1.5 sm:mt-2" />
                          </div>
                        )}

                        {/* Video Thumbnail Badge with Play Icon Overlay */}
                        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white p-0.5 sm:p-1 shadow-2xl border border-slate-100 absolute bottom-2.5 sm:bottom-5 right-2.5 sm:right-5 z-30 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                          <div className="w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-800 via-amber-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
                            <div className="w-3.5 h-3.5 sm:w-6 sm:h-6 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-md">
                              <Play className="w-2 h-2 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-4 mt-4 sm:mt-6 z-10">
            {/* Previous button */}
            <button
              type="button"
              onClick={() =>
                handleSlideNavigation(activeSlide > 0 ? activeSlide - 1 : slides.length - 1)
              }
              className="text-white/40 hover:text-white transition-colors cursor-pointer p-1"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play/Pause toggle */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:opacity-80 transition-opacity cursor-pointer p-1"
              aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              )}
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-3 px-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSlideNavigation(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === idx ? "bg-white" : "bg-white/35 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={() =>
                handleSlideNavigation(activeSlide < slides.length - 1 ? activeSlide + 1 : 0)
              }
              className="text-white hover:text-white/80 transition-colors cursor-pointer p-1"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full text-center text-[10px] sm:text-xs text-white/40 z-10 mt-4 lg:mt-0">
          © 2026 LeafForm Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL: Clean White Background Typeform Style Auth Panel */}
      <div className="order-1 lg:order-2 flex flex-col justify-between p-5 sm:p-10 lg:p-12 bg-white text-slate-900 min-h-screen w-full overflow-y-auto">
        {/* Top Header Bar */}
        <div className="w-full flex justify-end items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer hover:border-slate-300 bg-slate-50/50">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>English</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </div>
        </div>

        {/* Center Auth Form Box */}
        <div className="w-full max-w-sm mx-auto flex flex-col items-center my-auto py-2">
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            <div className="relative w-12 sm:w-14 h-12 sm:h-14 rounded-full overflow-hidden shadow-md mb-3 border border-slate-100">
              <Image
                src="/leafform_logo.png"
                alt="LeafForm Logo"
                fill
                className="object-cover scale-105"
                priority
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              LeafForm
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2 max-w-xs leading-relaxed">
              Get better data with conversational forms, surveys, quizzes and more.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="w-full mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-fadeIn">
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
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Alex Rivers"
                value={fullName}
                tabIndex={mode === "signup" ? 0 : -1}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                required={mode === "signup"}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                required
              />
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Password</span>
              </label>
              <div className="relative w-full flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator (Sign Up Mode Only) - Smooth In/Out Animation */}
            <div
              aria-hidden={!showPasswordStrength}
              className={`w-full transition-all duration-500 ease-in-out overflow-hidden ${
                showPasswordStrength
                  ? "max-h-64 opacity-100 scale-100 translate-y-0 my-0.5"
                  : "max-h-0 opacity-0 scale-95 -translate-y-2 my-0 pointer-events-none"
              }`}
            >
              <div className="w-full bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm">
                {/* Score Bar & Label */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Password Strength:</span>
                  <span
                    className={`font-bold transition-colors duration-300 ${passwordStrength.textColor}`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>

                {/* Segmented Progress Meter */}
                <div className="grid grid-cols-4 gap-1.5 w-full">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        step <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Criteria Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/60 text-[11px]">
                  {passwordStrength.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 transition-colors duration-300 ${
                        check.met ? "text-emerald-700 font-medium" : "text-slate-400"
                      }`}
                    >
                      {check.met ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 transition-transform duration-300 scale-110" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[8px] text-slate-400">
                          ○
                        </div>
                      )}
                      <span>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mode Switch Text below Password / Strength Meter */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
              <span>
                {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => handleModeChange(mode === "signup" ? "login" : "signup")}
                className="text-slate-900 font-semibold underline underline-offset-2 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                {mode === "signup" ? "Log in" : "Sign up"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-3.5 px-4 rounded-xl bg-[#373036] hover:bg-[#252024] active:bg-[#181518] disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer"
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
        <div className="w-full text-center text-xs text-slate-400 pt-4 sm:pt-6">
          <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
          <span className="mx-2">•</span>
          <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
        </div>
      </div>
    </main>
  );
}
