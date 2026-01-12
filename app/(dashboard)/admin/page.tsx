"use client";

import { useEnsureRole } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Building2,
  Home,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  PieChartIcon,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalMotels: number;
  totalRooms: number;
  totalContracts: number;
  activeContracts: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  useEnsureRole(["ADMIN"]);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [contractStatus, setContractStatus] = useState<any[]>([]);
  const [occupancyRate, setOccupancyRate] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overview, revenue, users, contracts, occupancy] = await Promise.all([
          api.get<AdminStats>("/api/v1/statistics/admin/overview"),
          api.get<any[]>("/api/v1/statistics/admin/revenue-chart"),
          api.get<any[]>("/api/v1/statistics/admin/user-growth"),
          api.get<any[]>("/api/v1/statistics/admin/contract-status"),
          api.get<any[]>("/api/v1/statistics/admin/occupancy-rate"),
        ]);

        setStats(overview);
        setRevenueChart(revenue);
        setUserGrowth(users);
        setContractStatus(contracts);
        setOccupancyRate(occupancy);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
        <div className="text-slate-400 font-medium animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      icon: Users,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
    {
      title: "Nhà trọ",
      value: stats.totalMotels,
      icon: Building2,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
    },
    {
      title: "Phòng trọ",
      value: stats.totalRooms,
      icon: Home,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      title: "Hợp đồng",
      value: `${stats.activeContracts}/${stats.totalContracts}`,
      icon: FileText,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      subtitle: "Đang hoạt động",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-indigo-500" />
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">Tổng quan và phân tích hệ thống E-Motel</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:border-white/20"
            >
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${card.color.split(' ')[1]}, ${card.color.split(' ')[3]})` }}
              ></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl ${card.bgColor} p-3`}>
                    <Icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-400">{card.title}</div>
                  <div className={`mt-1 text-3xl font-bold ${card.textColor}`}>
                    {card.value.toLocaleString()}
                  </div>
                  {card.subtitle && (
                    <div className="mt-1 text-xs text-slate-500">{card.subtitle}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-2xl bg-emerald-500/20 p-3">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400">Doanh thu tháng này</div>
              <div className="text-3xl font-bold text-emerald-400">
                {stats.monthlyRevenue.toLocaleString()}đ
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-2xl bg-indigo-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400">Tổng doanh thu</div>
              <div className="text-3xl font-bold text-indigo-400">
                {stats.totalRevenue.toLocaleString()}đ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Revenue & User Growth */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
          <h3 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Doanh thu 12 tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
          <h3 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Tăng trưởng người dùng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="users" name="Người dùng mới" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Contract Status & Occupancy Rate */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contract Status Pie Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
          <h3 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-amber-400" />
            Trạng thái hợp đồng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contractStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {contractStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Rate Pie Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
          <h3 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-400" />
            Tỷ lệ lấp đầy phòng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={occupancyRate}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {occupancyRate.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
