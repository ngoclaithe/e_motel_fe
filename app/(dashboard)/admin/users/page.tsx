"use client";

import { useEffect, useMemo, useState } from "react";
import { useEnsureRole } from "../../../../hooks/useAuth";
import type { UserRole } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { userService } from "../../../../lib/services/user";

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
    case "ADMIN": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "LANDLORD": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "TENANT": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
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

    // Filter by role
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Filter by search query
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

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm dark:border-white/10 dark:from-blue-950/20 dark:to-black/40">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Tổng người dùng</div>
          <div className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">{counts.total}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm dark:border-white/10 dark:from-red-950/20 dark:to-black/40">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Quản trị</div>
          <div className="mt-1 text-3xl font-bold text-red-600 dark:text-red-400">{counts.admin}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm dark:border-white/10 dark:from-blue-950/20 dark:to-black/40">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Chủ trọ</div>
          <div className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">{counts.landlord}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm dark:border-white/10 dark:from-green-950/20 dark:to-black/40">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Người thuê</div>
          <div className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">{counts.tenant}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Quản lý người dùng</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            placeholder="Tìm kiếm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị</option>
            <option value="LANDLORD">Chủ trọ</option>
            <option value="TENANT">Người thuê</option>
          </select>
        </div>
      </div>

      {/* User Cards */}
      {loading ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Đang tải...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="group rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-black/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-semibold text-white">
                    {user.firstName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : "Chưa cập nhật"}
                    </div>
                    <div className="text-xs text-zinc-500">{user.email}</div>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {user.phoneNumber}
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.address}
                  </div>
                )}
                <div className="text-xs text-zinc-400">
                  Tạo: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEditModal(user)}
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Sửa
                </button>
                <button
                  onClick={() => remove(user.id, user.email)}
                  className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-12 text-center text-sm text-zinc-500 dark:border-white/15">
              Không tìm thấy người dùng
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">
              {editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  disabled={!!editing}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Họ</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Tên</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Số điện thoại</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                    setForm({ email: "", firstName: "", lastName: "", phoneNumber: "", role: "LANDLORD" });
                  }}
                  disabled={saving}
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
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
