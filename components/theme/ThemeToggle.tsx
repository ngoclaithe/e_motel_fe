"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("theme") : null;
    const isDark = saved ? saved === "dark" : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", dark);
    try { window.localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
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
