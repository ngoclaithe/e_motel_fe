"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";
import { feedbackService, type Feedback } from "../../../lib/services/feedbacks";
import { roomService } from "../../../lib/services";
import { useAuthStore } from "@/store/authStore";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    RESOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const labels: any = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang xử lý",
    RESOLVED: "Đã giải quyết",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'PENDING' ? 'animate-pulse bg-amber-400' : status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
      {labels[status]}
    </span>
  );
};

export default function TenantFeedbacksPage() {
  useEnsureRole(["TENANT"]);
  const { push } = useToast();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Feedback | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    roomId: "",
  });

  const userEmail = useAuthStore((state) => state.user?.email || "");

  useEffect(() => {
    fetchFeedbacks();
    fetchRooms();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const data = await feedbackService.listFeedbacks();
      const ownFeedbacks = data.filter((f: Feedback) => f.user?.email === userEmail);
      setFeedbacks(ownFeedbacks);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
      push({ title: "Không thể tải yêu cầu", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomService.myRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.roomId) {
      push({ title: "Vui lòng điền đầy đủ thông tin", type: "error" });
      return;
    }

    try {
      if (editing) {
        await feedbackService.updateFeedback(editing.id, {
          title: form.title,
          description: form.description,
        });
        push({ title: "Cập nhật yêu cầu thành công", type: "success" });
      } else {
        await feedbackService.createFeedback(form);
        push({ title: "Tạo yêu cầu thành công", type: "success" });
      }

      setOpen(false);
      setEditing(null);
      resetForm();
      fetchFeedbacks();
    } catch (err: any) {
      console.error("Failed to save feedback:", err);
      push({ title: err.message || "Không thể lưu yêu cầu", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa yêu cầu này?")) return;

    try {
      await feedbackService.deleteFeedback(id);
      push({ title: "Đã xóa yêu cầu", type: "success" });
      fetchFeedbacks();
    } catch (err) {
      push({ title: "Không thể xóa yêu cầu", type: "error" });
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      roomId: "",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditing(null);
    setOpen(true);
  };

  const openEditModal = (feedback: Feedback) => {
    if (feedback.status !== "PENDING") {
      push({ title: "Chỉ có thể sửa yêu cầu đang chờ xử lý", type: "error" });
      return;
    }

    setEditing(feedback);
    setForm({
      title: feedback.title,
      description: feedback.description,
      roomId: feedback.roomId,
    });
    setOpen(true);
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.number || roomId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Yêu cầu sửa chữa</h1>
          <p className="mt-1 text-sm text-slate-400">Gửi và theo dõi các yêu cầu hỗ trợ kỹ thuật</p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Tạo yêu cầu
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-12 text-center text-sm text-slate-400 backdrop-blur-xl">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          Đang tải danh sách...
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-20 text-center text-slate-500 bg-slate-900/20">
          <div className="text-6xl mb-4">🔧</div>
          <p>Hiện chưa có yêu cầu sửa chữa nào</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm transition-all hover:bg-slate-900/80 backdrop-blur-xl"
            >
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-blue-500/5 blur-2xl"></div>

              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white truncate max-w-[200px]">{feedback.title}</div>
                    <div className="mt-1 text-sm text-slate-400 font-medium font-mono">
                      Phòng {getRoomName(feedback.roomId)}
                    </div>
                  </div>
                  <StatusBadge status={feedback.status} />
                </div>

                <div className="rounded-xl bg-white/5 p-4 text-sm text-slate-300 border border-white/5 line-clamp-2 min-h-[60px]">
                  {feedback.description}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500 font-medium">
                    {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedFeedback(feedback)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                      Chi tiết
                    </button>
                    {feedback.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(feedback)}
                          className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(feedback.id)}
                          className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="border-b border-white/10 bg-white/5 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editing ? "Sửa Yêu Cầu" : "Tạo Yêu Cầu Mới"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-widest">Phòng</label>
                <select
                  value={form.roomId}
                  onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  disabled={!!editing}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                >
                  <option value="" className="bg-slate-900">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id} className="bg-slate-900">
                      Phòng {room.number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-widest">Tiêu đề</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Điều hòa không hoạt động"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-widest">Mô tả chi tiết</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả cụ thể vấn đề anh/chị đang gặp phải..."
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/5 p-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-purple-500"
              >
                {editing ? "Cập nhật" : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Chi tiết yêu cầu</h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-2xl text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Mã yêu cầu</span>
                  <div className="text-slate-300 font-mono text-sm">{selectedFeedback.id}</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Phòng</span>
                  <div className="text-slate-300 font-bold">Phòng {getRoomName(selectedFeedback.roomId)}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Tiêu đề</span>
                <div className="text-white text-lg font-bold">{selectedFeedback.title}</div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Nội dung chi tiết</span>
                <div className="mt-2 rounded-2xl bg-white/5 p-5 text-slate-300 border border-white/5 leading-relaxed">
                  {selectedFeedback.description}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Trạng thái</span>
                  <StatusBadge status={selectedFeedback.status} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Ngày gửi</span>
                  <div className="text-slate-400 text-sm font-medium">
                    {new Date(selectedFeedback.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/5 p-6 flex justify-end">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-xl border border-white/10 px-8 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
