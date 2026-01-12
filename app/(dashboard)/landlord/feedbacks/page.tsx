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
        return <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">Chờ xử lý</span>;
      case "IN_PROGRESS":
        return <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">Đang xử lý</span>;
      case "RESOLVED":
        return <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">Đã giải quyết</span>;
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Quản Lý Yêu Cầu Sửa Chữa</h1>
        <p className="text-sm text-slate-400 mt-1">Theo dõi và xử lý các phản hồi từ người thuê</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-sm backdrop-blur-xl">
          <div className="text-sm font-medium text-slate-400">Tổng số</div>
          <div className="mt-2 text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="text-sm font-medium text-amber-400">Chờ xử lý</div>
          <div className="mt-2 text-3xl font-bold text-white">{stats.pending}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
          <div className="text-sm font-medium text-blue-400">Đang xử lý</div>
          <div className="mt-2 text-3xl font-bold text-white">{stats.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="text-sm font-medium text-emerald-400">Đã giải quyết</div>
          <div className="mt-2 text-3xl font-bold text-white">{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex bg-slate-900/50 p-1 rounded-xl w-fit border border-white/10">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${statusFilter === "ALL" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${statusFilter === "PENDING" ? "bg-amber-500/20 text-amber-300 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
        >
          Chờ xử lý
        </button>
        <button
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${statusFilter === "IN_PROGRESS" ? "bg-blue-500/20 text-blue-300 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
        >
          Đang xử lý
        </button>
        <button
          onClick={() => setStatusFilter("RESOLVED")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${statusFilter === "RESOLVED" ? "bg-emerald-500/20 text-emerald-300 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
        >
          Đã giải quyết
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500"></div>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-slate-500">Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="group rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white text-lg">{feedback.title}</span>
                    {getStatusBadge(feedback.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Phòng {feedback.room?.number || feedback.roomId}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      {feedback.user?.firstName} {feedback.user?.lastName}
                    </span>
                    <span className="text-slate-500">
                      {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="text-slate-300/90 text-sm line-clamp-2">
                    {feedback.description}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <select
                    value={feedback.status}
                    onChange={(e) => handleUpdateStatus(feedback.id, e.target.value as FeedbackStatus)}
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="PENDING" className="bg-slate-900">Chờ xử lý</option>
                    <option value="IN_PROGRESS" className="bg-slate-900">Đang xử lý</option>
                    <option value="RESOLVED" className="bg-slate-900">Đã giải quyết</option>
                  </select>

                  <button
                    onClick={() => setSelectedFeedback(feedback)}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Chi Tiết Yêu Cầu</h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Tiêu đề</span>
                <div className="text-lg font-semibold text-white">{selectedFeedback.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-500 block mb-1">Phòng</span>
                  <div className="font-medium text-slate-200">Phòng {selectedFeedback.room?.number || selectedFeedback.roomId}</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Người gửi</span>
                  <div className="font-medium text-slate-200">{selectedFeedback.user?.firstName} {selectedFeedback.user?.lastName}</div>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                <span className="text-slate-500 block mb-2 text-xs uppercase tracking-wider font-semibold">Mô tả chi tiết</span>
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{selectedFeedback.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-500 block mb-2">Trạng thái hiện tại</span>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedFeedback.status)}
                    <select
                      value={selectedFeedback.status}
                      onChange={(e) => handleUpdateStatus(selectedFeedback.id, e.target.value as FeedbackStatus)}
                      className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="PENDING" className="bg-slate-900">Chờ xử lý</option>
                      <option value="IN_PROGRESS" className="bg-slate-900">Đang xử lý</option>
                      <option value="RESOLVED" className="bg-slate-900">Đã giải quyết</option>
                    </select>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Ngày tạo</span>
                  <div className="text-slate-300">{new Date(selectedFeedback.createdAt).toLocaleString("vi-VN")}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
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
