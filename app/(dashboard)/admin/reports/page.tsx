"use client";

import { useMemo, useState, useEffect } from "react";
import type { Motel, Room } from "../../../../types";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { userService } from "../../../../lib/services/user";
import { motelService } from "../../../../lib/services/motels";
import { roomService } from "../../../../lib/services/rooms";
import {
  BarChart3,
  Users,
  Building2,
  Home,
  CheckCircle2,
  AlertCircle,
  Wrench,
  TrendingUp,
  DollarSign,
  Download,
  Activity
} from "lucide-react";

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
  useEnsureRole(["ADMIN"]);
  const [motels, setMotels] = useState<Motel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [motelResponse, roomList, userList] = await Promise.all([
          motelService.listMotels({ page: 1, limit: 100 }),
          roomService.listAll(),
          userService.getAllUsers(),
        ]);
        setMotels(motelResponse.data || []);
        setRooms(roomList);
        setUsers(Array.isArray(userList) ? userList : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
    const vacant = rooms.filter((r) => r.status === "VACANT").length;
    const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length;
    const estimatedRevenue = rooms.filter((r) => r.status === "OCCUPIED").reduce((sum, r) => sum + (r.price || 0), 0);
    const occupancyRate = totalRooms ? Math.round((occupied / totalRooms) * 100) : 0;
    return { totalMotels: motels.length, totalRooms, occupied, vacant, maintenance, estimatedRevenue, occupancyRate, totalUsers: users.length };
  }, [motels, rooms, users]);

  const exportMotels = () => {
    if (!motels.length) return;
    download("motels.csv", toCSV(motels as any[]));
  };
  const exportRooms = () => {
    if (!rooms.length) return;
    download("rooms.csv", toCSV(rooms as any[]));
  };

  const statGroups = [
    {
      title: "Tổng quan hệ thống",
      items: [
        { label: "Người dùng", value: stats.totalUsers, icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10", subtitle: "" },
        { label: "Nhà trọ", value: stats.totalMotels, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10", subtitle: "" },
        { label: "Tổng số phòng", value: stats.totalRooms, icon: Home, color: "text-emerald-400", bg: "bg-emerald-500/10", subtitle: "" },
      ]
    },
    {
      title: "Tình trạng phòng",
      items: [
        { label: "Đang thuê", value: stats.occupied, icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10", subtitle: "" },
        { label: "Phòng trống", value: stats.vacant, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", subtitle: "" },
        { label: "Bảo trì", value: stats.maintenance, icon: Wrench, color: "text-red-400", bg: "bg-red-500/10", subtitle: "" },
      ]
    },
    {
      title: "Hiệu suất & Tài chính",
      items: [
        { label: "Tỉ lệ lấp đầy", value: `${stats.occupancyRate}%`, icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-500/10", subtitle: "" },
        { label: "Doanh thu ước tính", value: `${stats.estimatedRevenue.toLocaleString()}đ`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", subtitle: "Tính trên các phòng đang thuê" },
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-indigo-500" />
            Báo cáo & Thống kê
          </h1>
          <p className="mt-1 text-sm text-slate-400">Số liệu chi tiết về hoạt động của hệ thống E-Motel</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportMotels}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-95"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            Xuất DS Nhà trọ
          </button>
          <button
            onClick={exportRooms}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-95"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            Xuất DS Phòng
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="text-slate-400 font-medium animate-pulse">Đang tổng hợp dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-12">
          {statGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-4">
                {group.title}
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/5"
                  >
                    <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-indigo-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"></div>

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className={`rounded-2xl ${item.bg} p-3`}>
                          <item.icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <Activity className="h-4 w-4 text-slate-700 opacity-20 group-hover:opacity-40 transition-opacity" />
                      </div>
                      <div className="mt-4">
                        <div className="text-sm font-medium text-slate-400">{item.label}</div>
                        <div className={`mt-1 text-3xl font-bold text-white`}>
                          {item.value}
                        </div>
                        {item.subtitle && (
                          <div className="mt-1 text-xs text-slate-500">{item.subtitle}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Additional Analytics Concept Block */}
          <div className="rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-xl font-bold text-white">Xu hướng & Dự báo</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Dữ liệu cho thấy tỉ lệ lấp đầy đang duy trì ở mức <span className="text-indigo-400 font-bold">{stats.occupancyRate}%</span>.
                  Hệ thống đề xuất bạn nên tập trung vào việc bảo trì <span className="text-amber-400 font-bold">{stats.maintenance}</span> phòng
                  để tối ưu hóa doanh thu tiềm năng trong tháng tới.
                </p>
              </div>
              <div className="h-32 w-32 rounded-full border-8 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{stats.occupancyRate}%</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Occupancy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
