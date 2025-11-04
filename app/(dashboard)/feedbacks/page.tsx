"use client";

import { useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import type { Feedback } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";

export default function FeedbacksPage() {
  useEnsureRole(["tenant"]);
  const { push } = useToast();
  const [feedbacks, setFeedbacks] = useLocalStorage<Feedback[]>("emotel_feedbacks", []);
  const [open, setOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [form, setForm] = useState<Partial<Feedback>>({
    title: "",
    description: "",
    category: "maintenance",
    priority: "normal",
    images: [],
  });

  const getTenantEmail = () => {
    try {
      const session = JSON.parse(localStorage.getItem("emotel_session") || "null");
      return session?.email || "";
    } catch {
      return "";
    }
  };

  const tenantEmail = getTenantEmail();
  const tenantFeedbacks = feedbacks.filter((f) => f.tenantEmail === tenantEmail);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "in_progress":
        return "Đang xử lý";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "in_progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low":
        return "Thấp";
      case "normal":
        return "Bình thường";
      case "high":
        return "Cao";
      case "urgent":
        return "Khẩn cấp";
      default:
        return priority;
    }
  };

  const save = () => {
    if (!form.title || !form.description) {
      push({ title: "Lỗi", description: "Vui lòng điền tất cả các trường", type: "error" });
      return;
    }

    const newFeedback: Feedback = {
      id: crypto.randomUUID(),
      tenantEmail,
      title: String(form.title),
      description: String(form.description),
      category: form.category || "maintenance",
      priority: form.priority || "normal",
      status: "pending",
      images: form.images || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    push({ title: "Gửi yêu cầu thành công", type: "success" });
    setOpen(false);
    setForm({ title: "", description: "", category: "maintenance", priority: "normal", images: [] });
  };

  const onFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({
        ...f,
        images: [...(f.images || []), String(reader.result)],
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setForm((f) => ({
      ...f,
      images: f.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const remove = (id: string) => {
    if (!confirm("Xóa yêu cầu này?")) return;
    setFeedbacks(feedbacks.filter((f) => f.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Yêu cầu sửa chữa</h1>
        <button onClick={() => setOpen(true)} className="btn-primary">
          Gửi yêu cầu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tenantFeedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-base font-semibold">{feedback.title}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {feedback.description}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {getStatusLabel(feedback.status)}
                  </span>
                  <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                    {getPriorityLabel(feedback.priority)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSelectedFeedback(feedback)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Chi tiết
              </button>
              <button
                onClick={() => remove(feedback.id)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {tenantFeedbacks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
            Chưa có yêu cầu nào
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">Gửi yêu cầu sửa chữa</div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Tiêu đề</label>
                <input
                  value={form.title || ""}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ví dụ: Vòi nước bị rò rỉ"
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Mô tả chi tiết</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả vấn đề cần sửa chữa..."
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Loại</label>
                  <select
                    value={form.category || "maintenance"}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  >
                    <option value="maintenance">Sửa chữa</option>
                    <option value="cleaning">Vệ sinh</option>
                    <option value="complaint">Khiếu nại</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Độ ưu tiên</label>
                  <select
                    value={form.priority || "normal"}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  >
                    <option value="low">Thấp</option>
                    <option value="normal">Bình thường</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm">Ảnh (tùy chọn)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFile(e.target.files?.[0])}
                  className="w-full text-sm"
                />
                {form.images && form.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt={`Upload ${i}`} className="h-20 w-full rounded-lg object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setForm({ title: "", description: "", category: "maintenance", priority: "normal", images: [] });
                  }}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button onClick={save} className="btn-primary">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedFeedback.title}</h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-2xl font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-zinc-500">Mô tả</span>
                <div className="mt-1 rounded-lg bg-black/5 p-3 dark:bg-white/5">
                  {selectedFeedback.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Loại</span>
                  <div className="font-medium">{selectedFeedback.category}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Độ ưu tiên</span>
                  <div className="font-medium">{getPriorityLabel(selectedFeedback.priority)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Trạng thái</span>
                  <div className="mt-1">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(selectedFeedback.status)}`}>
                      {getStatusLabel(selectedFeedback.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500">Ngày gửi</span>
                  <div className="font-medium">
                    {new Date(selectedFeedback.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              {selectedFeedback.images && selectedFeedback.images.length > 0 && (
                <div>
                  <span className="text-zinc-500">Ảnh minh họa</span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {selectedFeedback.images.map((img, i) => (
                      <img key={i} src={img} alt={`Feedback ${i}`} className="h-24 w-full rounded-lg object-cover" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
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
