"use client";

import Link from "next/link";
import { useEnsureRole } from "../../../hooks/useAuth";

export default function TenantDashboard() {
  useEnsureRole(["TENANT"]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl">
          <div className="text-sm font-medium text-slate-400">Hợp đồng</div>
          <div className="mt-2 text-3xl font-bold text-white">1</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl">
          <div className="text-sm font-medium text-slate-400">Hóa đơn chưa thanh toán</div>
          <div className="mt-2 text-3xl font-bold text-white">0</div>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/motels" className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors">
          Xem nhà trọ
        </Link>
        <Link href="/rooms" className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors">
          Xem phòng
        </Link>
      </div>
    </div>
  );
}
