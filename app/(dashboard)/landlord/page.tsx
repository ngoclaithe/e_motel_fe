"use client";

import { useEnsureRole } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { RoomStatusChart } from "@/components/charts/RoomStatusChart";
import {
  Users,
  Home,
  Wallet,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronRight,
  Activity,
  ArrowUpRight,
  Clock
} from "lucide-react";
import Link from "next/link";

interface OverviewStats {
  totalRooms: number;
  totalTenants: number;
  monthlyRevenue: number;
}

export default function LandlordDashboard() {
  useEnsureRole(["LANDLORD"]);

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [roomStatusData, setRoomStatusData] = useState<any[]>([]);
  const [overdueBills, setOverdueBills] = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all stats concurrently
        const [ovRes, revRes, rsRes, billsRes, contractsRes] = await Promise.all([
          api.get<OverviewStats>("/api/v1/statistics/landlord/overview"),
          api.get<any[]>("/api/v1/statistics/landlord/revenue"),
          api.get<any[]>("/api/v1/statistics/landlord/room-status"),
          api.get<any[]>("/api/v1/bills"), // We'll filter these locally or use a specific endpoint if we had one
          api.get<any[]>("/api/v1/contracts"),
        ]);

        setOverview(ovRes);
        setRevenueData(revRes);
        setRoomStatusData(rsRes);

        // Filter overdue bills
        const now = new Date();
        const overdue = (billsRes || []).filter(b => !b.isPaid && new Date(b.month) < now);
        setOverdueBills(overdue);

        // Filter expiring contracts (within 30 days)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiring = (contractsRes || []).filter(c => {
          const endDate = new Date(c.endDate);
          return c.status === 'ACTIVE' && endDate > now && endDate <= thirtyDaysFromNow;
        });
        setExpiringContracts(expiring);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500"></div>
          <p className="text-sm font-medium text-slate-400">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-400">
          Tổng quan tình hình kinh doanh nhà trọ của bạn
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400 group-hover:scale-110 transition-transform">
              <Home className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              +12%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{overview?.totalRooms || 0}</div>
            <div className="text-sm font-medium text-slate-400">Tổng số phòng</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              +4%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{overview?.totalTenants || 0}</div>
            <div className="text-sm font-medium text-slate-400">Người đang thuê</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full">
              Tháng này
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white">{(overview?.monthlyRevenue || 0).toLocaleString()}đ</div>
            <div className="text-sm font-medium text-slate-400">Doanh thu thu về</div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/50 p-8 pt-6 shadow-xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                Doanh thu 6 tháng qua
              </h3>
              <p className="text-sm text-slate-400">Thống kê doanh thu định kỳ</p>
            </div>
            <div className="rounded-lg bg-white/5 p-1 border border-white/10">
              <button className="px-3 py-1 text-xs font-medium text-white bg-indigo-500 rounded-md">Cột</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors">Đường</button>
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>

        {/* Room Status Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 pt-6 shadow-xl backdrop-blur-xl">
          <h3 className="mb-2 text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Trạng thái phòng
          </h3>
          <p className="text-sm text-slate-400 mb-6">Tình trạng các phòng hiện tại</p>
          <RoomStatusChart data={roomStatusData} />
        </div>
      </div>

      {/* Secondary Data Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Overdue Items */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Cần xử lý ngay
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full">
              {overdueBills.length} Mục
            </span>
          </div>

          <div className="space-y-3">
            {overdueBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <div className="p-3 bg-white/5 rounded-full mb-2">✅</div>
                <p className="text-sm">Mọi thứ đều ổn!</p>
              </div>
            ) : (
              overdueBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-red-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Chưa đóng tiền phòng </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Hạn: {new Date(bill.month).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-400">{bill.totalAmount.toLocaleString()}đ</div>
                    <Link href="/landlord/bills" className="text-[10px] text-slate-500 group-hover:text-red-400 transition-colors uppercase font-bold">Chi tiết →</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Expirations */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              Hợp đồng sắp hết hạn
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
              {expiringContracts.length} Mục
            </span>
          </div>

          <div className="space-y-3">
            {expiringContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <p className="text-sm">Không có hợp đồng nào sắp hết hạn</p>
              </div>
            ) : (
              expiringContracts.map(contract => (
                <div key={contract.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-amber-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {contract.room?.number ? `Phòng ${contract.room.number}` : 'Hợp đồng trọ'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Người thuê: {contract.tenant?.firstName} {contract.tenant?.lastName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                    </div>
                    <Link href="/landlord/contracts" className="text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors uppercase font-bold">Gia hạn →</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClipboardList(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h6" />
    </svg>
  )
}
