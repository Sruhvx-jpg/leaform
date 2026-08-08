"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "~/lib/utils";

interface AnimatedGridProps {
  className?: string;
  gridColor?: string;
  cellSize?: number;
  highlightColor?: string;
  children?: React.ReactNode;
}

export function AnimatedGrid({
  className,
  gridColor = "rgba(16, 185, 129, 0.05)",
  cellSize = 48,
  highlightColor = "rgba(16, 185, 129, 0.15)",
  children,
}: AnimatedGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[#092218] text-white flex flex-col",
        className
      )}
    >
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      />

      {/* Moving Radial Highlight following Mouse */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${highlightColor}, transparent 40%)`,
        }}
      />

      {/* Static spotlight to guarantee ambient glow even without mouse interaction */}
      <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 w-full h-full flex flex-col flex-1">{children}</div>
    </div>
  );
}
