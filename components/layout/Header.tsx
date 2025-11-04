"use client";

import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../theme/ThemeToggle";
import { useCurrentRole } from "../../hooks/useAuth";

export default function Header() {
  const role = useCurrentRole();
  const label = role === "landlord" ? "Chủ trọ" : role === "tenant" ? "Người thuê" : role === "admin" ? "Quản trị" : null;
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
        {label && (
          <span className="rounded-lg border border-black/10 px-2 py-1 text-xs text-zinc-600 dark:border-white/15 dark:text-zinc-300">
            Vai trò: {label}
          </span>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
