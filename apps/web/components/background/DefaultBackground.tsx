"use client";

import React, { useEffect, useState } from "react";
import { Clipboard, Leaf } from "lucide-react";

interface StaticIcon {
  id: number;
  Icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  rotate: number;
}

const ICONS = [
  Clipboard,
  Leaf
];

export function DefaultBackground({ children }: { children?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    setMounted(true);
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) {
    return (
      <div className="relative min-h-screen w-full bg-[#F2EADF] dark:bg-neutral-950 flex flex-col transition-colors duration-200">
        <div className="relative z-10 w-full h-full flex flex-col flex-1">{children}</div>
      </div>
    );
  }

  // Define spacing parameters for tiled wallpaper layout
  const spacingX = 96;
  const spacingY = 96;
  const cols = Math.ceil(dimensions.width / spacingX) + 1;
  const rows = Math.ceil(dimensions.height / spacingY) + 1;

  const items: StaticIcon[] = [];
  let id = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isLeaf = (r + c) % 2 === 0;
      const Icon = isLeaf ? Leaf : Clipboard;
      
      // Stagger every second row by half width (brick pattern layout)
      const offset = (r % 2) * (spacingX / 2);
      const x = c * spacingX + offset - 20; // Subtract small offset to cover boundaries
      const y = r * spacingY - 20;

      items.push({
        id: id++,
        Icon,
        x,
        y,
        rotate: isLeaf ? 15 : -15 // Organic rotated angles
      });
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F2EADF] dark:bg-neutral-950 flex flex-col transition-colors duration-200">
      {/* Tiled Pattern Backdrop with moderate opacity/dark mode compatibility */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {items.map((item) => {
          const { Icon } = item;
          return (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                transform: `rotate(${item.rotate}deg)`,
              }}
            >
              <Icon 
                className="w-6 h-6 text-[#16a34a]/35 dark:text-emerald-500/25" 
              />
            </div>
          );
        })}
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full flex flex-col flex-1">{children}</div>
    </div>
  );
}
