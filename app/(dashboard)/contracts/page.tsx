"use client";

import { useEffect, useState } from "react";
import type { Contract } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";
import { contractService } from "../../../lib/services/contracts";
import { useAuthStore } from "@/store/authStore";
import { Clock, Download, FileText, Calendar, DollarSign, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ContractsPage() {
  useEnsureRole(["TENANT"]);
  const { push } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userEmail = useAuthStore((state) => state.user?.email || "");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await contractService.listContracts(1, 100);
        console.log("📋 Contracts response:", response);
        const contractsData = Array.isArray(response) ? response : (response.data || []);
        console.log("📋 Contracts data:", contractsData);
        setContracts(contractsData);
      } catch (err) {
        console.error("Failed to fetch contracts:", err);
        setError("Không thể tải danh sách hợp đồng");
        setContracts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const tenantContracts = contracts.filter((c: any) => {
    const isMine = c.tenant?.email === userEmail;
    const isNotPending = c.status !== "PENDING_TENANT";
    return isMine && isNotPending;
  });

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysLeft = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 30;
  };

  const isExpired = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return end < now;
  };

  const handleTerminateContract = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn kết thúc hợp đồng này?")) return;

    try {
      await contractService.terminateContract(id);
      const response = await contractService.listContracts(1, 100);
      const contractsData = Array.isArray(response) ? response : (response.data || []);
      setContracts(contractsData);
      setSelectedContract(null);
      push({ title: "Đã gửi yêu cầu kết thúc", type: "success" });
    } catch (err) {
      console.error("Failed to terminate contract:", err);
      push({ title: "Không thể kết thúc hợp đồng", type: "error" });
    }
  };

  const downloadPDF = (contract: Contract) => {
    const element = document.createElement("a");
    const file = new Blob([generatePDFContent(contract)], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `contract-${contract.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    push({ title: "Đã tải xuống", type: "success" });
  };

  const generatePDFContent = (contract: Contract) => {
    return `
HỢP ĐỒNG THUÊ PHÒNG
================================
ID: ${contract.id}
Ngày tạo: ${new Date(contract.createdAt).toLocaleDateString("vi-VN")}

THÔNG TIN
--------


Phòng: ${contract.roomId}
Thời gian thuê: ${new Date(contract.startDate).toLocaleDateString("vi-VN")} - ${new Date(contract.endDate).toLocaleDateString("vi-VN")}
Giá thuê: ${contract.monthlyRent?.toLocaleString()}đ
Tiền cọc: ${contract.deposit?.toLocaleString()}đ
Kỳ thanh toán: ${contract.paymentCycleMonths} tháng

GHI CHÚ
------
${contract.specialTerms || "Không có ghi chú"}
    `.trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Hợp đồng của tôi</h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center text-sm text-slate-400 backdrop-blur-xl">
          Đang tải...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tenantContracts.map((contract) => (
            <div
              key={contract.id}
              className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-sm backdrop-blur-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-base font-semibold text-white">{contract.roomId}</div>
                  <div className="mt-1 text-sm text-slate-400">

                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div>
                      <span className="text-slate-500">Từ ngày</span>
                      <div className="font-medium text-slate-300">
                        {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Đến ngày</span>
                      <div className="font-medium text-slate-300">
                        {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Giá thuê</span>
                      <div className="font-medium text-slate-300">{contract.monthlyRent?.toLocaleString()}đ</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Tiền cọc</span>
                      <div className="font-medium text-slate-300">{contract.deposit?.toLocaleString()}đ</div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {contract.status === "PENDING_TENANT" && (
                      <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Chờ bạn duyệt
                      </span>
                    )}
                    {contract.status === "ACTIVE" && (
                      <span className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/20">
                        Còn hiệu lực
                      </span>
                    )}
                    {contract.status === "TERMINATED" && (
                      <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 border border-rose-500/20">
                        Đã kết thúc
                      </span>
                    )}
                  </div>
                  {isExpiringSoon(contract.endDate) && contract.status === "ACTIVE" && (
                    <span className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400 border border-yellow-500/20">
                      Sắp hết hạn
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/tenant/contracts/${contract.id}`}
                  className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
                >
                  Chi tiết
                </Link>
                <button
                  onClick={() => downloadPDF(contract)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Download className="h-3 w-3" /> Tải PDF
                </button>

                {contract.status === "PENDING_TENANT" && (
                  <button
                    onClick={async () => {
                      if (!confirm("Bạn đồng ý ký kết hợp đồng này?")) return;
                      try {
                        await contractService.approveContract(contract.id);
                        push({ title: "Thành công", description: "Đã duyệt hợp đồng", type: "success" });
                        const response = await contractService.listContracts(1, 100);
                        const contractsData = Array.isArray(response) ? response : (response.data || []);
                        setContracts(contractsData);
                      } catch (err) {
                        push({ title: "Lỗi", description: "Không thể duyệt hợp đồng", type: "error" });
                      }
                    }}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Ký kết hợp đồng
                  </button>
                )}

                {contract.status === "ACTIVE" && (
                  <button
                    onClick={async () => {
                      if (!confirm("Bạn muốn yêu cầu kết thúc hợp đồng này?")) return;
                      try {
                        await contractService.terminateContract(contract.id);
                        push({ title: "Thành công", description: "Đã gửi yêu cầu kết thúc", type: "success" });
                        const response = await contractService.listContracts(1, 100);
                        const contractsData = Array.isArray(response) ? response : (response.data || []);
                        setContracts(contractsData);
                      } catch (err) {
                        push({ title: "Lỗi", description: "Không thể thực hiện", type: "error" });
                      }
                    }}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    Kết thúc
                  </button>
                )}
              </div>
            </div>
          ))}
          {tenantContracts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              Chưa có hợp đồng nào
            </div>
          )}
        </div>
      )}

      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">Chi tiết hợp đồng</h2>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-2xl font-bold text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Mã hợp đồng</span>
                  <div className="font-medium text-slate-300">{selectedContract.id}</div>
                </div>
                <div>
                  <span className="text-slate-500">Ngày tạo</span>
                  <div className="font-medium text-slate-300">
                    {new Date(selectedContract.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Chủ trọ</span>
                </div>
                <div>
                  <span className="text-slate-500">Người thuê</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Phòng</span>
                  <div className="font-medium text-slate-300">{selectedContract.roomId}</div>
                </div>
                <div>
                  <span className="text-slate-500">Kỳ thanh toán</span>
                  <div className="font-medium text-slate-300">{selectedContract.paymentCycleMonths} tháng</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Từ ngày</span>
                  <div className="font-medium text-slate-300">
                    {new Date(selectedContract.startDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Đến ngày</span>
                  <div className="font-medium text-slate-300">
                    {new Date(selectedContract.endDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Giá thuê (tháng)</span>
                  <div className="font-medium text-slate-300">{selectedContract.monthlyRent?.toLocaleString()}đ</div>
                </div>
                <div>
                  <span className="text-slate-500">Tiền cọc</span>
                  <div className="font-medium text-slate-300">{selectedContract.deposit?.toLocaleString()}đ</div>
                </div>
              </div>
              {selectedContract.specialTerms && (
                <div>
                  <span className="text-slate-500">Ghi chú</span>
                  <div className="mt-1 rounded-lg bg-black/20 p-3 text-sm text-slate-300 border border-white/10">
                    {selectedContract.specialTerms}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between gap-2 pt-4 border-t border-white/10">
              {selectedContract.status === "ACTIVE" && (
                <button
                  onClick={() => handleTerminateContract(selectedContract.id)}
                  className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  Kết thúc hợp đồng
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedContract(null)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    downloadPDF(selectedContract);
                    setSelectedContract(null);
                  }}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all"
                >
                  Tải PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
