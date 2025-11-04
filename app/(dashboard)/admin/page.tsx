"use client";

import { useEnsureRole } from "../../../hooks/useAuth";

export default function AdminDashboard() {
  useEnsureRole(["admin"]);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
        <div className="text-sm text-zinc-500">Người dùng</div>
        <div className="mt-1 text-2xl font-semibold">1,284</div>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
        <div className="text-sm text-zinc-500">Nhà trọ</div>
        <div className="mt-1 text-2xl font-semibold">86</div>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
        <div className="text-sm text-zinc-500">Hóa đơn tháng</div>
        <div className="mt-1 text-2xl font-semibold">421</div>
      </div>
    </div>
  );
}
