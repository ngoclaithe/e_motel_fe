"use client";

import { useEffect, useMemo, useState } from "react";
import { useEnsureRole } from "../../../../hooks/useAuth";
import type { UserRole } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";

interface UserItem {
  email: string;
  role: UserRole;
  createdAt: string;
}

function readUsers(): UserItem[] {
  try {
    const raw = localStorage.getItem("emotel_users");
    const arr = raw ? JSON.parse(raw) : [];
    const valid = Array.isArray(arr) ? arr.filter((u) => u && u.email) : [];
    return valid.map((u) => ({
      email: String(u.email),
      role: (u.role === "admin" || u.role === "tenant" || u.role === "landlord") ? u.role : "landlord",
      createdAt: u.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

function writeUsers(users: UserItem[]) {
  try {
    localStorage.setItem("emotel_users", JSON.stringify(users));
  } catch {}
}

export default function AdminUsersPage() {
  useEnsureRole(["admin"]);
  const { push } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [form, setForm] = useState<UserItem>({ email: "", role: "landlord", createdAt: new Date().toISOString() });
  const [query, setQuery] = useState("");

  useEffect(() => { setUsers(readUsers()); }, []);

  useEffect(() => { writeUsers(users); }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
  }, [users, query]);

  const save = () => {
    if (!form.email) return;
    if (editing) {
      setUsers(users.map((u) => (u.email === editing.email ? { ...editing, ...form } : u)));
      push({ title: "Đã cập nhật", type: "success" });
    } else {
      if (users.some((u) => u.email === form.email)) {
        push({ title: "Email đã tồn tại", type: "error" });
        return;
      }
      setUsers([{ ...form, createdAt: new Date().toISOString() }, ...users]);
      push({ title: "Đã tạo tài khoản", type: "success" });
    }
    setOpen(false);
    setEditing(null);
    setForm({ email: "", role: "landlord", createdAt: new Date().toISOString() });
  };

  const remove = (email: string) => {
    if (!confirm(`Xóa tài khoản ${email}?`)) return;
    setUsers(users.filter((u) => u.email !== email));
    push({ title: "Đã xóa", type: "info" });
  };

  const counts = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      landlord: users.filter((u) => u.role === "landlord").length,
      tenant: users.filter((u) => u.role === "tenant").length,
    };
  }, [users]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Tổng người dùng</div>
          <div className="mt-1 text-2xl font-semibold">{counts.total}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Quản trị</div>
          <div className="mt-1 text-2xl font-semibold">{counts.admin}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Chủ trọ</div>
          <div className="mt-1 text-2xl font-semibold">{counts.landlord}</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Người thuê</div>
          <div className="mt-1 text-2xl font-semibold">{counts.tenant}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Quản lý người dùng</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Tìm theo email hoặc vai trò"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          />
          <button onClick={() => setOpen(true)} className="btn-primary">Thêm tài khoản</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <div key={u.email} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{u.email}</div>
                <div className="mt-0.5 text-xs text-zinc-500">Tạo lúc {new Date(u.createdAt).toLocaleString()}</div>
              </div>
              <span className="badge-accent capitalize">{u.role}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setEditing(u); setForm(u); setOpen(true); }} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Sửa</button>
              <button onClick={() => remove(u.email)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">Không có người dùng phù hợp</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">{editing ? "Cập nhật" : "Thêm tài khoản"}</div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Vai trò</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                >
                  <option value="admin">Quản trị</option>
                  <option value="landlord">Chủ trọ</option>
                  <option value="tenant">Người thuê</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setOpen(false); setEditing(null); }} className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Hủy</button>
                <button onClick={save} className="btn-primary">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
