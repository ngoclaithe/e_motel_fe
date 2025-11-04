"use client";

import { useState } from "react";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import type { Feedback } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";

export default function LandlordFeedbacksPage() {
  useEnsureRole(["landlord"]);
  const { push } = useToast();
  const [feedbacks, setFeedbacks] = useLocalStorage<Feedback[]>("emotel_feedbacks", []);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

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

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "normal":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const filtered =
    filterStatus === "all" ? feedbacks : feedbacks.filter((f) => f.status === filterStatus);

  const updateStatus = (id: string, newStatus: "pending" | "in_progress" | "completed") => {
    setFeedbacks(
      feedbacks.map((f) =>
        f.id === id
          ? { ...f, status: newStatus, updatedAt: new Date().toISOString() }
          : f
      )
    );
    push({ title: "Cập nhật thành công", type: "success" });
  };

  const remove = (id: string) => {
    if (!confirm("Xóa yêu cầu này?")) return;
    setFeedbacks(feedbacks.filter((f) => f.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  const getPendingCount = () => feedbacks.filter((f) => f.status === "pending").length;
  const getInProgressCount = () => feedbacks.filter((f) => f.status === "in_progress").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Yêu cầu sửa chữa</h1>
      </div>

      {(getPendingCount() > 0 || getInProgressCount() > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {getPendingCount() > 0 && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
              <div className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                {getPendingCount()} yêu cầu đang chờ
              </div>
            </div>
          )}
          {getInProgressCount() > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                {getInProgressCount()} yêu cầu đang xử lý
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Đang chờ</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((feedback) => (
          <div
            key={feedback.id}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-base font-semibold">{feedback.title}</div>
                <div className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  Từ: {feedback.tenantEmail}
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {feedback.description}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {getStatusLabel(feedback.status)}
                  </span>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityBgColor(feedback.priority)}`}>
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
              {feedback.status === "pending" && (
                <button
                  onClick={() => updateStatus(feedback.id, "in_progress")}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Bắt đầu
                </button>
              )}
              {feedback.status === "in_progress" && (
                <button
                  onClick={() => updateStatus(feedback.id, "completed")}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Hoàn thành
                </button>
              )}
              <button
                onClick={() => remove(feedback.id)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
            Không có yêu cầu phù hợp
          </div>
        )}
      </div>

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
                <span className="text-zinc-500">Từ người thuê</span>
                <div className="font-medium">{selectedFeedback.tenantEmail}</div>
              </div>

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
                  <div className="mt-1">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityBgColor(selectedFeedback.priority)}`}>
                      {getPriorityLabel(selectedFeedback.priority)}
                    </span>
                  </div>
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
              {selectedFeedback.status === "pending" && (
                <button
                  onClick={() => {
                    updateStatus(selectedFeedback.id, "in_progress");
                    setSelectedFeedback(null);
                  }}
                  className="btn-primary"
                >
                  Bắt đầu xử lý
                </button>
              )}
              {selectedFeedback.status === "in_progress" && (
                <button
                  onClick={() => {
                    updateStatus(selectedFeedback.id, "completed");
                    setSelectedFeedback(null);
                  }}
                  className="btn-primary"
                >
                  Đánh dấu hoàn thành
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
