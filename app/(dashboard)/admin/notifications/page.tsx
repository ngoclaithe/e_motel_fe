"use client";

import { useEffect, useState } from "react";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { useToast } from "../../../../components/providers/ToastProvider";
import { notificationService, type Notification, type CreateNotificationDto } from "../../../../lib/services/notification";
import {
  Bell,
  Plus,
  Trash2,
  User,
  Mail,
  Layers,
  Clock,
  Send,
  ShieldCheck,
  Users,
  X,
  MessageSquare
} from "lucide-react";

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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="h-8 w-8 text-indigo-500" />
            Quản lý thông báo
          </h1>
          <p className="mt-1 text-sm text-slate-400">Gửi và quản lý các thông báo hệ thống</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="group relative overflow-hidden rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-600 active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Tạo thông báo mới
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="text-slate-400 font-medium animate-pulse">Đang tải danh sách thông báo...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col"
            >
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-indigo-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"></div>

              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${n.toRole === "ADMIN" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      n.toRole === "LANDLORD" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        n.toRole === "TENANT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}>
                    {n.toRole || "Tất cả"}
                  </span>
                </div>

                <div className="mb-2">
                  <h3 className="text-lg font-bold text-white line-clamp-1">{n.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-3 mb-6 min-h-[4.5rem]">
                  {n.message}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-white/5">
                      <User className="h-3 w-3" />
                    </div>
                    <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                      {n.createdBy?.email || "System"}
                    </span>
                  </div>

                  <button
                    onClick={() => remove(n.id)}
                    className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 transition-all hover:bg-red-500 hover:text-white border border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-12 text-center backdrop-blur-xl">
              <Bell className="mx-auto h-12 w-12 text-slate-600 opacity-20 mb-4" />
              <div className="text-lg font-medium text-slate-400">Chưa có thông báo nào</div>
              <p className="text-sm text-slate-500">Nhấn "Tạo thông báo mới" để gửi tin nhắn đến người dùng</p>
            </div>
          )}
        </div>
      )}

      {/* Create Notification Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="absolute right-0 top-0 h-48 w-48 -translate-y-24 translate-x-24 rounded-full bg-indigo-500/10 blur-3xl"></div>

            <div className="relative border-b border-white/5 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Tạo thông báo mới</h2>
                <p className="text-slate-400 text-sm mt-0.5">Soạn nội dung gửi đến người dùng</p>
              </div>
              <button onClick={() => setOpen(false)} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  Tiêu đề thông báo
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                  placeholder="Ví dụ: Lịch bảo trì hệ thống..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  Nội dung chi tiết
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all resize-none"
                  placeholder="Nhập nội dung thông báo tại đây..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-400" />
                    Nhóm đối tượng
                  </label>
                  <select
                    value={form.toRole || ""}
                    onChange={(e) => setForm((f) => ({ ...f, toRole: e.target.value as any || undefined }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Tất cả người dùng</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="LANDLORD">Chủ nhà trọ</option>
                    <option value="TENANT">Người thuê phòng</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-400" />
                    Email cụ thể (nếu có)
                  </label>
                  <input
                    type="email"
                    value={form.toEmail}
                    onChange={(e) => setForm((f) => ({ ...f, toEmail: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="user@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-white/5 flex gap-4">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                onClick={create}
                className="flex-1 rounded-2xl bg-indigo-500 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-600 active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
