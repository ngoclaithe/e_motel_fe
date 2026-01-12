"use client";

import { useEffect, useMemo, useState } from "react";
import { useEnsureRole } from "../../../../hooks/useAuth";
import type { UserRole } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { userService } from "../../../../lib/services/user";
import { Users, Shield, Building2, UserCheck, Search, Edit2, Trash2, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  createdAt: string;
}

const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case "ADMIN": return "Quản trị";
    case "LANDLORD": return "Chủ trọ";
    case "TENANT": return "Người thuê";
    default: return role;
  }
};

const getRoleBadgeClass = (role: UserRole) => {
  switch (role) {
    case "ADMIN": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "LANDLORD": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "TENANT": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

export default function AdminUsersPage() {
  useEnsureRole(["ADMIN"]);
  const { push } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "LANDLORD" as UserRole,
  });
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      const userList = Array.isArray(response) ? response : [];
      setUsers(userList as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      push({ title: "Lỗi", description: "Không thể tải danh sách người dùng", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    let result = users;

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((u) =>
        u.email?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.phoneNumber?.includes(q)
      );
    }

    return result;
  }, [users, query, roleFilter]);

  const save = async () => {
    if (!form.email) {
      push({ title: "Lỗi", description: "Email là bắt buộc", type: "error" });
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        await userService.updateUser(editing.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
        });
        push({ title: "Đã cập nhật", type: "success" });
      } else {
        push({ title: "Thông báo", description: "Tạo user mới qua trang đăng ký", type: "info" });
      }
      await fetchUsers();
      setOpen(false);
      setEditing(null);
      setForm({ email: "", firstName: "", lastName: "", phoneNumber: "", role: "LANDLORD" });
    } catch (error: any) {
      console.error(error);
      push({
        title: "Lỗi",
        description: error?.message || "Không thể lưu người dùng",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, email: string) => {
    if (!confirm(`Xóa tài khoản ${email}?`)) return;
    try {
      await userService.deleteUser(id);
      push({ title: "Đã xóa", type: "info" });
      await fetchUsers();
    } catch (error: any) {
      console.error(error);
      push({
        title: "Lỗi",
        description: error?.message || "Không thể xóa người dùng",
        type: "error"
      });
    }
  };

  const counts = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.role === "ADMIN").length,
      landlord: users.filter((u) => u.role === "LANDLORD").length,
      tenant: users.filter((u) => u.role === "TENANT").length,
    };
  }, [users]);

  const openEditModal = (user: User) => {
    setEditing(user);
    setForm({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role,
    });
    setOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
        <div className="text-slate-400 font-medium animate-pulse">Đang tải người dùng...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="h-8 w-8 text-purple-500" />
          Quản lý Người dùng
        </h1>
        <p className="mt-1 text-sm text-slate-400">Quản lý tất cả người dùng trong hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:border-white/20">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-20 blur-3xl transition-opacity group-hover:opacity-30"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-purple-500/10 p-3">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-slate-400">Tổng người dùng</div>
              <div className="mt-1 text-3xl font-bold text-purple-400">{counts.total}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:border-white/20">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-red-500 to-rose-500 opacity-20 blur-3xl transition-opacity group-hover:opacity-30"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-red-500/10 p-3">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-slate-400">Quản trị viên</div>
              <div className="mt-1 text-3xl font-bold text-red-400">{counts.admin}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:border-white/20">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-3xl transition-opacity group-hover:opacity-30"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-blue-500/10 p-3">
                <Building2 className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-slate-400">Chủ trọ</div>
              <div className="mt-1 text-3xl font-bold text-blue-400">{counts.landlord}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:border-white/20">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-20 blur-3xl transition-opacity group-hover:opacity-30"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-emerald-500/10 p-3">
                <UserCheck className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-slate-400">Người thuê</div>
              <div className="mt-1 text-3xl font-bold text-emerald-400">{counts.tenant}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
        <div className="flex flex-1 items-center gap-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            placeholder="Tìm kiếm theo email, tên, số điện thoại..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
          className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2 text-sm text-white outline-none focus:border-white/20"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị</option>
          <option value="LANDLORD">Chủ trọ</option>
          <option value="TENANT">Người thuê</option>
        </select>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-slate-900/60"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-xl font-bold text-white shadow-lg">
                  {user.firstName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "Chưa cập nhật"}
                  </div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
              </div>
            </div>

            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>

            <div className="mt-4 space-y-2 text-sm">
              {user.phoneNumber && (
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-slate-500">📞</span>
                  {user.phoneNumber}
                </div>
              )}
              {user.address && (
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-slate-500">📍</span>
                  <span className="truncate">{user.address}</span>
                </div>
              )}
              <div className="text-xs text-slate-500">
                Tạo: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => openEditModal(user)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Sửa
              </button>
              <button
                onClick={() => remove(user.id, user.email)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-12 text-center">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <div className="text-sm text-slate-500">Không tìm thấy người dùng</div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
              </h2>
              <button
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                  setForm({ email: "", firstName: "", lastName: "", phoneNumber: "", role: "LANDLORD" });
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  disabled={!!editing}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none focus:border-white/20 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Họ</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Tên</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Số điện thoại</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none focus:border-white/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                    setForm({ email: "", firstName: "", lastName: "", phoneNumber: "", role: "LANDLORD" });
                  }}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 disabled:opacity-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-500/25 transition-colors"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
