"use client";

import Link from "next/link";
import { useEnsureRole } from "../../../hooks/useAuth";

export default function LandlordDashboard() {
  useEnsureRole(["LANDLORD"]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Phòng trống</div>
          <div className="mt-1 text-2xl font-semibold">12</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Doanh thu tháng</div>
          <div className="mt-1 text-2xl font-semibold">72,000,000đ</div>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/motels" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Quản lý nhà trọ</Link>
        <Link href="/rooms" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Quản lý phòng</Link>
      </div>
    </div>
  );
}
