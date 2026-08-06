"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("userprofile");
        localStorage.clear();
      } catch (e) {
        console.error("Error clearing user session:", e);
      }
    }
    const timer = setTimeout(() => {
      router.push("/welcome");
    }, 800);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center max-w-sm w-full text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <LogOut className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Signing Out</h2>
          <p className="text-sm text-slate-500 mt-1">
            Clearing session and redirecting to welcome page...
          </p>
        </div>
      </div>
    </main>
  );
}
