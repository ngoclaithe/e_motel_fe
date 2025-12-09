"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { feedbackService, type Feedback, type FeedbackStatus } from "../../../../lib/services/feedbacks";

export default function LandlordFeedbacksPage() {
  useEnsureRole(["LANDLORD"]);
  const { push } = useToast();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const data = await feedbackService.listFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
      push({ title: "Không thể tải yêu cầu", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: FeedbackStatus) => {
    try {
      await feedbackService.updateFeedback(id, { status });
      push({ title: "Cập nhật trạng thái thành công", type: "success" });
      fetchFeedbacks();
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status });
      }
    } catch (err) {
      push({ title: "Không thể cập nhật trạng thái", type: "error" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Chờ xử lý</span>;
      case "IN_PROGRESS":
        return <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Đang xử lý</span>;
      case "RESOLVED":
        return <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Đã giải quyết</span>;
      default:
        return null;
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (statusFilter === "ALL") return true;
    return f.status === statusFilter;
  });

  const getStats = () => {
    return {
      total: feedbacks.length,
      pending: feedbacks.filter(f => f.status === "PENDING").length,
      inProgress: feedbacks.filter(f => f.status === "IN_PROGRESS").length,
      resolved: feedbacks.filter(f => f.status === "RESOLVED").length,
    };
  };

  const stats = getStats();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Yêu Cầu Sửa Chữa</h1>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Tổng số</div>
          <div className="mt-1 text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/20">
          <div className="text-sm text-yellow-700 dark:text-yellow-400">Chờ xử lý</div>
          <div className="mt-1 text-2xl font-bold text-yellow-900 dark:text-yellow-200">{stats.pending}</div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
          <div className="text-sm text-blue-700 dark:text-blue-400">Đang xử lý</div>
          <div className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/20">
          <div className="text-sm text-green-700 dark:text-green-400">Đã giải quyết</div>
          <div className="mt-1 text-2xl font-bold text-green-900 dark:text-green-200">{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`rounded-lg px-4 py-2 text-sm ${statusFilter === "ALL" ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`rounded-lg px-4 py-2 text-sm ${statusFilter === "PENDING" ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"}`}
        >
          Chờ xử lý
        </button>
        <button
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`rounded-lg px-4 py-2 text-sm ${statusFilter === "IN_PROGRESS" ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"}`}
        >
          Đang xử lý
        </button>
        <button
          onClick={() => setStatusFilter("RESOLVED")}
          className={`rounded-lg px-4 py-2 text-sm ${statusFilter === "RESOLVED" ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"}`}
        >
          Đã giải quyết
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Đang tải...</div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-12 text-center dark:border-white/15">
          <p className="text-zinc-500">Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="rounded-2xl border border-black/10 p-4 dark:border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{feedback.title}</div>
                  <div className="mt-1 text-sm text-zinc-500">
                    Phòng: {feedback.room?.number || feedback.roomId} • Người gửi: {feedback.user?.firstName} {feedback.user?.lastName}
                  </div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {feedback.description}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {getStatusBadge(feedback.status)}
                  <select
                    value={feedback.status}
                    onChange={(e) => handleUpdateStatus(feedback.id, e.target.value as FeedbackStatus)}
                    className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/15 dark:bg-black/20"
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="RESOLVED">Đã giải quyết</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setSelectedFeedback(feedback)}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chi Tiết Yêu Cầu</h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-2xl font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-zinc-500">Tiêu đề</span>
                <div className="font-medium">{selectedFeedback.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Phòng</span>
                  <div className="font-medium">Phòng {selectedFeedback.room?.number || selectedFeedback.roomId}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Người gửi</span>
                  <div className="font-medium">{selectedFeedback.user?.firstName} {selectedFeedback.user?.lastName}</div>
                </div>
              </div>
              <div>
                <span className="text-zinc-500">Mô tả</span>
                <div className="mt-1 whitespace-pre-wrap">{selectedFeedback.description}</div>
              </div>
              <div>
                <span className="text-zinc-500">Trạng thái</span>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusBadge(selectedFeedback.status)}
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) => handleUpdateStatus(selectedFeedback.id, e.target.value as FeedbackStatus)}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-sm dark:border-white/15 dark:bg-black/20"
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="RESOLVED">Đã giải quyết</option>
                  </select>
                </div>
              </div>
              <div>
                <span className="text-zinc-500">Ngày tạo</span>
                <div className="font-medium">{new Date(selectedFeedback.createdAt).toLocaleString("vi-VN")}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
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
