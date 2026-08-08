"use client";

import React, { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

interface DeepForestGlowProps {
  className?: string;
  children?: React.ReactNode;
}

export function DeepForestGlow({ className, children }: DeepForestGlowProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-gradient-to-tr from-[#092218] via-[#0e2c20] to-[#081a13] text-white flex flex-col transition-colors duration-500",
        className
      )}
    >
      {/* Background ambient light effects */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Spotlight 1 */}
          <div
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          {/* Spotlight 2 */}
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[65%] h-[65%] rounded-full bg-teal-500/8 blur-[130px] mix-blend-screen animate-pulse"
            style={{ animationDuration: "12s" }}
          />
          {/* Spotlight 3 */}
          <div
            className="absolute top-[30%] left-[40%] w-[35%] h-[35%] rounded-full bg-emerald-400/5 blur-[100px] mix-blend-screen animate-pulse"
            style={{ animationDuration: "10s" }}
          />
          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}
      <div className="relative z-10 w-full h-full flex flex-col flex-1">{children}</div>
    </div>
  );
}
