"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { DefaultBackground } from "~/components/background/DefaultBackground";
import { FoodBackground } from "~/components/background/FoodBackground";

export default function BackgroundsPagePlural() {
  const [theme, setTheme] = useState<"forms" | "food">("forms");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "forms" ? "food" : "forms"));
  };

  const SelectedBackground = theme === "forms" ? DefaultBackground : FoodBackground;

  return (
    <SelectedBackground>
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <Button variant="outline" onClick={toggleTheme}>
          Switch Theme
        </Button>
      </div>
    </SelectedBackground>
  );
}
