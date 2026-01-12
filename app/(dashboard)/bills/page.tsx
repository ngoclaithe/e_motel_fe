"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";
import { billService } from "../../../lib/services";
import PaymentQR from "../../../components/PaymentQR";
import { useAuthStore } from "@/store/authStore";

export default function TenantBillsPage() {
  useEnsureRole(["TENANT"]);
  const { push } = useToast();

  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const userEmail = useAuthStore((state) => state.user?.email || "");

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
    const landlord = bill.contract?.room?.owner || bill.contract?.motel?.owner;

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hóa đơn của tôi</h1>
          <p className="mt-1 text-sm text-slate-400">Xem và thanh toán các hóa đơn tiền phòng</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-12 text-center text-sm text-slate-400 backdrop-blur-xl">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mb-4"></div>
          Đang tải hóa đơn...
        </div>
      ) : (
        <>
          {getTotalUnpaid() > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-xl">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-amber-500/10 blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-2xl">
                    ⚠️
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-200/60 uppercase tracking-wider">Tổng còn nợ</div>
                    <div className="text-3xl font-bold text-amber-400">{getTotalUnpaid().toLocaleString()}đ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tenantBills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-20 text-center text-slate-500 bg-slate-900/20">
              <div className="text-6xl mb-4">📄</div>
              <p>Chưa có hóa đơn nào được tạo</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tenantBills.map((bill) => (
                <div
                  key={bill.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm transition-all hover:bg-slate-900/80 backdrop-blur-xl"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-blue-500/5 blur-2xl"></div>

                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-lg font-bold text-white">Phòng {getContractInfo(bill)}</div>
                        <div className="mt-1 text-sm text-slate-400 font-medium">
                          {new Date(bill.month).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                        </div>
                      </div>
                      {bill.isPaid ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                          Chưa thanh toán
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-4 text-sm border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs uppercase tracking-tight">Điện sử dụng</span>
                        <span className="font-semibold text-slate-300">{bill.electricityEnd - bill.electricityStart} kWh</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs uppercase tracking-tight">Nước sử dụng</span>
                        <span className="font-semibold text-slate-300">{bill.waterEnd - bill.waterStart} m³</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
                      <span className="text-sm text-slate-400">Tổng cộng</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {bill.totalAmount?.toLocaleString()}đ
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                      >
                        Chi tiết
                      </button>
                      {!bill.isPaid && (
                        <button
                          onClick={() => handleShowPayment(bill)}
                          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-purple-500 transition-all"
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

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="border-b border-white/10 bg-white/5 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Chi tiết hóa đơn</h2>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-2xl text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Phòng</span>
                  <div className="mt-1 font-bold text-slate-200">Phòng {getContractInfo(selectedBill)}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Tháng thanh toán</span>
                  <div className="mt-1 font-bold text-slate-200">
                    {new Date(selectedBill.month).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Chi tiết sử dụng</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Điện ({selectedBill.electricityStart} → {selectedBill.electricityEnd})</span>
                    <span className="font-bold">{((selectedBill.electricityEnd - selectedBill.electricityStart) * selectedBill.electricityRate).toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Nước ({selectedBill.waterStart} → {selectedBill.waterEnd})</span>
                    <span className="font-bold">{((selectedBill.waterEnd - selectedBill.waterStart) * selectedBill.waterRate).toLocaleString()}đ</span>
                  </div>
                  {selectedBill.otherFees > 0 && (
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Phí khác</span>
                      <span className="font-bold">{selectedBill.otherFees.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="font-bold text-white">Tổng cộng</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {selectedBill.totalAmount?.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Trạng thái</span>
                <div className="mt-1">
                  {selectedBill.isPaid ? (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm font-bold text-emerald-400">
                      Đã thanh toán
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-sm font-bold text-amber-400">
                      Chưa thanh toán
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/5 p-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBill(null)}
                className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                Đóng
              </button>
              {!selectedBill.isPaid && (
                <button
                  onClick={() => {
                    handleShowPayment(selectedBill);
                    setSelectedBill(null);
                  }}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-purple-500"
                >
                  Thanh toán ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
  );
}
