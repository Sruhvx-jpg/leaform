"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  LogOut,
  CheckCircle,
} from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const profileId = decodeURIComponent(rawId || "");

  const [userInfo, setUserInfo] = useState<{
    fullName?: string;
    email?: string;
    id?: string;
    emailVerified?: boolean;
  } | null>(null);

  // Read user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user") || localStorage.getItem("userprofile");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserInfo(parsed);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
  }, []);

  // Fetch user details via getMe query fallback
  const getMeQuery = trpc.auth.getMe.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (getMeQuery.data) {
      setUserInfo((prev) => ({
        fullName: getMeQuery.data.fullName || prev?.fullName || "User",
        email: getMeQuery.data.email || prev?.email || "",
        id: (getMeQuery.data as any)?.id || prev?.id || profileId,
        emailVerified: getMeQuery.data.emailVerified ?? prev?.emailVerified ?? false,
      }));
    }
  }, [getMeQuery.data, profileId]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("userprofile");
    }
    router.push("/welcome");
  };

  const displayName = userInfo?.fullName || "LeafForm User";
  const displayEmail =
    userInfo?.email || (profileId.includes("@") ? profileId : "user@leafform.com");
  const isVerified = Boolean(userInfo?.emailVerified);

  return (
    <main className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="w-full bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-neutral-900 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/getstarted"
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-800">
            <Image
              src="/leafform_logo.png"
              alt="LeafForm Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">LeafForm</span>
        </div>
      </header>

      {/* Main Profile Container */}
      <div className="max-w-4xl w-full mx-auto p-6 md:p-10 flex flex-col gap-8">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-[#0e0e0e] rounded-2xl border border-slate-200 dark:border-neutral-900 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-800 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-inner">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
              {isVerified && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1">{displayEmail}</p>

            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                  <ShieldAlert className="w-3.5 h-3.5" /> Unverified Email
                </span>
              )}
            </div>
          </div>

          <Link
            href="/logout"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/25 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-900/30 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
