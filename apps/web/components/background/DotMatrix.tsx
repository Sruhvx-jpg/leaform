"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

interface DotMatrixProps {
  className?: string;
  dotColor?: string;
  gap?: number;
  interactive?: boolean;
  children?: React.ReactNode;
}

export function DotMatrix({
  className,
  dotColor = "rgba(16, 185, 129, 0.2)",
  gap = 24,
  interactive = true,
  children,
}: DotMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", handleResize);
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = dotColor;

      const cols = Math.floor(width / gap) + 1;
      const rows = Math.floor(height / gap) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gap;
          const y = j * gap;

          let size = 1.5;

          if (interactive) {
            const dx = mouseRef.current.x - x;
            const dy = mouseRef.current.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
              const factor = (100 - dist) / 100;
              size = 1.5 + factor * 2.5;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [dotColor, gap, interactive]);

  return (
    <div
      ref={containerRef}
      className={cn("relative min-h-screen w-full overflow-hidden bg-[#081a13] flex flex-col", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-60" />
      <div className="relative z-10 w-full h-full flex flex-col flex-1">{children}</div>
    </div>
  );
}
