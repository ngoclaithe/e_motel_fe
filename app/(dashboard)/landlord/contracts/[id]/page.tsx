"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "../../../../../components/providers/ToastProvider";
import { contractService } from "../../../../../lib/services";
import type { Contract } from "../../../../../types";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { push } = useToast();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    if (contractId) {
      loadContract();
    }
  }, [contractId, push, router]);

  const downloadPDF = () => {
    if (!contract || !contract.documentContent) return;

    const element = document.createElement("a");
    const file = new Blob([contract.documentContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `contract-${contract.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    push({ title: "Đã tải xuống", type: "success" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-600 dark:text-zinc-400">Đang tải...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
        Không tìm thấy hợp đồng
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chi tiết hợp đồng</h1>
        <button
          onClick={() => router.push("/landlord/contracts")}
          className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          Quay lại
        </button>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">Loại hợp đồng</div>
            <div className="text-lg font-semibold">
              {contract.type === "ROOM" ? "Hợp đồng thuê phòng" : "Hợp đồng thuê nhà trọ"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500">Mã hợp đồng</div>
            <div className="font-mono text-sm font-medium">{contract.id}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 font-semibold">Thông tin cơ bản</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div>
                <div className="text-sm text-zinc-500">
                  {contract.type === "ROOM" ? "Phòng" : "Nhà trọ"}
                </div>
                <div className="mt-1 font-medium">
                  {contract.type === "ROOM" ? contract.roomId : contract.motelId}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Người thuê</div>
                <div className="mt-1 font-medium">{contract.tenantId}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Trạng thái</div>
                <div className="mt-1">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {contract.status || "Hoạt động"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/15">
            <h2 className="mb-4 font-semibold">Thời hạn hợp đồng</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div>
                <div className="text-sm text-zinc-500">Từ ngày</div>
                <div className="mt-1 font-medium">
                  {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Đến ngày</div>
                <div className="mt-1 font-medium">
                  {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Thời gian</div>
                <div className="mt-1 font-medium">
                  {Math.round(
                    (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) /
                    (1000 * 60 * 60 * 24 * 30)
                  )}{" "}
                  tháng
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/15">
            <h2 className="mb-4 font-semibold">Giá thuê và cọc</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div>
                <div className="text-sm text-zinc-500">Giá thuê/tháng</div>
                <div className="mt-1 font-medium">{contract.monthlyRent?.toLocaleString()}đ</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Tiền cọc</div>
                <div className="mt-1 font-medium">{contract.deposit?.toLocaleString()}đ</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Cọc tính theo</div>
                <div className="mt-1 font-medium">{contract.depositMonths} tháng</div>
              </div>
            </div>
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/15">
            <h2 className="mb-4 font-semibold">Thanh toán</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div>
                <div className="text-sm text-zinc-500">Kỳ thanh toán</div>
                <div className="mt-1 font-medium">{contract.paymentCycleMonths} tháng</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Ngày thanh toán</div>
                <div className="mt-1 font-medium">Ngày {contract.paymentDay}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-black/10 pt-6 dark:border-white/15">
            <h2 className="mb-4 font-semibold">Chi phí dịch vụ</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {contract.electricityCostPerKwh && (
                <div>
                  <div className="text-sm text-zinc-500">Điện</div>
                  <div className="mt-1 font-medium">
                    {contract.electricityCostPerKwh.toLocaleString()}đ/kWh
                  </div>
                </div>
              )}
              {contract.waterCostPerCubicMeter && (
                <div>
                  <div className="text-sm text-zinc-500">Nước</div>
                  <div className="mt-1 font-medium">
                    {contract.waterCostPerCubicMeter.toLocaleString()}đ/m³
                  </div>
                </div>
              )}
              {contract.internetCost && (
                <div>
                  <div className="text-sm text-zinc-500">Internet</div>
                  <div className="mt-1 font-medium">{contract.internetCost.toLocaleString()}đ/tháng</div>
                </div>
              )}
              {contract.parkingCost && (
                <div>
                  <div className="text-sm text-zinc-500">Gửi xe</div>
                  <div className="mt-1 font-medium">{contract.parkingCost.toLocaleString()}đ/tháng</div>
                </div>
              )}
              {contract.serviceFee && (
                <div>
                  <div className="text-sm text-zinc-500">Phí dịch vụ</div>
                  <div className="mt-1 font-medium">{contract.serviceFee.toLocaleString()}đ/tháng</div>
                </div>
              )}
            </div>
          </div>

          {contract.type === "ROOM" && contract.maxOccupants && (
            <div className="border-t border-black/10 pt-6 dark:border-white/15">
              <h2 className="mb-4 font-semibold">Thông tin phòng</h2>
              <div>
                <div className="text-sm text-zinc-500">Số người tối đa</div>
                <div className="mt-1 font-medium">{contract.maxOccupants} người</div>
              </div>
            </div>
          )}

          {contract.specialTerms && (
            <div className="border-t border-black/10 pt-6 dark:border-white/15">
              <h2 className="mb-4 font-semibold">Điều khoản đặc biệt</h2>
              <div className="rounded-lg bg-black/5 p-4 text-sm dark:bg-white/5">
                {contract.specialTerms}
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.push("/landlord/contracts")}
          className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
}
