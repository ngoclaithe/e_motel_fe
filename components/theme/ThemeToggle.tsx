"use client";

import { useEffect, useState } from "react";

function getInitialDark(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const saved = window.localStorage.getItem("theme");
  const isDark = saved ? saved === "dark" : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const isDark = getInitialDark();
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
    }
    return isDark;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      window.localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);

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
