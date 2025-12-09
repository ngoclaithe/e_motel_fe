"use client";

import { useEffect, useState } from "react";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { useToast } from "../../../../components/providers/ToastProvider";
import { notificationService, type Notification, type CreateNotificationDto } from "../../../../lib/services/notification";

export default function AdminNotificationsPage() {
  useEnsureRole(["ADMIN"]);
  const { push } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateNotificationDto>({
    title: "",
    message: "",
    toRole: undefined,
    toEmail: "",
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      push({ title: "Lỗi", description: "Không thể tải thông báo", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const create = async () => {
    if (!form.title || !form.message) {
      push({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", type: "error" });
      return;
    }

    try {
      await notificationService.createNotification(form);
      push({ title: "Đã tạo thông báo", type: "success" });
      setOpen(false);
      setForm({ title: "", message: "", toRole: undefined, toEmail: "" });
      await fetchNotifications();
    } catch (error: any) {
      console.error(error);
      push({ title: "Lỗi", description: error?.message || "Không thể tạo thông báo", type: "error" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa thông báo này?")) return;
    try {
      await notificationService.deleteNotification(id);
      push({ title: "Đã xóa", type: "info" });
      await fetchNotifications();
    } catch (error: any) {
      console.error(error);
      push({ title: "Lỗi", description: error?.message || "Không thể xóa thông báo", type: "error" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Quản lý thông báo</h1>
        <button onClick={() => setOpen(true)} className="btn-primary" disabled={loading}>
          Tạo thông báo
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Đang tải...</div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {n.toRole || "Tất cả"}
                </span>
              </div>
              <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{n.message}</div>
              {n.createdBy && (
                <div className="mt-2 text-xs text-zinc-500">
                  Tạo bởi: {n.createdBy.email}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => remove(n.id)}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
              Chưa có thông báo
            </div>
          )}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">Tạo thông báo</div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Tiêu đề</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  placeholder="Thông báo quan trọng"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Nội dung</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  placeholder="Nội dung thông báo..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Gửi tới</label>
                <select
                  value={form.toRole || ""}
                  onChange={(e) => setForm((f) => ({ ...f, toRole: e.target.value as any || undefined }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                >
                  <option value="">Tất cả</option>
                  <option value="ADMIN">Quản trị</option>
                  <option value="LANDLORD">Chủ trọ</option>
                  <option value="TENANT">Người thuê</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Hoặc email cụ thể (tùy chọn)</label>
                <input
                  type="email"
                  value={form.toEmail}
                  onChange={(e) => setForm((f) => ({ ...f, toEmail: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button onClick={create} className="btn-primary">
                  Tạo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
