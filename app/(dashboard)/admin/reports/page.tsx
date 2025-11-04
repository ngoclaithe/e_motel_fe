"use client";

import { useMemo } from "react";
import type { Motel, Room } from "../../../../types";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import { useEnsureRole } from "../../../../hooks/useAuth";

function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(","));
  return lines.join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  useEnsureRole(["admin"]);
  const [motels] = useLocalStorage<Motel[]>("emotel_motels", []);
  const [rooms] = useLocalStorage<Room[]>("emotel_rooms", []);

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const vacant = rooms.filter((r) => r.status === "vacant").length;
    const maintenance = rooms.filter((r) => r.status === "maintenance").length;
    const estimatedRevenue = rooms.filter((r) => r.status === "occupied").reduce((sum, r) => sum + (r.price || 0), 0);
    const occupancyRate = totalRooms ? Math.round((occupied / totalRooms) * 100) : 0;
    return { totalMotels: motels.length, totalRooms, occupied, vacant, maintenance, estimatedRevenue, occupancyRate };
  }, [motels, rooms]);

  const exportMotels = () => {
    if (!motels.length) return;
    download("motels.csv", toCSV(motels));
  };
  const exportRooms = () => {
    if (!rooms.length) return;
    download("rooms.csv", toCSV(rooms));
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Báo cáo & Thống kê</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Nhà trọ</div>
          <div className="mt-1 text-2xl font-semibold">{stats.totalMotels}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Phòng</div>
          <div className="mt-1 text-2xl font-semibold">{stats.totalRooms}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Tỉ lệ lấp đầy</div>
          <div className="mt-1 text-2xl font-semibold">{stats.occupancyRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Đang thuê</div>
          <div className="mt-1 text-2xl font-semibold">{stats.occupied}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Phòng trống</div>
          <div className="mt-1 text-2xl font-semibold">{stats.vacant}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Bảo trì</div>
          <div className="mt-1 text-2xl font-semibold">{stats.maintenance}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Doanh thu ước tính (tháng)</div>
          <div className="mt-1 text-2xl font-semibold">{stats.estimatedRevenue.toLocaleString()}đ</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Xuất dữ liệu</div>
          <div className="mt-2 flex gap-2">
            <button onClick={exportMotels} className="btn-primary">Export Motels CSV</button>
            <button onClick={exportRooms} className="btn-primary">Export Rooms CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}
