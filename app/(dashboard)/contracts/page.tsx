"use client";

import { useEffect, useState } from "react";
import type { Contract } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";
import { useAuth } from "../../../hooks/useAuth";
import { contractService } from "../../../lib/services/contracts";

export default function ContractsPage() {
  useEnsureRole(["tenant"]);
  const { push } = useToast();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await contractService.listContracts(1, 100);
        setContracts(response.data || []);
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

  const tenantContracts = contracts.filter((c) => c.tenantEmail === user?.email);

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

  const handleDeleteContract = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa hợp đồng này?")) return;

    try {
      await contractService.deleteContract(id);
      setContracts(contracts.filter(c => c.id !== id));
      setSelectedContract(null);
      push({ title: "Đã xóa hợp đồng", type: "success" });
    } catch (err) {
      console.error("Failed to delete contract:", err);
      push({ title: "Không thể xóa hợp đồng", type: "error" });
    }
  };

  const handleUpdateContract = async (id: string, updates: any) => {
    try {
      const updated = await contractService.updateContract(id, updates);
      setContracts(contracts.map(c => c.id === id ? updated : c));
      setSelectedContract(updated);
      push({ title: "Đã cập nhật hợp đồng", type: "success" });
    } catch (err) {
      console.error("Failed to update contract:", err);
      push({ title: "Không thể cập nhật hợp đồng", type: "error" });
    }
  };

  const handleGetContractDetail = async (id: string) => {
    try {
      const detail = await contractService.getContract(id);
      setSelectedContract(detail);
    } catch (err) {
      console.error("Failed to fetch contract detail:", err);
      push({ title: "Không thể lấy chi tiết hợp đồng", type: "error" });
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
Chủ trọ: ${contract.landlordEmail}
Người thuê: ${contract.tenantEmail}
Phòng: ${contract.roomId}
Thời gian thuê: ${new Date(contract.startDate).toLocaleDateString("vi-VN")} - ${new Date(contract.endDate).toLocaleDateString("vi-VN")}
Giá thuê: ${contract.monthlyPrice?.toLocaleString()}đ
Tiền cọc: ${contract.deposit?.toLocaleString()}đ
Kỳ thanh toán: ${contract.paymentPeriod}

GHI CHÚ
------
${contract.notes || "Không có ghi chú"}
    `.trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hợp đồng của tôi</h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-black/40">
          Đang tải...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tenantContracts.map((contract) => (
          <div
            key={contract.id}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-base font-semibold">{contract.roomId}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Chủ trọ: {contract.landlordEmail}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <span className="text-zinc-500">Từ ngày</span>
                    <div className="font-medium">
                      {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Đến ngày</span>
                    <div className="font-medium">
                      {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Giá thuê</span>
                    <div className="font-medium">{contract.monthlyPrice?.toLocaleString()}đ</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Tiền cọc</span>
                    <div className="font-medium">{contract.deposit?.toLocaleString()}đ</div>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {isExpired(contract.endDate) && (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Đã hết hạn
                  </span>
                )}
                {isExpiringSoon(contract.endDate) && !isExpired(contract.endDate) && (
                  <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Sắp hết hạn
                  </span>
                )}
                {!isExpired(contract.endDate) && !isExpiringSoon(contract.endDate) && (
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Còn hiệu lực
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleGetContractDetail(contract.id)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Xem chi tiết
              </button>
              <button
                onClick={() => downloadPDF(contract)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Tải PDF
              </button>
              <button
                onClick={() => handleDeleteContract(contract.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
          {tenantContracts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
              Chưa có hợp đồng nào
            </div>
          )}
        </div>
      )}

      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chi tiết hợp đồng</h2>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-2xl font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Mã hợp đồng</span>
                  <div className="font-medium">{selectedContract.id}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Ngày tạo</span>
                  <div className="font-medium">
                    {new Date(selectedContract.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Chủ trọ</span>
                  <div className="font-medium">{selectedContract.landlordEmail}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Người thuê</span>
                  <div className="font-medium">{selectedContract.tenantEmail}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Phòng</span>
                  <div className="font-medium">{selectedContract.roomId}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Kỳ thanh toán</span>
                  <div className="font-medium">{selectedContract.paymentPeriod}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Từ ngày</span>
                  <div className="font-medium">
                    {new Date(selectedContract.startDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500">Đến ngày</span>
                  <div className="font-medium">
                    {new Date(selectedContract.endDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Giá thuê (tháng)</span>
                  <div className="font-medium">{selectedContract.monthlyPrice?.toLocaleString()}đ</div>
                </div>
                <div>
                  <span className="text-zinc-500">Tiền cọc</span>
                  <div className="font-medium">{selectedContract.deposit?.toLocaleString()}đ</div>
                </div>
              </div>
              {selectedContract.notes && (
                <div>
                  <span className="text-zinc-500">Ghi chú</span>
                  <div className="mt-1 rounded-lg bg-black/5 p-3 text-sm dark:bg-white/5">
                    {selectedContract.notes}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedContract(null)}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  downloadPDF(selectedContract);
                  setSelectedContract(null);
                }}
                className="btn-primary"
              >
                Tải PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
