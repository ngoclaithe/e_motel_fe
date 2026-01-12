"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/authStore";

export default function LandlordContractRequestsPage() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return;
            try {
                const data = await api.get<any[]>("/api/v1/contract-requests");
                setRequests(data);
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [user]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        const message = prompt(
            action === 'approve'
                ? "Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu này? Hợp đồng sẽ được tạo tự động. Nhập tin nhắn phản hồi (tùy chọn):"
                : "Nhập lý do TỪ CHỐI yêu cầu này:"
        );

        if (message === null) return; // Cancelled
        if (action === 'reject' && !message) {
            alert("Vui lòng nhập lý do từ chối");
            return;
        }

        setProcessingId(id);
        try {
            await api.patch(`/api/v1/contract-requests/${id}/${action}`, {
                responseMessage: message
            });

            // Update UI
            setRequests(requests.map(req =>
                req.id === id ? { ...req, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : req
            ));

            alert(action === 'approve' ? "Đã duyệt yêu cầu và tạo hợp đồng!" : "Đã từ chối yêu cầu!");
        } catch (error: any) {
            console.error(`Error ${action}ing request:`, error);
            alert(error.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-slate-400">Đang tải danh sách yêu cầu...</div>
            </div>
        );
    }

    const pendingRequests = requests.filter(r => r.status === 'PENDING');
    const otherRequests = requests.filter(r => r.status !== 'PENDING');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Quản lý Yêu cầu Hợp đồng</h1>

            {/* Pending Requests Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Đang chờ xử lý ({pendingRequests.length})</h2>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-sm backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-white/5 text-xs font-bold uppercase text-slate-300">
                                <tr>
                                    <th className="px-6 py-4">Phòng</th>
                                    <th className="px-6 py-4">Người thuê</th>
                                    <th className="px-6 py-4">Thời hạn</th>
                                    <th className="px-6 py-4">Đề xuất giá</th>
                                    <th className="px-6 py-4">Lời nhắn</th>
                                    <th className="px-6 py-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pendingRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            Không có yêu cầu nào đang chờ.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {request.room?.number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-white">
                                                        {request.tenant?.firstName} {request.tenant?.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{request.tenant?.email}</p>
                                                    <p className="text-xs text-slate-500">{request.tenant?.phoneNumber}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                <p>Từ: {new Date(request.startDate).toLocaleDateString('vi-VN')}</p>
                                                <p>Đến: {new Date(request.endDate).toLocaleDateString('vi-VN')}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                <p>Thuê: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.monthlyRent)}</p>
                                                <p>Cọc: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.deposit)}</p>
                                            </td>
                                            <td className="px-6 py-4 italic text-slate-400">
                                                {request.message || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(request.id, 'approve')}
                                                        disabled={processingId === request.id}
                                                        className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(request.id, 'reject')}
                                                        disabled={processingId === request.id}
                                                        className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Lịch sử ({otherRequests.length})</h2>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-sm backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-white/5 text-xs font-bold uppercase text-slate-300">
                                <tr>
                                    <th className="px-6 py-4">Phòng</th>
                                    <th className="px-6 py-4">Người thuê</th>
                                    <th className="px-6 py-4">Ngày gửi</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {otherRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            Chưa có lịch sử yêu cầu.
                                        </td>
                                    </tr>
                                ) : (
                                    otherRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {request.room?.number}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {request.tenant?.firstName} {request.tenant?.lastName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${request.status === 'APPROVED'
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                    : request.status === 'REJECTED'
                                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                    }`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {request.responseMessage || "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
