"use client";

import { useRef, useState, useEffect } from "react";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import type { Contract } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { userService, motelService, roomService, contractService } from "../../../../lib/services";

export default function LandlordContractsPage() {
  useEnsureRole(["landlord"]);
  const { push } = useToast();
  const [contracts, setContracts] = useLocalStorage<Contract[]>("emotel_contracts", []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [form, setForm] = useState<Partial<Contract>>({
    roomId: "",
    tenantId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split("T")[0],
    monthlyPrice: 1000000,
    deposit: 2000000,
    paymentPeriod: "monthly",
    notes: "",
  });

  const [tenantPhone, setTenantPhone] = useState("");
  const [searchingTenant, setSearchingTenant] = useState(false);
  const [tenantCandidate, setTenantCandidate] = useState<any | null>(null);
  const [tenantMessage, setTenantMessage] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const phoneSearchTimer = useRef<number | null>(null);

  const isValidPhone = (val: string) => /^0\d{9,10}$/.test(val.trim());

  // Motels and rooms for selection
  const [selectType, setSelectType] = useState<'room' | 'motel'>('room');
  const [motels, setMotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingMotels, setLoadingMotels] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const loadMyData = async () => {
    setLoadingMotels(true);
    setLoadingRooms(true);
    try {
      const m = await motelService.getMyMotels();
      setMotels(Array.isArray(m?.data) ? m.data : []);
    } catch {
      setMotels([]);
    } finally {
      setLoadingMotels(false);
    }

    try {
      const r = await roomService.myRooms();
      setRooms(Array.isArray(r) ? r : []);
    } catch {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const dataLoadedRef = useRef(false);

  // Load motels/rooms once when the create modal opens (or on first mount)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!open) return; // only load when modal is opened
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;
    loadMyData();
  }, [open]);

  // Auto-load rental price and deposit when room/motel is selected
  const handleRoomChange = (roomId: string) => {
    setForm((f) => ({ ...f, roomId }));

    if (!roomId) return;

    const selectedRoom = rooms.find((r) => r.id === roomId);
    if (selectedRoom) {
      const rentalPrice = selectedRoom.price || 1000000;
      const depositMonths = selectedRoom.depositMonths || 2;
      setForm((f) => ({
        ...f,
        roomId,
        monthlyPrice: rentalPrice,
        deposit: rentalPrice * depositMonths,
      }));
    }
  };

  const handleMotelChange = (motelId: string) => {
    setForm((f) => ({ ...f, roomId: motelId }));

    if (!motelId) return;

    const selectedMotel = motels.find((m) => m.id === motelId);
    if (selectedMotel) {
      const rentalPrice = selectedMotel.monthlyRent || 1000000;
      const depositMonths = selectedMotel.depositMonths || 2;
      setForm((f) => ({
        ...f,
        roomId: motelId,
        monthlyPrice: rentalPrice,
        deposit: rentalPrice * depositMonths,
      }));
    }
  };

  const handlePhoneChange = (val: string) => {
    setTenantPhone(val);
    setTenantId(null);
    setTenantCandidate(null);
    setTenantMessage(null);

    if (!isValidPhone(val)) {
      if (phoneSearchTimer.current) window.clearTimeout(phoneSearchTimer.current);
      return;
    }

    if (phoneSearchTimer.current) window.clearTimeout(phoneSearchTimer.current);
    setSearchingTenant(true);
    phoneSearchTimer.current = window.setTimeout(async () => {
      try {
        const found = await userService.searchByPhone(val.trim());
        if (found && (found as any).id) {
          setTenantCandidate(found);
          setTenantMessage(null);
        } else {
          setTenantCandidate(null);
          setTenantMessage("Không tìm thấy người thuê");
        }
      } catch {
        setTenantCandidate(null);
        setTenantMessage("Không tìm thấy người thuê");
      } finally {
        setSearchingTenant(false);
      }
    }, 400);
  };

  const landlordEmail = (() => {
    try {
      const session = JSON.parse(localStorage.getItem("emotel_session") || "null");
      return session?.email || "";
    } catch {
      return "";
    }
  })();

  const landlordContracts = contracts.filter((c) => c.landlordEmail === landlordEmail);

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

  const save = async () => {
    if (!form.roomId || !tenantId || !form.startDate || !form.endDate) {
      push({ title: "Lỗi", description: "Vui lòng nhập số điện thoại người thuê hợp lệ và chọn người thuê", type: "error" });
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      push({ title: "Lỗi", description: "Ngày kết thúc phải sau ngày bắt đầu", type: "error" });
      return;
    }

    try {
      if (editing) {
        const updated = await contractService.updateContract(editing.id, {
          startDate: String(form.startDate),
          endDate: String(form.endDate),
          monthlyPrice: Number(form.monthlyPrice),
          deposit: Number(form.deposit),
          paymentPeriod: String(form.paymentPeriod) as "monthly" | "quarterly" | "yearly",
          notes: String(form.notes || ""),
        });
        setContracts(
          contracts.map((c) => (c.id === editing.id ? updated : c))
        );
        push({ title: "Cập nhật thành công", type: "success" });
      } else {
        const newContract = await contractService.createContract({
          tenantId: String(form.tenantId),
          roomId: String(form.roomId),
          startDate: String(form.startDate),
          endDate: String(form.endDate),
          monthlyPrice: Number(form.monthlyPrice),
          deposit: Number(form.deposit),
          paymentPeriod: String(form.paymentPeriod) as "monthly" | "quarterly" | "yearly",
          notes: String(form.notes || ""),
        });
        setContracts([newContract, ...contracts]);
        push({ title: "Tạo hợp đồng thành công", type: "success" });
      }
    } catch (err) {
      console.error("Failed to save contract:", err);
      push({ title: "Không thể lưu hợp đồng", type: "error" });
      return;
    }

    setOpen(false);
    setEditing(null);
    setTenantPhone("");
    setTenantCandidate(null);
    setTenantMessage(null);
    setTenantId(null);
    setForm({
      roomId: "",
      tenantId: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split("T")[0],
      monthlyPrice: 1000000,
      deposit: 2000000,
      paymentPeriod: "monthly",
      notes: "",
    });
  };

  const remove = (id: string) => {
    if (!confirm("Xóa hợp đồng này?")) return;
    setContracts(contracts.filter((c) => c.id !== id));
    push({ title: "Đã xóa", type: "info" });
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
        <h1 className="text-xl font-semibold">Quản lý hợp đồng</h1>
        <button onClick={() => setOpen(true)} className="btn-primary">
          Tạo hợp đồng
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {landlordContracts.map((contract) => (
          <div
            key={contract.id}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-base font-semibold">{contract.roomId}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Người thuê: {contract.tenantEmail}
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
                onClick={() => setSelectedContract(contract)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Xem chi tiết
              </button>
              <button
                onClick={() => {
                  setEditing(contract);
                  setForm(contract);
                  setOpen(true);
                }}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Sửa
              </button>
              <button
                onClick={() => downloadPDF(contract)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Tải PDF
              </button>
              <button
                onClick={() => remove(contract.id)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {landlordContracts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
            Chưa có hợp đồng nào
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">
              {editing ? "Cập nhật hợp đồng" : "Tạo hợp đồng"}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Phòng / Nhà trọ</label>
                  <div className="flex gap-2">
                    <select
                      value={selectType}
                      onChange={(e) => setSelectType(e.target.value as 'room' | 'motel')}
                      className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    >
                      <option value="room">Phòng</option>
                      <option value="motel">Nhà trọ</option>
                    </select>

                    {selectType === 'room' ? (
                      <select
                        value={form.roomId || ''}
                        onChange={(e) => handleRoomChange(e.target.value)}
                        className="flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                      >
                        <option value="">-- Chọn phòng --</option>
                        {loadingRooms && <option>Đang tải...</option>}
                        {!loadingRooms && rooms.map((r) => (
                          <option key={r.id} value={r.id}>{r.number}{r.price ? ` — ${Number(r.price).toLocaleString()}đ` : ''}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={form.roomId || ''}
                        onChange={(e) => handleMotelChange(e.target.value)}
                        className="flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                      >
                        <option value="">-- Chọn nhà trọ --</option>
                        {loadingMotels && <option>Đang tải...</option>}
                        {!loadingMotels && motels.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}{m.monthlyRent ? ` — ${Number(m.monthlyRent).toLocaleString()}đ` : ''}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Số điện thoại người thuê</label>
                  <input
                    type="tel"
                    value={tenantPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {searchingTenant && <span>Đang tìm...</span>}
                    {!searchingTenant && tenantMessage && <span>{tenantMessage}</span>}
                  </div>
                  {tenantCandidate && (
                    <div className="mt-2 rounded-lg border border-black/10 p-3 text-sm dark:border-white/15">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{tenantCandidate.fullName || tenantCandidate.email || tenantCandidate.phone}</div>
                          <div className="text-xs text-zinc-500">{tenantCandidate.email || ""}</div>
                          <div className="text-xs text-zinc-500">{tenantCandidate.phone || ""}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTenantId(tenantCandidate.id);
                            setForm((f) => ({ ...f, tenantEmail: tenantCandidate.email || "" }));
                            push({ title: "Đã chọn người thuê", type: "success" });
                          }}
                          className="btn-primary"
                        >
                          Chọn người thuê này
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Từ ngày</label>
                  <input
                    type="date"
                    value={form.startDate || ""}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Đến ngày</label>
                  <input
                    type="date"
                    value={form.endDate || ""}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Giá thuê (đ)</label>
                  <input
                    type="number"
                    value={form.monthlyPrice ?? 0}
                    onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Tiền cọc (đ)</label>
                  <input
                    type="number"
                    value={form.deposit ?? 0}
                    onChange={(e) => setForm((f) => ({ ...f, deposit: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm">Kỳ thanh toán</label>
                <select
                  value={form.paymentPeriod || "monthly"}
                  onChange={(e) => setForm((f) => ({ ...f, paymentPeriod: e.target.value as "monthly" | "quarterly" | "yearly" }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                >
                  <option value="monthly">Hàng tháng</option>
                  <option value="quarterly">Quý</option>
                  <option value="yearly">Năm</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Ghi chú</label>
                <textarea
                  value={form.notes || ""}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  rows={3}
                />
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
                <button onClick={() => save()} className="btn-primary">
                  Lưu
                </button>
              </div>
            </div>
          </div>
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
                  <div className="font-medium">
                    {selectedContract.monthlyPrice?.toLocaleString()}đ
                  </div>
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
