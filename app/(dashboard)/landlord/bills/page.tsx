"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { billService, contractService } from "../../../../lib/services";

export default function LandlordBillsPage() {
  useEnsureRole(["LANDLORD"]);
  const { push } = useToast();

  const [bills, setBills] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  const [form, setForm] = useState({
    contractId: "",
    month: new Date().toISOString().split('T')[0],
    electricityStart: 0,
    electricityEnd: 0,
    waterStart: 0,
    waterEnd: 0,
    electricityRate: 4000,
    waterRate: 70000,
    otherFees: 0,
  });

  useEffect(() => {
    fetchBills();
    fetchContracts();
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

  const fetchContracts = async () => {
    try {
      const response = await contractService.listContracts(1, 100);
      const contractsData = Array.isArray(response) ? response : (response.data || []);
      setContracts(contractsData);
    } catch (err) {
      console.error("Failed to fetch contracts:", err);
    }
  };

  const handleSubmit = async () => {
    if (!form.contractId) {
      push({ title: "Vui lòng chọn hợp đồng", type: "error" });
      return;
    }

    try {
      if (editing) {
        await billService.updateBill(editing.id, form);
        push({ title: "Cập nhật hóa đơn thành công", type: "success" });
      } else {
        await billService.createBill(form);
        push({ title: "Tạo hóa đơn thành công", type: "success" });
      }

      setOpen(false);
      setEditing(null);
      resetForm();
      fetchBills();
    } catch (err: any) {
      console.error("Failed to save bill:", err);
      push({ title: err.message || "Không thể lưu hóa đơn", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa hóa đơn này?")) return;

    try {
      // await billService.deleteBill(id);
      push({ title: "Chức năng xóa chưa được hỗ trợ", type: "error" });
      // fetchBills();
    } catch (err) {
      push({ title: "Không thể xóa hóa đơn", type: "error" });
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await billService.markAsPaid(id);
      push({ title: "Đánh dấu đã thanh toán", type: "success" });
      fetchBills();
    } catch (err) {
      push({ title: "Không thể cập nhật trạng thái", type: "error" });
    }
  };

  const resetForm = () => {
    setForm({
      contractId: "",
      month: new Date().toISOString().split('T')[0],
      electricityStart: 0,
      electricityEnd: 0,
      waterStart: 0,
      waterEnd: 0,
      electricityRate: 4000,
      waterRate: 70000,
      otherFees: 0,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditing(null);
    setOpen(true);
  };

  const openEditModal = (bill: any) => {
    setEditing(bill);
    setForm({
      contractId: bill.contractId || "",
      month: bill.month || new Date().toISOString().split('T')[0],
      electricityStart: bill.electricityStart || 0,
      electricityEnd: bill.electricityEnd || 0,
      waterStart: bill.waterStart || 0,
      waterEnd: bill.waterEnd || 0,
      electricityRate: bill.electricityRate || 4000,
      waterRate: bill.waterRate || 70000,
      otherFees: bill.otherFees || 0,
    });
    setOpen(true);
  };

  const calculateTotal = () => {
    const electricityUsage = form.electricityEnd - form.electricityStart;
    const waterUsage = form.waterEnd - form.waterStart;
    const electricityCost = electricityUsage * form.electricityRate;
    const waterCost = waterUsage * form.waterRate;
    return electricityCost + waterCost + form.otherFees;
  };

  const getContractInfo = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return "N/A";
    return `${contract.room?.number || contract.motel?.name || "N/A"} - ${contract.tenant?.firstName || ""} ${contract.tenant?.lastName || ""}`;
  };

  const getStats = () => {
    return {
      total: bills.length,
      paid: bills.filter(b => b.isPaid).length,
      unpaid: bills.filter(b => !b.isPaid).length,
      revenue: bills.filter(b => b.isPaid).reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Quản Lý Hóa Đơn
            </h1>
            <p className="mt-1 text-sm text-slate-400">Tạo và quản lý hóa đơn tiền phòng</p>
          </div>
          <button
            onClick={openCreateModal}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-purple-700"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-xl">+</span>
              Tạo Hóa Đơn
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-indigo-500/10 blur-2xl"></div>
            <div className="relative">
              <div className="text-sm font-medium text-slate-400">Tổng số</div>
              <div className="mt-2 text-3xl font-bold text-white">{stats.total}</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/30">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/10 blur-2xl"></div>
            <div className="relative">
              <div className="text-sm font-medium text-slate-400">Đã thanh toán</div>
              <div className="mt-2 text-3xl font-bold text-emerald-400">{stats.paid}</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-500/30">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-amber-500/10 blur-2xl"></div>
            <div className="relative">
              <div className="text-sm font-medium text-slate-400">Chưa thanh toán</div>
              <div className="mt-2 text-3xl font-bold text-amber-400">{stats.unpaid}</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-purple-500/10 blur-2xl"></div>
            <div className="relative">
              <div className="text-sm font-medium text-slate-400">Doanh thu</div>
              <div className="mt-2 text-2xl font-bold text-purple-400">{stats.revenue.toLocaleString()}đ</div>
            </div>
          </div>
        </div>

        {/* Bills List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500"></div>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
            <div className="text-6xl mb-4 opacity-50">📄</div>
            <p className="text-slate-400">Chưa có hóa đơn nào</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg hover:border-indigo-500/30"
              >
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-2xl"></div>

                <div className="relative flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white">{getContractInfo(bill.contractId)}</div>
                        <div className="mt-1 text-sm text-slate-400">
                          {new Date(bill.month).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                        </div>
                      </div>
                      {bill.isPaid ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400 shadow-sm">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"></span>
                          Chưa thanh toán
                        </span>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div className="rounded-lg bg-black/20 border border-white/5 p-3">
                        <div className="text-slate-400">⚡ Điện</div>
                        <div className="mt-1 font-medium text-slate-200">{bill.electricityStart} → {bill.electricityEnd} ({bill.electricityEnd - bill.electricityStart} kWh)</div>
                      </div>
                      <div className="rounded-lg bg-black/20 border border-white/5 p-3">
                        <div className="text-slate-400">💧 Nước</div>
                        <div className="mt-1 font-medium text-slate-200">{bill.waterStart} → {bill.waterEnd} ({bill.waterEnd - bill.waterStart} m³)</div>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                      <span className="text-sm text-slate-400">Tổng cộng</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {bill.totalAmount?.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => openEditModal(bill)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
                    >
                      Sửa
                    </button>
                    {!bill.isPaid && (
                      <button
                        onClick={() => handleMarkPaid(bill.id)}
                        className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-emerald-500 hover:to-green-500"
                      >
                        Đã trả
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal - Simplified version for brevity */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {editing ? "Sửa Hóa Đơn" : "Tạo Hóa Đơn Mới"}
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-white/10"
                  >
                    <span className="text-2xl text-slate-400 hover:text-white">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Hợp đồng</label>
                  <select
                    value={form.contractId}
                    onChange={(e) => setForm({ ...form, contractId: e.target.value })}
                    disabled={!!editing}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                  >
                    <option value="" className="bg-slate-900">-- Chọn hợp đồng --</option>
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id} className="bg-slate-900">
                        {contract.room?.number || contract.motel?.name || "N/A"} - {contract.tenant?.firstName} {contract.tenant?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Tháng</label>
                  <input
                    type="date"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Chỉ số điện đầu</label>
                    <input
                      type="number"
                      value={form.electricityStart}
                      onChange={(e) => setForm({ ...form, electricityStart: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Chỉ số điện cuối</label>
                    <input
                      type="number"
                      value={form.electricityEnd}
                      onChange={(e) => setForm({ ...form, electricityEnd: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Giá điện (đ/kWh)</label>
                  <input
                    type="number"
                    value={form.electricityRate}
                    onChange={(e) => setForm({ ...form, electricityRate: Number(e.target.value) })}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Chỉ số nước đầu</label>
                    <input
                      type="number"
                      value={form.waterStart}
                      onChange={(e) => setForm({ ...form, waterStart: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Chỉ số nước cuối</label>
                    <input
                      type="number"
                      value={form.waterEnd}
                      onChange={(e) => setForm({ ...form, waterEnd: Number(e.target.value) })}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Giá nước (đ/m³)</label>
                  <input
                    type="number"
                    value={form.waterRate}
                    onChange={(e) => setForm({ ...form, waterRate: Number(e.target.value) })}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Phí khác</label>
                  <input
                    type="number"
                    value={form.otherFees}
                    onChange={(e) => setForm({ ...form, otherFees: Number(e.target.value) })}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                  <div className="text-sm font-medium mb-3 text-white">Tổng kết</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Điện: {form.electricityEnd - form.electricityStart} kWh</span>
                      <span className="font-medium text-slate-200">{((form.electricityEnd - form.electricityStart) * form.electricityRate).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nước: {form.waterEnd - form.waterStart} m³</span>
                      <span className="font-medium text-slate-200">{((form.waterEnd - form.waterStart) * form.waterRate).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phí khác</span>
                      <span className="font-medium text-slate-200">{form.otherFees.toLocaleString()}đ</span>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex justify-between text-base">
                        <span className="font-semibold text-white">Tổng cộng</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                          {calculateTotal().toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 border-t border-white/10 bg-slate-900/95 backdrop-blur-sm p-6">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500"
                  >
                    {editing ? "Cập nhật" : "Tạo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}