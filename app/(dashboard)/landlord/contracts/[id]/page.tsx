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

export default function ContractDetailPage() {
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
      router.push("/landlord/contracts");
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

  const handleTerminate = async () => {
    if (!confirm("Bạn có chắc chắn muốn kết thúc hợp đồng này? Hành động này không thể hoàn tác.")) return;
    try {
      setActionLoading(true);
      await contractService.terminateContract(contractId);
      push({ title: "Thành công", description: "Đã kết thúc hợp đồng", type: "success" });
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
        <button onClick={() => router.push("/landlord/contracts")} className="text-indigo-400 hover:text-indigo-300 transition-colors">Quay lại danh sách</button>
      </div>
    );
  }

  const statusConfig = {
    ACTIVE: { label: "Đang hoạt động", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
    PENDING_TENANT: { label: "Chờ người thuê duyệt", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock },
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
            <button onClick={() => router.push("/landlord/contracts")} className="flex items-center gap-1 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Hợp đồng
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-8">
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
                Chủ nhà cần chờ Khách thuê đăng nhập và nhấn "Duyệt" hợp đồng này.
              </div>
            )}
          </div>

          {/* Detailed Content */}
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

            {/* Tenant Info Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-4 border-b border-white/5 pb-3">
                <User className="h-5 w-5" /> Thông tin Người thuê
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs">ID Người thuê</span>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase tracking-tighter">
                      {contract.tenantId?.slice(0, 2) || "U"}
                    </div>
                    <span className="text-white font-medium text-sm truncate">{contract.tenantId}</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 italic">Lưu ý</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Thông tin cá nhân cụ thể của người thuê sẽ chỉ hiện trên file PDF chính thức để bảo bảo an ninh dữ liệu.
                  </p>
                </div>
              </div>
            </div>

            {/* Timelines Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl md:col-span-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-6 border-b border-white/5 pb-3">
                <Calendar className="h-5 w-5" /> Chu kỳ & Thời hạn
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    Ngày bắt đầu
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {new Date(contract.startDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center justify-center pt-6">
                  <div className="w-full h-[1px] bg-gradient-to-r from-emerald-500/50 to-rose-500/50 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-white/10 px-3 py-0.5 rounded-full text-[10px] text-slate-400 font-bold whitespace-nowrap">
                      {Math.round((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} tháng
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium justify-end">
                    Hết hạn
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {new Date(contract.endDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="flex gap-3">
                  <div className="rounded-xl bg-indigo-500/10 p-2 h-fit">
                    <Clock className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Kỳ thanh toán</div>
                    <div className="text-sm font-bold text-slate-200">{contract.paymentCycleMonths} tháng / lần</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-xl bg-amber-500/10 p-2 h-fit">
                    <Calendar className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ngày đóng tiền</div>
                    <div className="text-sm font-bold text-slate-200">Mùng {contract.paymentDay} hằng tháng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-8">
          {/* Financials Card */}
          <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="relative space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-tight uppercase text-xs">
                <DollarSign className="h-4 w-4" /> Tài chính hợp đồng
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-xs font-medium">Giá thuê hằng tháng</div>
                <div className="text-3xl font-black text-white tracking-tighter">
                  {contract.monthlyRent?.toLocaleString()}
                  <span className="text-sm font-normal text-slate-500 ml-1">VNĐ</span>
                </div>
              </div>

              <div className="h-[1px] w-full bg-indigo-500/20"></div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> Tiền cọc
                  </div>
                  <div className="text-white font-bold">{contract.deposit?.toLocaleString()} đ</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Mức cọc (tháng)</span>
                  <span className="text-white font-medium">{contract.depositMonths}T</span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/landlord/contracts`)}
                className="w-full mt-4 rounded-2xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-400 hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Danh sách thu
              </button>
            </div>
          </div>

          {/* Services Costs Card */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-4 border-b border-white/5 pb-3 uppercase text-xs tracking-widest">
              <Settings className="h-4 w-4" /> Chi phí dịch vụ
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, label: "Điện", value: contract.electricityCostPerKwh, unit: "đ/kWh", color: "text-amber-400" },
                { icon: Droplets, label: "Nước", value: contract.waterCostPerCubicMeter, unit: "đ/m³", color: "text-blue-400" },
                { icon: Wifi, label: "Internet", value: contract.internetCost, unit: "đ/tháng", color: "text-indigo-400" },
                { icon: Car, label: "Gửi xe", value: contract.parkingCost, unit: "đ/tháng", color: "text-emerald-400" },
              ].map((item, i) => item.value ? (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl bg-white/5 p-2 ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-slate-400 text-sm">{item.label}</span>
                  </div>
                  <div className="text-slate-200 font-bold text-sm">
                    {item.value.toLocaleString()} <span className="text-[10px] text-zinc-500 font-normal">{item.unit}</span>
                  </div>
                </div>
              ) : null)}

              {contract.serviceFee && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <span className="text-slate-400 text-sm font-medium">Phí dịch vụ khác</span>
                  <span className="text-indigo-400 font-bold">{contract.serviceFee.toLocaleString()} đ</span>
                </div>
              )}
            </div>
          </div>

          {/* Extra Info Card */}
          {contract.specialTerms && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-widest">
                <AlertCircle className="h-4 w-4 text-rose-400" /> Điều khoản bổ sung
              </div>
              <div className="rounded-2xl bg-white/5 p-4 text-xs text-slate-400 leading-relaxed italic border border-white/5">
                "{contract.specialTerms}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Content View (Secondary) */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/10 p-2">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Văn bản Hợp đồng</h2>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group"
          >
            Tải xuống phiên bản in ấn (PDF)
            <Download className="h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto rounded-2xl bg-black/40 p-6 sm:p-10 font-serif leading-relaxed text-sm text-slate-300/80 border border-white/5 shadow-inner scrollbar-thin scrollbar-thumb-white/10">
          <pre className="whitespace-pre-wrap font-serif">
            {contract.documentContent || "Dữ liệu hợp đồng đang được xử lý..."}
          </pre>
        </div>

        <div className="text-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] pt-4">
          *** Đây là bản sao lưu điện tử của hợp đồng mã {contract.id} ***
        </div>
      </div>
    </div>
  );
}
