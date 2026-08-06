"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserProfileIndexPage() {
  const router = useRouter();

  useEffect(() => {
    let userId = "user_id";
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user") || localStorage.getItem("userprofile");
        if (stored) {
          const parsed = JSON.parse(stored);
          userId = parsed?.id || parsed?.userId || parsed?.sub || parsed?.email || "user_id";
        }
      } catch (e) {
        console.error("Error reading localStorage:", e);
      }
    }
    router.replace(`/userprofile/${encodeURIComponent(userId)}`);
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <div className="animate-pulse text-slate-500 text-sm">Loading user profile...</div>
    </div>
  );
}
