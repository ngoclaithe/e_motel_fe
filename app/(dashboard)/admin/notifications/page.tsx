"use client";

import { useEffect, useMemo, useState } from "react";
import { useEnsureRole } from "../../../../hooks/useAuth";
import type { UserRole } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  toRole?: UserRole | "all";
  toEmail?: string;
  createdAt: string;
}

function readNoti(): NotificationItem[] {
  try {
    const raw = localStorage.getItem("emotel_notifications");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeNoti(items: NotificationItem[]) {
  try { localStorage.setItem("emotel_notifications", JSON.stringify(items)); } catch {}
}

export default function AdminNotificationsPage() {
  useEnsureRole(["admin"]);
  const { push } = useToast();
  const [items, setItems] = useState<NotificationItem[]>(() => readNoti());
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<NotificationItem>>({ title: "", message: "", toRole: "all" });

  useEffect(() => {
    writeNoti(items);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
  }, [items, query]);

  const create = () => {
    if (!form.title || !form.message) return;
    const toRole = form.toRole as UserRole | "all" | undefined;
    const n: NotificationItem = {
      id: crypto.randomUUID(),
      title: String(form.title),
      message: String(form.message),
      toRole: toRole || "all",
      toEmail: form.toEmail || "",
      createdAt: new Date().toISOString(),
    };
    setItems([n, ...items]);
    push({ title: "Đã tạo thông báo", type: "success" });
    setOpen(false);
    setForm({ title: "", message: "", toRole: "all" });
  };

  const remove = (id: string) => {
    if (!confirm("Xóa thông báo này?")) return;
    setItems(items.filter((i) => i.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Thông báo</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Tìm thông báo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          />
          <button onClick={() => setOpen(true)} className="btn-primary">Tạo thông báo</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((n) => (
          <div key={n.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="mt-0.5 text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <span className="badge-accent capitalize">{n.toEmail ? n.toEmail : (n.toRole || "all")}</span>
            </div>
            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{n.message}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => remove(n.id)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">Chưa có thông báo</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">Tạo thông báo</div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Tiêu đề</label>
                <input
                  value={form.title || ""}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Nội dung</label>
                <textarea
                  value={form.message || ""}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Gửi tới</label>
                <select
                  value={form.toRole || "all"}
                  onChange={(e) => setForm((f) => ({ ...f, toRole: e.target.value as UserRole | "all" }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                >
                  <option value="all">Tất cả</option>
                  <option value="admin">Quản trị</option>
                  <option value="landlord">Chủ trọ</option>
                  <option value="tenant">Người thuê</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Hoặc email cụ thể (tùy chọn)</label>
                <input
                  type="email"
                  value={form.toEmail || ""}
                  onChange={(e) => setForm((f) => ({ ...f, toEmail: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Hủy</button>
                <button onClick={create} className="btn-primary">Tạo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
