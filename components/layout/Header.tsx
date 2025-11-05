"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../theme/ThemeToggle";
import { useCurrentRole, useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types";

export default function Header() {
  const role = useCurrentRole();
  const { logout, getSession } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    setEmail(session?.email || null);
  }, [getSession]);

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
        {mounted && email && <div className="hidden text-xs text-zinc-600 dark:text-zinc-300 sm:block">{email}</div>}
        {mounted && label && (
          <span className="rounded-lg border border-black/10 px-2 py-1 text-xs text-zinc-600 dark:border-white/15 dark:text-zinc-300">
            Vai trò: {label}
          </span>
        )}
        <ThemeToggle />
        <button onClick={() => logout()} className="ml-2 rounded-lg border border-black/10 px-3 py-1 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Đăng xuất</button>
      </div>
    </header>
  );
}
