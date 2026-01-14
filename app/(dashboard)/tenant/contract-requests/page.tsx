"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { contractService } from "../../../../lib/services/contracts";
import { useAuthStore } from "../../../../store/authStore";
import { useToast } from "../../../../components/providers/ToastProvider";
import Link from "next/link";
import {
    Clock,
    FileText,
    ArrowRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Home,
    Calendar,
    DollarSign,
    Download,
    Info,
    ShieldCheck
} from "lucide-react";
import type { Contract } from "../../../../types";

const StatusBadge = ({ status, type = "request" }: { status: string, type?: "request" | "contract" }) => {
    const config: any = type === "request" ? {
        PENDING: { label: "Đang chờ", icon: Clock, style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        APPROVED: { label: "Đã chấp nhận", icon: CheckCircle2, style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
        REJECTED: { label: "Từ chối", icon: XCircle, style: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
        CANCELLED: { label: "Đã hủy", icon: AlertCircle, style: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    } : {
        PENDING_TENANT: { label: "Chờ bạn ký", icon: FileText, style: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
        ACTIVE: { label: "Đã ký kết", icon: CheckCircle2, style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    };

    const current = config[status] || { label: status, icon: Info, style: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
    const Icon = current.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${current.style}`}>
            <Icon className="h-3 w-3" />
            {current.label}
        </span>
    );
};

export default function TenantContractRequestsPage() {
    const { user } = useAuthStore();
    const { push } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [pendingContracts, setPendingContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const reqsData = await api.get<any[]>("/api/v1/contract-requests");
            setRequests(reqsData);

            const contractsData = await contractService.listContracts(1, 100);
            const allContracts = Array.isArray(contractsData) ? contractsData : (contractsData.data || []);

            const filtered = allContracts.filter((c: any) =>
                c.status === "PENDING_TENANT" && c.tenant?.email === user.email
            );
            setPendingContracts(filtered);
        } catch (error) {
            console.error("Error fetching data:", error);
            push({ title: "Lỗi", description: "Không thể tải dữ liệu", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleApproveContract = async (id: string) => {
        if (!confirm("Bạn đồng ý ký kết bản hợp đồng này?")) return;
        try {
            setActionLoading(id);
            await contractService.approveContract(id);
            push({ title: "Thành công", description: "Hợp đồng đã được ký kết và có hiệu lực", type: "success" });
            fetchData(); 
        } catch (err) {
            push({ title: "Lỗi", description: "Không thể ký hợp đồng", type: "error" });
        } finally {
            setActionLoading(null);
        }
    };

    const downloadPDF = async (id: string) => {
        try {
            await contractService.downloadContract(id);
        } catch (err) {
            push({ title: "Lỗi", description: "Không thể tải bản PDF", type: "error" });
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500"></div>
                <div className="text-slate-400 font-medium animate-pulse">Đang tải yêu cầu...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        Quản lý Yêu cầu
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">Xem các yêu cầu thuê phòng và hợp đồng đang chờ ký kết</p>
                </div>
                <Link
                    href="/rooms"
                    className="flex h-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all group"
                >
                    Tìm thêm phòng <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* SECTION 1: CONTRACTS WAITING SIGNATURE (FROM LANDLORD) */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="rounded-lg bg-indigo-500/10 p-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Hợp đồng chờ ký kết</h2>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-white/10">
                        {pendingContracts.length}
                    </span>
                </div>

                {pendingContracts.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center bg-slate-900/20">
                        <div className="text-slate-600 mb-2 font-medium">Bạn chưa có bản hợp đồng nào cần ký</div>
                        <p className="text-xs text-slate-500 italic">Khi chủ nhà soạn hợp đồng, bản thảo sẽ xuất hiện tại đây.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {pendingContracts.map((contract) => (
                            <div key={contract.id} className="group relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 backdrop-blur-xl transition-all hover:border-indigo-500/40">
                                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>

                                <div className="relative flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-2xl bg-indigo-500/20 p-3">
                                                    <Home className="h-6 w-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Hợp đồng thuê {contract.type === "ROOM" ? `phòng ${contract.roomId}` : "nhà trọ"}</h3>
                                                    <p className="text-xs text-slate-400">{contract.type === "ROOM" ? "Phòng trọ" : "Nhà trọ"}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status="PENDING_TENANT" type="contract" />
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="space-y-1">
                                                <span className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider"><Calendar className="h-3 w-3" /> Ngày bắt đầu</span>
                                                <div className="text-sm font-bold text-slate-200">{new Date(contract.startDate).toLocaleDateString("vi-VN")}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider"><Clock className="h-3 w-3" /> Thời hạn</span>
                                                <div className="text-sm font-bold text-slate-200">12 tháng</div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider"><DollarSign className="h-3 w-3" /> Giá thuê</span>
                                                <div className="text-sm font-bold text-indigo-400">{contract.monthlyRent?.toLocaleString()}đ/tháng</div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider"><AlertCircle className="h-3 w-3" /> Tiền cọc</span>
                                                <div className="text-sm font-bold text-slate-200">{contract.deposit?.toLocaleString()}đ</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px] justify-center">
                                        <button
                                            onClick={() => handleApproveContract(contract.id)}
                                            disabled={!!actionLoading}
                                            className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                        >
                                            {actionLoading === contract.id ? "Đang xử lý..." : "KÝ KẾT NGAY"}
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => downloadPDF(contract.id)}
                                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                <Download className="h-3.5 w-3.5" /> PDF
                                            </button>
                                            <button
                                                className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all text-center"
                                                onClick={() => {
                                                    alert("Vui lòng tải bản PDF hoặc liên hệ chủ nhà để xem nội dung chi tiết.");
                                                }}
                                            >
                                                Xem nội dung
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* SECTION 2: RENTAL REQUESTS (SENT BY TENANT) */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="rounded-lg bg-blue-500/10 p-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Yêu cầu thuê phòng đã gửi</h2>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-white/10">
                        {requests.length}
                    </span>
                </div>

                {requests.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-500 bg-slate-900/20">
                        <div className="text-4xl mb-4">📄</div>
                        <p>Bạn chưa gửi yêu cầu thuê phòng nào</p>
                        <Link href="/rooms" className="mt-4 inline-block text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                            Tìm phòng ngay →
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all hover:bg-slate-900/80"
                            >
                                <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-blue-500/5 blur-2xl"></div>

                                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-lg font-bold text-white">
                                                Phòng {request.room?.number || "Hợp đồng"}
                                            </h3>
                                            <StatusBadge status={request.status} />
                                        </div>

                                        <div className="text-sm text-slate-400 flex items-center gap-1.5 font-medium">
                                            <span className="text-blue-500">📍</span> {request.motel?.name} - {request.motel?.address}
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Dự kiến b.đầu</span>
                                                <div className="text-sm font-bold text-slate-300">
                                                    {new Date(request.startDate).toLocaleDateString("vi-VN")}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Dự kiến kết thúc</span>
                                                <div className="text-sm font-bold text-slate-300">
                                                    {new Date(request.endDate).toLocaleDateString("vi-VN")}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Giá thỏa thuận</span>
                                                <div className="text-sm font-bold text-blue-400">
                                                    {request.monthlyRent?.toLocaleString()}đ
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Đã gửi vào</span>
                                                <div className="text-sm font-bold text-slate-500">
                                                    {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                                                </div>
                                            </div>
                                        </div>

                                        {request.responseMessage && (
                                            <div className="mt-4 rounded-2xl bg-white/5 border border-white/5 p-4 italic text-sm text-slate-400 flex gap-3 items-start">
                                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <Info className="h-4 w-4 text-blue-400" />
                                                </div>
                                                <p><span className="font-bold text-slate-200 not-italic">Lưu ý từ chủ nhà: </span>"{request.responseMessage}"</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        <Link
                                            href={`/rooms/${request.roomId}`}
                                            className="w-full text-center rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                        >
                                            Xem phòng
                                        </Link>
                                        {request.status === 'PENDING' && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Bạn có chắc chắn muốn hủy yêu cầu này?")) return;
                                                    try {
                                                        await api.patch(`/api/v1/contract-requests/${request.id}/cancel`);
                                                        push({ title: "Đã hủy yêu cầu", type: "success" });
                                                        fetchData();
                                                    } catch (error) {
                                                        push({ title: "Lỗi", description: "Không thể hủy yêu cầu", type: "error" });
                                                    }
                                                }}
                                                className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
                                            >
                                                Hủy yêu cầu
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
