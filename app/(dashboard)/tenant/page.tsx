"use client";

import Link from "next/link";
import { useEnsureRole } from "../../../hooks/useAuth";

export default function TenantDashboard() {
  useEnsureRole(["tenant"]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Hợp đồng</div>
          <div className="mt-1 text-2xl font-semibold">1</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Hóa đơn chưa thanh toán</div>
          <div className="mt-1 text-2xl font-semibold">0</div>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/motels" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xem nhà trọ</Link>
        <Link href="/rooms" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xem phòng</Link>
      </div>
    </div>
  );
}
