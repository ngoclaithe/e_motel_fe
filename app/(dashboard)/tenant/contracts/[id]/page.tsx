"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "../../../../../components/providers/ToastProvider";
import { contractService } from "../../../../../lib/services";
import type { Contract } from "../../../../../types";
import {
    ArrowLeft,
    Download,
    Calendar,
    DollarSign,
    Home,
    User,
    FileText,
    ShieldCheck,
    Clock,
    Ban,
    CheckCircle2,
    AlertCircle,
    Hash,
    Activity,
    Zap,
    Droplets,
    Wifi,
    Car,
    Settings
} from "lucide-react";

export default function TenantContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { push } = useToast();
    const contractId = params.id as string;

    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loadContract = async () => {
        try {
            const data = await contractService.getContract(contractId);
            setContract(data);
        } catch (err) {
            console.error("Failed to load contract:", err);
            push({ title: "Lỗi", description: "Không thể tải hợp đồng", type: "error" });
            router.push("/contracts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contractId) {
            loadContract();
        }
    }, [contractId]);

    const handleDownloadPDF = async () => {
        try {
            setActionLoading(true);
            await contractService.downloadContract(contractId);
            push({ title: "Thành công", description: "Đang tải xuống bản PDF", type: "success" });
        } catch (err) {
            push({ title: "Lỗi", description: "Không thể tải bản PDF", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm("Bạn đồng ý ký kết hợp đồng này? Sau khi ký, hợp đồng sẽ có hiệu lực ngay lập tức.")) return;
        try {
            setActionLoading(true);
            await contractService.approveContract(contractId);
            push({ title: "Thành công", description: "Đã ký kết hợp đồng", type: "success" });
            loadContract();
        } catch (err) {
            push({ title: "Lỗi", description: "Không thể ký hợp đồng", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleTerminate = async () => {
        if (!confirm("Bạn có chắc chắn muốn kết thúc hợp đồng này? Hành động này không thể hoàn tác.")) return;
        try {
            setActionLoading(true);
            await contractService.terminateContract(contractId);
            push({ title: "Thành công", description: "Đã gửi yêu cầu kết thúc hợp đồng", type: "success" });
            loadContract();
        } catch (err) {
            push({ title: "Lỗi", description: "Không thể kết thúc hợp đồng", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
                <div className="text-slate-400 animate-pulse font-medium">Đang tải dữ liệu hợp đồng...</div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <AlertCircle className="h-12 w-12 text-slate-500" />
                <div className="text-zinc-500 font-medium">Không tìm thấy hợp đồng</div>
                <button onClick={() => router.push("/contracts")} className="text-indigo-400 hover:text-indigo-300 transition-colors">Quay lại danh sách</button>
            </div>
        );
    }

    const statusConfig = {
        ACTIVE: { label: "Đang hoạt động", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
        PENDING_TENANT: { label: "Chờ bạn ký kết", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock },
        TERMINATED: { label: "Đã kết thúc", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: Ban },
        EXPIRED: { label: "Hết hạn", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: AlertCircle },
    };

    const currentStatus = statusConfig[contract.status as keyof typeof statusConfig] || { label: contract.status, color: "text-slate-400", bg: "bg-white/5", border: "border-white/10", icon: Activity };
    const StatusIcon = currentStatus.icon;

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-12">
            {/* Header section */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <button onClick={() => router.push("/contracts")} className="flex items-center gap-1 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Hợp đồng của tôi
                        </button>
                        <span>/</span>
                        <span className="text-slate-500 font-mono text-xs uppercase">{contract.id.slice(0, 8)}...</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="h-8 w-8 text-indigo-500" />
                        Chi tiết Hợp đồng
                    </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={actionLoading}
                        className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 transition-all disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        Tải PDF
                    </button>

                    {contract.status === "PENDING_TENANT" && (
                        <button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Ký kết hợp đồng
                        </button>
                    )}

                    {contract.status === "ACTIVE" && (
                        <button
                            onClick={handleTerminate}
                            disabled={actionLoading}
                            className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-50"
                        >
                            <Ban className="h-4 w-4" />
                            Kết thúc Hợp đồng
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {/* Main Info - Full Width */}
                <div className="space-y-8">
                    {/* Status Banner */}
                    <div className={`flex items-center justify-between rounded-3xl border ${currentStatus.border} ${currentStatus.bg} p-6 backdrop-blur-xl`}>
                        <div className="flex items-center gap-4">
                            <div className={`rounded-2xl ${currentStatus.bg} p-3`}>
                                <StatusIcon className={`h-8 w-8 ${currentStatus.color}`} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-400">Trạng thái hiện tại</div>
                                <div className={`text-xl font-bold ${currentStatus.color}`}>{currentStatus.label}</div>
                            </div>
                        </div>
                        {contract.status === "PENDING_TENANT" && (
                            <div className="hidden md:block max-w-[200px] text-right text-xs text-amber-300/60 font-medium italic">
                                Vui lòng xem kỹ nội dung hợp đồng và nhấn "Ký kết" để xác nhận.
                            </div>
                        )}
                    </div>

                    {/* Detailed Content - Same as Landlord but adjusted */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Asset Info Card */}
                        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-4 border-b border-white/5 pb-3">
                                <Home className="h-5 w-5" /> Đối tượng thuê
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-400 text-sm">Loại hình</span>
                                    <span className="text-white font-medium bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                        {contract.type === "ROOM" ? "Phòng trọ" : "Toàn bộ nhà"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">ID {contract.type === "ROOM" ? "Phòng" : "Nhà trọ"}</span>
                                    <span className="text-slate-200 font-mono text-sm">{contract.type === "ROOM" ? contract.roomId : contract.motelId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Sức chứa tối đa</span>
                                    <span className="text-slate-200 font-medium">{contract.maxOccupants ?? 2} người</span>
                                </div>
                            </div>
                        </div>

                        {/* Tenant Info Card - Placeholder for privacy */}
                        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-4 border-b border-white/5 pb-3">
                                <User className="h-5 w-5" /> Thông tin Chủ nhà
                            </div>
                            <div className="space-y-4">
                                <div className="text-xs text-slate-500 italic bg-white/5 p-3 rounded-lg border border-white/5">
                                    Thông tin liên hệ chủ nhà được bảo mật. Vui lòng xem trong bản PDF chính thức.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Financial Info - Same structure as Landlord */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-2 text-green-400 font-semibold mb-4 border-b border-white/5 pb-3">
                                <Calendar className="h-5 w-5" /> Thời gian
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Ngày bắt đầu</span>
                                    <span className="text-slate-200 font-medium">{new Date(contract.startDate).toLocaleDateString("vi-VN")}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Ngày kết thúc</span>
                                    <span className="text-slate-200 font-medium">{new Date(contract.endDate).toLocaleDateString("vi-VN")}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Kỳ thanh toán</span>
                                    <span className="text-slate-200 font-medium">{contract.paymentCycleMonths} tháng</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Ngày thanh toán</span>
                                    <span className="text-slate-200 font-medium">Ngày {contract.paymentDay}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-4 border-b border-white/5 pb-3">
                                <DollarSign className="h-5 w-5" /> Tài chính
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Giá thuê/tháng</span>
                                    <span className="text-yellow-400 font-bold text-lg">{contract.monthlyRent?.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Tiền cọc</span>
                                    <span className="text-slate-200 font-medium">{contract.deposit?.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Cọc tính theo</span>
                                    <span className="text-slate-200 font-medium">{contract.depositMonths} tháng</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Costs */}
                    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-2 text-purple-400 font-semibold mb-4 border-b border-white/5 pb-3">
                            <Settings className="h-5 w-5" /> Chi phí dịch vụ
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {contract.electricityCostPerKwh && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Zap className="h-3.5 w-3.5" /> Điện
                                    </div>
                                    <div className="text-slate-200 font-medium">{contract.electricityCostPerKwh.toLocaleString()}đ/kWh</div>
                                </div>
                            )}
                            {contract.waterCostPerCubicMeter && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Droplets className="h-3.5 w-3.5" /> Nước
                                    </div>
                                    <div className="text-slate-200 font-medium">{contract.waterCostPerCubicMeter.toLocaleString()}đ/m³</div>
                                </div>
                            )}
                            {contract.internetCost && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Wifi className="h-3.5 w-3.5" /> Internet
                                    </div>
                                    <div className="text-slate-200 font-medium">{contract.internetCost.toLocaleString()}đ/tháng</div>
                                </div>
                            )}
                            {contract.parkingCost && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Car className="h-3.5 w-3.5" /> Gửi xe
                                    </div>
                                    <div className="text-slate-200 font-medium">{contract.parkingCost.toLocaleString()}đ/tháng</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Special Terms */}
                    {contract.specialTerms && (
                        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
                            <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2 border-b border-white/5 pb-3">
                                <AlertCircle className="h-5 w-5" /> Điều khoản đặc biệt
                            </div>
                            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5">
                                {contract.specialTerms}
                            </div>
                        </div>
                    )}

                    {/* Document Content - Full Width */}
                    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-4 border-b border-white/5 pb-3">
                            <FileText className="h-5 w-5" /> Nội dung hợp đồng
                        </div>
                        <div className="max-h-[800px] overflow-y-auto rounded-xl bg-black/20 p-6 text-sm text-slate-400 font-mono leading-relaxed border border-white/5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {contract.documentContent || "Nội dung hợp đồng sẽ được hiển thị tại đây..."}
                        </div>
                        <div className="text-xs text-slate-500 italic text-center pt-2">
                            Đây là bản xem trước. Vui lòng tải PDF để có bản chính thức.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
