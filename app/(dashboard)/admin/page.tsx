"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEnsureRole } from "../../../hooks/useAuth";

function getCounts() {
  try {
    const users = JSON.parse(localStorage.getItem("emotel_users") || "[]");
    const motels = JSON.parse(localStorage.getItem("emotel_motels") || "[]");
    const rooms = JSON.parse(localStorage.getItem("emotel_rooms") || "[]");
    return {
      users: Array.isArray(users) ? users.length : 0,
      motels: Array.isArray(motels) ? motels.length : 0,
      rooms: Array.isArray(rooms) ? rooms.length : 0,
    };
  } catch {
    return { users: 0, motels: 0, rooms: 0 };
  }
}

export default function AdminDashboard() {
  useEnsureRole(["admin"]);
  const [counts, setCounts] = useState(() => getCounts());

  useEffect(() => {
    const interval = setInterval(() => setCounts(getCounts()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Người dùng</div>
          <div className="mt-1 text-2xl font-semibold">{counts.users}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Nhà trọ</div>
          <div className="mt-1 text-2xl font-semibold">{counts.motels}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Phòng</div>
          <div className="mt-1 text-2xl font-semibold">{counts.rooms}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/users" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Quản lý người dùng</Link>
        <Link href="/admin/motels" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Nhà trọ</Link>
        <Link href="/admin/rooms" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Phòng</Link>
        <Link href="/admin/reports" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Báo cáo</Link>
        <Link href="/admin/notifications" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Thông báo</Link>
      </div>
    </div>
  );
}
