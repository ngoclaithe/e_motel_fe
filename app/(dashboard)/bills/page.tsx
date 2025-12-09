"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";
import { billService } from "../../../lib/services";
import PaymentQR from "../../../components/PaymentQR";

export default function TenantBillsPage() {
  useEnsureRole(["TENANT"]);
  const { push } = useToast();

  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const userEmail = (() => {
    try {
      const session = JSON.parse(localStorage.getItem("emotel_session") || "null");
      return session?.email || "";
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const response = await billService.listBills(1, 100);
      const billsData = Array.isArray(response) ? response : (response.data || []);
      setBills(billsData);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      push({ title: "Không thể tải hóa đơn", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const tenantBills = bills.filter((b: any) => b.contract?.tenant?.email === userEmail);

  const getTotalUnpaid = () => {
    return tenantBills.filter((b: any) => !b.isPaid).reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
  };

  const handleShowPayment = (bill: any) => {
    // Debug logs
    console.log("=== DEBUG PAYMENT INFO ===");
    console.log("Full bill object:", bill);
    console.log("Contract:", bill.contract);
    console.log("Room:", bill.contract?.room);
    console.log("Motel:", bill.contract?.motel);

    // Get owner (landlord) from room or motel
    const landlord = bill.contract?.room?.owner || bill.contract?.motel?.owner;

    console.log("Bank info:", {
      bankName: landlord?.bankName,
      bankCode: landlord?.bankCode,
      bankAccountNumber: landlord?.bankAccountNumber,
    });

    if (!landlord?.bankName || !landlord?.bankCode || !landlord?.bankAccountNumber) {
      push({
        title: "Thông tin thanh toán chưa đầy đủ",
        description: "Chủ trọ chưa cập nhật thông tin ngân hàng",
        type: "error"
      });
      return;
    }

    setPaymentInfo({
      billId: bill.id,
      amount: bill.totalAmount,
      bankName: landlord.bankName,
      bankCode: landlord.bankCode,
      accountNumber: landlord.bankAccountNumber,
      landlordName: `${landlord.firstName || ""} ${landlord.lastName || ""}`.trim() || "Chủ trọ",
    });
    setShowPaymentQR(true);
  };

  const getContractInfo = (bill: any) => {
    const contract = bill.contract;
    if (!contract) return "N/A";
    return contract.room?.number || contract.motel?.name || "N/A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-6 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">
              Hóa Đơn
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Quản lý hóa đơn tiền phòng của bạn</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-white"></div>
          </div>
        ) : (
          <>
            {/* Unpaid Summary */}
            {getTotalUnpaid() > 0 && (
              <div className="group relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg shadow-amber-100/50 transition-all hover:shadow-xl dark:border-amber-900/30 dark:from-amber-950/30 dark:to-orange-950/30 dark:shadow-amber-900/20">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-amber-200/20 blur-2xl dark:bg-amber-800/20"></div>
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-2xl">
                      ⚠️
                    </div>
                    <div>
                      <div className="text-sm font-medium text-amber-900 dark:text-amber-200">Tổng còn nợ</div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{getTotalUnpaid().toLocaleString()}đ</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bills Grid */}
            {tenantBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 py-20 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/20">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-zinc-500">Chưa có hóa đơn nào</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {tenantBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-gradient-to-br from-white to-zinc-50/50 p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-zinc-200/50 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-950/50 dark:hover:shadow-zinc-900/50"
                  >
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-2xl"></div>

                    <div className="relative space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-zinc-900 dark:text-white">Phòng {getContractInfo(bill)}</div>
                          <div className="mt-1 text-sm text-zinc-500">
                            {new Date(bill.month).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                          </div>
                        </div>
                        {bill.isPaid ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
                            Chưa thanh toán
                          </span>
                        )}
                      </div>

                      {/* Usage Details */}
                      <div className="space-y-2 rounded-xl bg-zinc-50/50 p-4 text-sm dark:bg-white/5">
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">⚡ Điện</span>
                          <span className="font-medium">{bill.electricityEnd - bill.electricityStart} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">💧 Nước</span>
                          <span className="font-medium">{bill.waterEnd - bill.waterStart} m³</span>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex items-baseline justify-between border-t border-zinc-200/50 pt-4 dark:border-zinc-800/50">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Tổng cộng</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                          {bill.totalAmount?.toLocaleString()}đ
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium transition-all hover:bg-zinc-50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                        >
                          Chi tiết
                        </button>
                        {!bill.isPaid && (
                          <button
                            onClick={() => handleShowPayment(bill)}
                            className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-blue-700 hover:to-purple-700"
                          >
                            Thanh toán
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200/50 bg-white shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-900">
              {/* Modal Header */}
              <div className="border-b border-zinc-200/50 bg-gradient-to-r from-zinc-50 to-white p-6 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-950">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Chi Tiết Hóa Đơn</h2>
                  <button
                    onClick={() => setSelectedBill(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="text-2xl text-zinc-400">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-sm text-zinc-500">Phòng</span>
                    <div className="mt-1 font-semibold">Phòng {getContractInfo(selectedBill)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-500">Tháng</span>
                    <div className="mt-1 font-semibold">{new Date(selectedBill.month).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200/50 bg-gradient-to-br from-zinc-50 to-white p-6 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-950">
                  <div className="mb-4 font-semibold">Chi tiết sử dụng</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Điện: {selectedBill.electricityStart} → {selectedBill.electricityEnd}</span>
                      <span className="font-semibold">{((selectedBill.electricityEnd - selectedBill.electricityStart) * selectedBill.electricityRate).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Nước: {selectedBill.waterStart} → {selectedBill.waterEnd}</span>
                      <span className="font-semibold">{((selectedBill.waterEnd - selectedBill.waterStart) * selectedBill.waterRate).toLocaleString()}đ</span>
                    </div>
                    {selectedBill.otherFees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">Phí khác</span>
                        <span className="font-semibold">{selectedBill.otherFees.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                      <div className="flex justify-between text-base">
                        <span className="font-semibold">Tổng cộng</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                          {selectedBill.totalAmount?.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-zinc-500">Trạng thái</span>
                  <div className="mt-2">
                    {selectedBill.isPaid ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-white"></span>
                        Đã thanh toán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
                        Chưa thanh toán
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-zinc-200/50 bg-zinc-50/50 p-6 dark:border-zinc-800/50 dark:bg-zinc-900/50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedBill(null)}
                    className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    Đóng
                  </button>
                  {!selectedBill.isPaid && (
                    <button
                      onClick={() => {
                        handleShowPayment(selectedBill);
                        setSelectedBill(null);
                      }}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-blue-700 hover:to-purple-700"
                    >
                      Thanh toán ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment QR Modal */}
        {showPaymentQR && paymentInfo && (
          <PaymentQR
            billId={paymentInfo.billId}
            amount={paymentInfo.amount}
            bankName={paymentInfo.bankName}
            bankCode={paymentInfo.bankCode}
            accountNumber={paymentInfo.accountNumber}
            landlordName={paymentInfo.landlordName}
            onClose={() => {
              setShowPaymentQR(false);
              setPaymentInfo(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
