"use client";

import { useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import type { Bill } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";

export default function BillsPage() {
  useEnsureRole(["tenant"]);
  const { push } = useToast();
  const [bills] = useLocalStorage<Bill[]>("emotel_bills", []);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const getTenantBills = () => {
    try {
      const session = JSON.parse(localStorage.getItem("emotel_session") || "null");
      if (!session?.email) return [];
      return bills.filter((b) => b.tenantEmail === session.email);
    } catch {
      return [];
    }
  };

  const tenantBills = getTenantBills().sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  const isPaid = (status: string) => status === "paid";
  const isOverdue = (dueDate: string, status: string) => {
    if (status === "paid") return false;
    return new Date(dueDate) < new Date();
  };

  const getTotalUnpaid = () => {
    return tenantBills.filter((b) => b.status === "unpaid").reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  };

  const pay = () => {
    push({ title: "Đang xử lý thanh toán", description: "Hóa đơn sẽ được cập nhật sau khi thanh toán", type: "info" });
    setSelectedBill(null);
  };

  const downloadPDF = (bill: Bill) => {
    const element = document.createElement("a");
    const file = new Blob([generatePDFContent(bill)], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `bill-${bill.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    push({ title: "Đã tải xuống", type: "success" });
  };

  const generatePDFContent = (bill: Bill) => {
    return `
HÓA ĐƠN THANH TOÁN
================================
ID: ${bill.id}
Ngày tạo: ${new Date(bill.createdAt).toLocaleDateString("vi-VN")}

THÔNG TIN CHUNG
-----------
Chủ trọ: ${bill.landlordEmail}
Người thuê: ${bill.tenantEmail}
Phòng: ${bill.roomId}
Tháng: ${bill.month}/${bill.year}
Hạn thanh toán: ${new Date(bill.dueDate).toLocaleDateString("vi-VN")}

CHI TIẾT
------
Tiền phòng: ${bill.roomPrice?.toLocaleString()}đ
Tiền điện (${bill.electricityUsage} kWh): ${bill.electricityPrice?.toLocaleString()}đ
Tiền nước (${bill.waterUsage} m³): ${bill.waterPrice?.toLocaleString()}đ
Phí khác: ${bill.otherFees?.toLocaleString() || "0"}đ

CỘNG: ${bill.totalAmount?.toLocaleString()}đ

TRẠNG THÁI: ${bill.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
    `.trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hóa đơn</h1>
      </div>

      {getTotalUnpaid() > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <div className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
            Còn nợ: {getTotalUnpaid().toLocaleString()}đ
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tenantBills.map((bill) => (
          <div
            key={bill.id}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Tháng {bill.month}/{bill.year}
                </div>
                <div className="mt-1 text-xl font-semibold">{bill.totalAmount?.toLocaleString()}đ</div>
                <div className="mt-2 text-xs text-zinc-500">
                  Hạn: {new Date(bill.dueDate).toLocaleDateString("vi-VN")}
                </div>
              </div>
              <div>
                {isPaid(bill.status) && (
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Đã thanh toán
                  </span>
                )}
                {isOverdue(bill.dueDate, bill.status) && (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Quá hạn
                  </span>
                )}
                {!isPaid(bill.status) && !isOverdue(bill.dueDate, bill.status) && (
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Chưa thanh toán
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSelectedBill(bill)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Chi tiết
              </button>
              {bill.status === "unpaid" && (
                <button
                  onClick={() => pay(bill)}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Thanh toán
                </button>
              )}
              <button
                onClick={() => downloadPDF(bill)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Tải PDF
              </button>
            </div>
          </div>
        ))}
        {tenantBills.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
            Chưa có hóa đơn nào
          </div>
        )}
      </div>

      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chi tiết hóa đơn</h2>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-2xl font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Mã hóa đơn</span>
                  <div className="font-medium">{selectedBill.id}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Tháng / Năm</span>
                  <div className="font-medium">
                    {selectedBill.month}/{selectedBill.year}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Phòng</span>
                  <div className="font-medium">{selectedBill.roomId}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Hạn thanh toán</span>
                  <div className="font-medium">
                    {new Date(selectedBill.dueDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                <div className="mb-3 font-medium">Chi tiết thanh toán</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Tiền phòng</span>
                    <span>{selectedBill.roomPrice?.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Điện ({selectedBill.electricityUsage} kWh)</span>
                    <span>{selectedBill.electricityPrice?.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nước ({selectedBill.waterUsage} m³)</span>
                    <span>{selectedBill.waterPrice?.toLocaleString()}đ</span>
                  </div>
                  {selectedBill.otherFees && selectedBill.otherFees > 0 && (
                    <div className="flex justify-between">
                      <span>Phí khác</span>
                      <span>{selectedBill.otherFees?.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="border-t border-black/10 pt-2 font-medium dark:border-white/10">
                    <div className="flex justify-between">
                      <span>Cộng</span>
                      <span>{selectedBill.totalAmount?.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-zinc-500">Trạng thái</span>
                <div className="mt-1">
                  {isPaid(selectedBill.status) && (
                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Đã thanh toán
                    </span>
                  )}
                  {isOverdue(selectedBill.dueDate, selectedBill.status) && (
                    <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Quá hạn
                    </span>
                  )}
                  {!isPaid(selectedBill.status) && !isOverdue(selectedBill.dueDate, selectedBill.status) && (
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Chưa thanh toán
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBill(null)}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Đóng
              </button>
              {selectedBill.status === "unpaid" && (
                <button
                  onClick={() => {
                    pay(selectedBill);
                  }}
                  className="btn-primary"
                >
                  Thanh toán ngay
                </button>
              )}
              <button
                onClick={() => {
                  downloadPDF(selectedBill);
                  setSelectedBill(null);
                }}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
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
