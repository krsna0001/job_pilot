'use client';

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "vercel";

const THEME_KEY = "jobpilot-theme";

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "vercel", label: "Vercel", icon: "◼" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored && ["light", "dark", "vercel"].includes(stored)) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  const cycleTheme = useCallback(() => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 400);

    setTheme((prev) => {
      const order: Theme[] = ["light", "dark", "vercel"];
      const next = order[(order.indexOf(prev) + 1) % order.length];
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-primary"
        aria-label="Toggle theme"
      />
    );
  }

  const currentIcon = themes.find((t) => t.value === theme)?.icon ?? "☀️";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Switch theme (current: ${theme})`}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-base transition-all duration-200 hover:border-accent hover:text-accent ${spinning ? "rotate-180 scale-90" : "rotate-0 scale-100"}`}
    >
      <span className={`transition-all duration-300 ${spinning ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}>
        {currentIcon}
      </span>
    </button>
  );
}
