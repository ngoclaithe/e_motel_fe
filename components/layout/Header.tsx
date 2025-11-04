"use client";

import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../theme/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/10 bg-background/80 px-4 backdrop-blur-md dark:border-white/10">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/e-motel.png" alt="E-motel logo" width={28} height={28} className="rounded" />
          <span className="site-title text-sm font-semibold">E-motel</span>
        </Link>
        <span className="hidden text-xs text-zinc-500 sm:inline">Quản lý nhà trọ hiện đại</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
