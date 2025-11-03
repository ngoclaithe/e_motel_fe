"use client";

import Link from "next/link";
import ThemeToggle from "../theme/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/10 bg-background/80 px-4 backdrop-blur-md dark:border-white/10">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm font-semibold">E-Motel</Link>
        <span className="text-xs text-zinc-500">Quản lý nhà trọ hiện đại</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
