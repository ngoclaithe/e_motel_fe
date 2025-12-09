"use client";

import Link from "next/link";
import { useEnsureRole } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { userService } from "../../../lib/services/user";
import { motelService } from "../../../lib/services/motels";
import { roomService } from "../../../lib/services/rooms";

export default function AdminDashboard() {
  useEnsureRole(["ADMIN"]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMotels: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    maintenanceRooms: 0,
    estimatedRevenue: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [users, motelsResponse, rooms] = await Promise.all([
          userService.getAllUsers(),
          motelService.listMotels({ page: 1, limit: 100 }),
          roomService.listAll(),
        ]);

        const userList = Array.isArray(users) ? users : [];
        const motelList = motelsResponse.data || [];
        const roomList = rooms || [];

        const occupied = roomList.filter((r) => r.status === "OCCUPIED").length;
        const vacant = roomList.filter((r) => r.status === "VACANT").length;
        const maintenance = roomList.filter((r) => r.status === "MAINTENANCE").length;
        const revenue = roomList
          .filter((r) => r.status === "OCCUPIED")
          .reduce((sum, r) => sum + (r.price || 0), 0);
        const occupancyRate = roomList.length ? Math.round((occupied / roomList.length) * 100) : 0;

        setStats({
          totalUsers: userList.length,
          totalMotels: motelList.length,
          totalRooms: roomList.length,
          occupiedRooms: occupied,
          vacantRooms: vacant,
          maintenanceRooms: maintenance,
          estimatedRevenue: revenue,
          occupancyRate,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tổng quan hệ thống e-motel
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tổng quan hệ thống e-motel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-200/30 blur-2xl dark:bg-purple-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Người dùng
              </div>
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/40">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalUsers}
            </div>
            <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
              Tổng số người dùng
            </div>
          </div>
        </div>

        {/* Total Motels */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-200/30 blur-2xl dark:bg-green-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-green-700 dark:text-green-400">
                Nhà trọ
              </div>
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/40">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-green-900 dark:text-green-100">
              {stats.totalMotels}
            </div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
              Tổng số nhà trọ
            </div>
          </div>
        </div>

        {/* Total Rooms */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl dark:bg-blue-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Phòng
              </div>
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/40">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalRooms}
            </div>
            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Tổng số phòng
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-200/30 blur-2xl dark:bg-orange-500/10"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Tỉ lệ lấp đầy
              </div>
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/40">
                <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-orange-900 dark:text-orange-100">
              {stats.occupancyRate}%
            </div>
            <div className="mt-1 text-xs text-orange-600 dark:text-orange-400">
              {stats.occupiedRooms}/{stats.totalRooms} phòng đang thuê
            </div>
          </div>
        </div>
      </div>

      {/* Room Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Đang thuê</div>
          <div className="mt-1 text-2xl font-semibold text-green-600">{stats.occupiedRooms}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Phòng trống</div>
          <div className="mt-1 text-2xl font-semibold text-blue-600">{stats.vacantRooms}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Bảo trì</div>
          <div className="mt-1 text-2xl font-semibold text-orange-600">{stats.maintenanceRooms}</div>
        </div>
      </div>

      {/* Revenue */}
      <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm dark:border-white/10 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Doanh thu ước tính (tháng)
        </div>
        <div className="mt-2 text-4xl font-bold text-emerald-900 dark:text-emerald-100">
          {stats.estimatedRevenue.toLocaleString()}đ
        </div>
        <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          Từ {stats.occupiedRooms} phòng đang cho thuê
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
        <h2 className="mb-4 text-lg font-semibold">Quản lý hệ thống</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Link
            href="/admin/users"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-purple-900/20 dark:to-purple-800/20"
          >
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/40">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Người dùng</span>
          </Link>

          <Link
            href="/admin/motels"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-green-50 to-green-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-green-900/20 dark:to-green-800/20"
          >
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/40">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Nhà trọ</span>
          </Link>

          <Link
            href="/admin/rooms"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-blue-900/20 dark:to-blue-800/20"
          >
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/40">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Phòng</span>
          </Link>

          <Link
            href="/admin/reports"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-orange-50 to-orange-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-orange-900/20 dark:to-orange-800/20"
          >
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/40">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Báo cáo</span>
          </Link>

          <Link
            href="/admin/notifications"
            className="group flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-gradient-to-br from-pink-50 to-pink-100 p-4 text-center transition-all hover:scale-105 hover:shadow-md dark:border-white/10 dark:from-pink-900/20 dark:to-pink-800/20"
          >
            <div className="rounded-lg bg-pink-100 p-3 dark:bg-pink-900/40">
              <svg className="h-6 w-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-sm font-medium text-pink-900 dark:text-pink-100">Thông báo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
