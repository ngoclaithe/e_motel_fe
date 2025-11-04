"use client";

import { useEffect, useState } from "react";

function initializeTheme(): { mounted: boolean; dark: boolean } {
  if (typeof window === "undefined") {
    return { mounted: false, dark: false };
  }
  const saved = window.localStorage.getItem("theme");
  const isDark = saved ? saved === "dark" : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", isDark);
  return { mounted: true, dark: isDark };
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const { mounted: isMounted, dark: isDark } = initializeTheme();
    setMounted(true);
    setDark(isDark);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", dark);
    try {
      window.localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  }, [dark, mounted]);

  if (!mounted) return null;

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setDark((v) => !v)}
      className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 px-3 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
