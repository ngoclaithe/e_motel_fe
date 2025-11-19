"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import type { Bill } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { userService, motelService, roomService, contractService } from "../../../../lib/services";

export default function LandlordBillsPage() {
  useEnsureRole(["LANDLORD"]);
  const { push } = useToast();
  const [bills, setBills] = useLocalStorage<Bill[]>("emotel_bills", []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [form, setForm] = useState<Partial<Bill>>({
    roomId: "",
    tenantEmail: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    roomPrice: 1000000,
    electricityUsage: 0,
    electricityPrice: 0,
    waterUsage: 0,
    waterPrice: 0,
    otherFees: 0,
    totalAmount: 1000000,
    status: "unpaid",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
  });

  const landlordEmail = (() => {
    try {
      const session = JSON.parse(localStorage.getItem("emotel_session") || "null");
      return session?.email || "";
    } catch {
      return "";
    }
  })();

  const landlordBills = bills.filter((b) => b.landlordEmail === landlordEmail);

  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const r = await roomService.myRooms();
        setRooms(Array.isArray(r) ? r : []);
      } catch {
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, []);

  const handleRoomChange = (roomId: string) => {
    setForm((f) => ({ ...f, roomId }));

    if (!roomId) return;

    const selectedRoom = rooms.find((r) => r.id === roomId);
    if (selectedRoom) {
      const rentalPrice = selectedRoom.price || 1000000;
      setForm((f) => ({
        ...f,
        roomId,
        roomPrice: rentalPrice,
        totalAmount: calculateTotal({ ...f, roomPrice: rentalPrice }),
      }));
    }
  };

  const isPaid = (status: string) => status === "paid";
  const isOverdue = (dueDate: string, status: string) => {
    if (status === "paid") return false;
    return new Date(dueDate) < new Date();
  };

  const calculateTotal = (partial: Partial<Bill>) => {
    const room = Number(partial.roomPrice || 0);
    const electricity = Number(partial.electricityPrice || 0);
    const water = Number(partial.waterPrice || 0);
    const other = Number(partial.otherFees || 0);
    return room + electricity + water + other;
  };

  const save = () => {
    if (!form.roomId || !form.tenantEmail || !form.month || !form.year) {
      push({ title: "Lỗi", description: "Vui lòng điền tất cả các trường bắt buộc", type: "error" });
      return;
    }

    const totalAmount = calculateTotal(form);

    if (editing) {
      setBills(
        bills.map((b) =>
          b.id === editing.id
            ? {
                ...editing,
                ...form,
                roomPrice: Number(form.roomPrice),
                electricityPrice: Number(form.electricityPrice),
                waterPrice: Number(form.waterPrice),
                otherFees: Number(form.otherFees),
                totalAmount,
                month: Number(form.month),
                year: Number(form.year),
              }
            : b
        )
      );
      push({ title: "Cập nhật thành công", type: "success" });
    } else {
      const newBill: Bill = {
        id: crypto.randomUUID(),
        landlordEmail,
        roomId: String(form.roomId),
        tenantEmail: String(form.tenantEmail),
        month: Number(form.month),
        year: Number(form.year),
        roomPrice: Number(form.roomPrice),
        electricityUsage: Number(form.electricityUsage || 0),
        electricityPrice: Number(form.electricityPrice),
        waterUsage: Number(form.waterUsage || 0),
        waterPrice: Number(form.waterPrice),
        otherFees: Number(form.otherFees || 0),
        totalAmount,
        status: "unpaid",
        dueDate: String(form.dueDate),
        createdAt: new Date().toISOString(),
      };
      setBills([newBill, ...bills]);
      push({ title: "Tạo hóa đơn thành công", type: "success" });
    }
    setOpen(false);
    setEditing(null);
    setForm({
      roomId: "",
      tenantEmail: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      roomPrice: 1000000,
      electricityUsage: 0,
      electricityPrice: 0,
      waterUsage: 0,
      waterPrice: 0,
      otherFees: 0,
      totalAmount: 1000000,
      status: "unpaid",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
    });
  };

  const remove = (id: string) => {
    if (!confirm("Xóa hóa đơn này?")) return;
    setBills(bills.filter((b) => b.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  const markAsPaid = (id: string) => {
    setBills(bills.map((b) => (b.id === id ? { ...b, status: "paid" } : b)));
    push({ title: "Đã cập nhật", type: "success" });
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
        <h1 className="text-xl font-semibold">Quản lý hóa đơn</h1>
        <button onClick={() => setOpen(true)} className="btn-primary">
          Tạo hóa đơn
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {landlordBills.map((bill) => (
          <div
            key={bill.id}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Tháng {bill.month}/{bill.year}
                </div>
                <div className="mt-1 text-base font-semibold">{bill.totalAmount?.toLocaleString()}đ</div>
                <div className="mt-1 text-xs text-zinc-500">{bill.tenantEmail}</div>
                <div className="mt-0.5 text-xs text-zinc-500">Phòng: {bill.roomId}</div>
              </div>
              <div>
                {isPaid(bill.status) && (
                  <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Đã TT
                  </span>
                )}
                {isOverdue(bill.dueDate, bill.status) && (
                  <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Quá hạn
                  </span>
                )}
                {!isPaid(bill.status) && !isOverdue(bill.dueDate, bill.status) && (
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Chờ TT
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setSelectedBill(bill)}
                className="rounded-lg border border-black/10 px-2 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Chi tiết
              </button>
              <button
                onClick={() => {
                  setEditing(bill);
                  setForm(bill);
                  setOpen(true);
                }}
                className="rounded-lg border border-black/10 px-2 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Sửa
              </button>
              {bill.status === "unpaid" && (
                <button
                  onClick={() => markAsPaid(bill.id)}
                  className="rounded-lg border border-black/10 px-2 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  ✓ TT
                </button>
              )}
              <button
                onClick={() => remove(bill.id)}
                className="rounded-lg border border-black/10 px-2 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {landlordBills.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
            Chưa có hóa đơn nào
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">
              {editing ? "Cập nhật hóa đơn" : "Tạo hóa đơn"}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Phòng</label>
                  <select
                    value={form.roomId || ""}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    disabled={loadingRooms}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  >
                    <option value="">{loadingRooms ? "Đang tải..." : "Chọn phòng"}</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber || room.id} - {room.price?.toLocaleString()}đ
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Email người thuê</label>
                  <input
                    type="email"
                    value={form.tenantEmail || ""}
                    onChange={(e) => setForm((f) => ({ ...f, tenantEmail: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm">Tháng</label>
                  <select
                    value={form.month || 1}
                    onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Tháng {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Năm</label>
                  <input
                    type="number"
                    value={form.year || new Date().getFullYear()}
                    onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Hạn thanh toán</label>
                  <input
                    type="date"
                    value={form.dueDate || ""}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                <div className="mb-3 text-sm font-medium">Chi tiết thanh toán</div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs">Tiền phòng (đ)</label>
                    <input
                      type="number"
                      value={form.roomPrice ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setForm((f) => ({
                          ...f,
                          roomPrice: val,
                          totalAmount: calculateTotal({ ...f, roomPrice: val }),
                        }));
                      }}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs">Điện (kWh)</label>
                      <input
                        type="number"
                        value={form.electricityUsage ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, electricityUsage: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs">Tiền điện (đ)</label>
                      <input
                        type="number"
                        value={form.electricityPrice ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setForm((f) => ({
                            ...f,
                            electricityPrice: val,
                            totalAmount: calculateTotal({ ...f, electricityPrice: val }),
                          }));
                        }}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs">Nước (m³)</label>
                      <input
                        type="number"
                        value={form.waterUsage ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, waterUsage: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs">Tiền nước (đ)</label>
                      <input
                        type="number"
                        value={form.waterPrice ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setForm((f) => ({
                            ...f,
                            waterPrice: val,
                            totalAmount: calculateTotal({ ...f, waterPrice: val }),
                          }));
                        }}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs">Phí khác (đ)</label>
                    <input
                      type="number"
                      value={form.otherFees ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setForm((f) => ({
                          ...f,
                          otherFees: val,
                          totalAmount: calculateTotal({ ...f, otherFees: val }),
                        }));
                      }}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    />
                  </div>
                  <div className="border-t border-black/10 pt-3 dark:border-white/10">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Tổng cộng</span>
                      <span>{calculateTotal(form).toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                  }}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button onClick={save} className="btn-primary">
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <span className="text-zinc-500">Người thuê</span>
                  <div className="font-medium">{selectedBill.tenantEmail}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Phòng</span>
                  <div className="font-medium">{selectedBill.roomId}</div>
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
                <span className="text-zinc-500">Hạn thanh toán</span>
                <div className="font-medium">
                  {new Date(selectedBill.dueDate).toLocaleDateString("vi-VN")}
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
                    markAsPaid(selectedBill.id);
                    setSelectedBill(null);
                  }}
                  className="btn-primary"
                >
                  Đánh dấu đã thanh toán
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