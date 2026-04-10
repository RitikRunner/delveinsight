"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { mounted, theme, toggleTheme } = useTheme();

  const label = !mounted
    ? "Theme"
    : theme === "dark"
      ? "Light mode"
      : "Dark mode";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="cursor-pointer rounded-full bg-card/80 backdrop-blur"
      aria-label={label}
      title={label}
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span>{label}</span>
    </Button>
  );
}
