"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="relative">
      <Sun className="h-[1.2rem] w-[1.2rem] transition-all dark:scale-0 dark:opacity-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 opacity-0 transition-all dark:scale-100 dark:opacity-100" />
    </Button>
  );
}
