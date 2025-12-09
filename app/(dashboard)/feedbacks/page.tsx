"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";
import { feedbackService, type Feedback } from "../../../lib/services/feedbacks";
import { roomService } from "../../../lib/services";

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

  const userEmail = (() => {
    try {
      const session = JSON.parse(localStorage.getItem("emotel_session") || "null");
      return session?.email || "";
    } catch {
      return "";
    }
  })();

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-medium text-white shadow-sm"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>Chờ xử lý</span>;
      case "IN_PROGRESS":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 text-xs font-medium text-white shadow-sm"><span className="h-1.5 w-1.5 rounded-full bg-white"></span>Đang xử lý</span>;
      case "RESOLVED":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-medium text-white shadow-sm"><span className="h-1.5 w-1.5 rounded-full bg-white"></span>Đã giải quyết</span>;
      default:
        return null;
    }
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.number || roomId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-6 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">
              Yêu Cầu Sửa Chữa
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Gửi yêu cầu sửa chữa và theo dõi tiến độ</p>
          </div>
          <button
            onClick={openCreateModal}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-purple-700"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-xl">+</span>
              Tạo Yêu Cầu
            </span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-white"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 py-20 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/20">
            <div className="text-6xl mb-4">🔧</div>
            <p className="text-zinc-500">Chưa có yêu cầu nào</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-gradient-to-br from-white to-zinc-50/50 p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-zinc-200/50 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-950/50 dark:hover:shadow-zinc-900/50"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-2xl"></div>

                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-zinc-900 dark:text-white">{feedback.title}</div>
                      <div className="mt-1 text-sm text-zinc-500">
                        Phòng {getRoomName(feedback.roomId)}
                      </div>
                    </div>
                    {getStatusBadge(feedback.status)}
                  </div>

                  <div className="rounded-lg bg-zinc-50/50 p-4 text-sm text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
                    {feedback.description}
                  </div>

                  <div className="text-xs text-zinc-400">
                    {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedFeedback(feedback)}
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-zinc-50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                      Chi tiết
                    </button>
                    {feedback.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => openEditModal(feedback)}
                          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(feedback.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-zinc-200/50 bg-white shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-900">
              <div className="border-b border-zinc-200/50 bg-gradient-to-r from-zinc-50 to-white p-6 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-950">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {editing ? "Sửa Yêu Cầu" : "Tạo Yêu Cầu Mới"}
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="text-2xl text-zinc-400">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Phòng</label>
                  <select
                    value={form.roomId}
                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                    disabled={!!editing}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        Phòng {room.number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Tiêu đề</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="VD: Điều hòa không hoạt động"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Mô tả chi tiết</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả vấn đề cần sửa chữa..."
                    rows={4}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-200/50 bg-zinc-50/50 p-6 dark:border-zinc-800/50 dark:bg-zinc-900/50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-blue-700 hover:to-purple-700"
                  >
                    {editing ? "Cập nhật" : "Tạo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-zinc-200/50 bg-white shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-900">
              <div className="border-b border-zinc-200/50 bg-gradient-to-r from-zinc-50 to-white p-6 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-950">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Chi Tiết Yêu Cầu</h2>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="text-2xl text-zinc-400">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="text-sm text-zinc-500">Tiêu đề</span>
                  <div className="mt-1 font-semibold">{selectedFeedback.title}</div>
                </div>
                <div>
                  <span className="text-sm text-zinc-500">Phòng</span>
                  <div className="mt-1 font-semibold">Phòng {getRoomName(selectedFeedback.roomId)}</div>
                </div>
                <div>
                  <span className="text-sm text-zinc-500">Mô tả</span>
                  <div className="mt-2 rounded-lg bg-zinc-50 p-4 dark:bg-white/5">{selectedFeedback.description}</div>
                </div>
                <div>
                  <span className="text-sm text-zinc-500">Trạng thái</span>
                  <div className="mt-2">{getStatusBadge(selectedFeedback.status)}</div>
                </div>
                <div>
                  <span className="text-sm text-zinc-500">Ngày tạo</span>
                  <div className="mt-1 font-medium">{new Date(selectedFeedback.createdAt).toLocaleString("vi-VN")}</div>
                </div>
              </div>

              <div className="border-t border-zinc-200/50 bg-zinc-50/50 p-6 dark:border-zinc-800/50 dark:bg-zinc-900/50">
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
