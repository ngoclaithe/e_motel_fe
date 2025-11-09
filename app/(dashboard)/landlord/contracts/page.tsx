"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import type { Contract, ContractType } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { userService, motelService, roomService, contractService } from "../../../../lib/services";

export default function LandlordContractsPage() {
  useEnsureRole(["LANDLORD"]);
  const router = useRouter();
  const { push } = useToast();
  const [contracts, setContracts] = useLocalStorage<Contract[]>("emotel_contracts", []);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [contractType, setContractType] = useState<ContractType>("ROOM");
  const [form, setForm] = useState<Partial<any>>({
    type: "ROOM",
    roomId: "",
    motelId: "",
    tenantId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split("T")[0],
    monthlyRent: 1000000,
    deposit: 2000000,
    paymentCycleMonths: 1,
    paymentDay: 5,
    depositMonths: 2,
    electricityCostPerKwh: 3500,
    waterCostPerCubicMeter: 15000,
    internetCost: 100000,
    parkingCost: 150000,
    serviceFee: 50000,
    specialTerms: "",
    maxOccupants: 2,
  });

  const [tenantPhone, setTenantPhone] = useState("");
  const [searchingTenant, setSearchingTenant] = useState(false);
  const [tenantCandidate, setTenantCandidate] = useState<any | null>(null);
  const [tenantMessage, setTenantMessage] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const phoneSearchTimer = useRef<number | null>(null);

  const [motels, setMotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingMotels, setLoadingMotels] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const isValidPhone = (val: string) => /^0\d{9,10}$/.test(val.trim());

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!open) return;
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;
    loadMyData();
  }, [open]);

  const handleTypeChange = (type: ContractType) => {
    setContractType(type);
    setForm((f: any) => ({
      ...f,
      type,
      roomId: type === "ROOM" ? f.roomId : "",
      motelId: type === "MOTEL" ? f.motelId : "",
    }));
  };

  const handleRoomChange = (roomId: string) => {
    setForm((f: any) => ({ ...f, roomId }));

    if (!roomId) return;

    const selectedRoom = rooms.find((r) => r.id === roomId);
    if (selectedRoom) {
      const rentalPrice = selectedRoom.price || 1000000;
      const depositMonths = selectedRoom.depositMonths || 2;
      setForm((f: any) => ({
        ...f,
        roomId,
        monthlyRent: rentalPrice,
        deposit: rentalPrice * depositMonths,
        electricityCostPerKwh: selectedRoom.electricityCostPerKwh || 3500,
        waterCostPerCubicMeter: selectedRoom.waterCostPerCubicMeter || 15000,
        internetCost: selectedRoom.internetCost || 100000,
        parkingCost: selectedRoom.parkingCost || 150000,
        serviceFee: selectedRoom.serviceFee || 50000,
        maxOccupants: selectedRoom.maxOccupancy || 2,
      }));
    }
  };

  const handleMotelChange = (motelId: string) => {
    setForm((f: any) => ({ ...f, motelId }));

    if (!motelId) return;

    const selectedMotel = motels.find((m) => m.id === motelId);
    if (selectedMotel) {
      const rentalPrice = selectedMotel.monthlyRent || 1000000;
      const depositMonths = selectedMotel.depositMonths || 2;
      setForm((f: any) => ({
        ...f,
        motelId,
        monthlyRent: rentalPrice,
        deposit: rentalPrice * depositMonths,
        electricityCostPerKwh: selectedMotel.electricityCostPerKwh || 3000,
        waterCostPerCubicMeter: selectedMotel.waterCostPerCubicMeter || 12000,
        internetCost: selectedMotel.internetCost || 200000,
        parkingCost: selectedMotel.parkingCost || 100000,
        serviceFee: selectedMotel.serviceFee || 500000,
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

  const validateForm = () => {
    if (!contractType) {
      push({ title: "Lỗi", description: "Vui lòng chọn loại hợp đồng", type: "error" });
      return false;
    }

    if (!tenantId) {
      push({ title: "Lỗi", description: "Vui lòng chọn người thuê", type: "error" });
      return false;
    }

    if (contractType === "ROOM" && !form.roomId) {
      push({ title: "Lỗi", description: "Vui lòng chọn phòng", type: "error" });
      return false;
    }

    if (contractType === "MOTEL" && !form.motelId) {
      push({ title: "Lỗi", description: "Vui lòng chọn nhà trọ", type: "error" });
      return false;
    }

    if (!form.startDate || !form.endDate) {
      push({ title: "Lỗi", description: "Vui lòng chọn ngày bắt đầu và kết thúc", type: "error" });
      return false;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      push({ title: "Lỗi", description: "Ngày kết thúc phải sau ngày bắt đầu", type: "error" });
      return false;
    }

    if (!form.monthlyRent || form.monthlyRent <= 0) {
      push({ title: "Lỗi", description: "Giá thuê phải lớn hơn 0", type: "error" });
      return false;
    }

    if (!form.deposit || form.deposit <= 0) {
      push({ title: "Lỗi", description: "Tiền cọc phải lớn hơn 0", type: "error" });
      return false;
    }

    return true;
  };

  const save = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: any = {
        type: contractType,
        tenantId,
        startDate: form.startDate,
        endDate: form.endDate,
        monthlyRent: Number(form.monthlyRent),
        deposit: Number(form.deposit),
        paymentCycleMonths: Number(form.paymentCycleMonths),
        paymentDay: Number(form.paymentDay),
        depositMonths: Number(form.depositMonths),
      };

      if (contractType === "ROOM") {
        payload.roomId = form.roomId;
      } else {
        payload.motelId = form.motelId;
      }

      if (form.electricityCostPerKwh) payload.electricityCostPerKwh = Number(form.electricityCostPerKwh);
      if (form.waterCostPerCubicMeter) payload.waterCostPerCubicMeter = Number(form.waterCostPerCubicMeter);
      if (form.internetCost) payload.internetCost = Number(form.internetCost);
      if (form.parkingCost) payload.parkingCost = Number(form.parkingCost);
      if (form.serviceFee) payload.serviceFee = Number(form.serviceFee);
      if (form.specialTerms) payload.specialTerms = String(form.specialTerms);
      if (contractType === "ROOM" && form.maxOccupants) {
        payload.maxOccupants = Number(form.maxOccupants);
      }

      const newContract = await contractService.createContract(payload);
      setContracts([newContract, ...contracts]);
      push({ title: "Tạo hợp đồng thành công", type: "success" });

      setOpen(false);
      setContractType("ROOM");
      setTenantPhone("");
      setTenantCandidate(null);
      setTenantMessage(null);
      setTenantId(null);
      setForm({
        type: "ROOM",
        roomId: "",
        motelId: "",
        tenantId: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split("T")[0],
        monthlyRent: 1000000,
        deposit: 2000000,
        paymentCycleMonths: 1,
        paymentDay: 5,
        depositMonths: 2,
        electricityCostPerKwh: 3500,
        waterCostPerCubicMeter: 15000,
        internetCost: 100000,
        parkingCost: 150000,
        serviceFee: 50000,
        specialTerms: "",
        maxOccupants: 2,
      });

      router.push(`/landlord/contracts/${newContract.id}`);
    } catch (err: any) {
      console.error("Failed to save contract:", err);
      push({ title: "Không thể tạo hợp đồng", description: err?.message || "Có lỗi xảy ra", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const remove = (id: string) => {
    if (!confirm("Xóa hợp đồng này?")) return;
    setContracts(contracts.filter((c) => c.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản lý hợp đồng</h1>
        <button
          onClick={() => {
            dataLoadedRef.current = false;
            setOpen(true);
          }}
          className="rounded-lg bg-black px-4 py-2 text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Tạo hợp đồng
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-base font-semibold">
                  {contract.type === "ROOM" ? "Hợp đồng phòng" : "Hợp đồng nhà trọ"}
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {contract.type === "ROOM" ? `Phòng: ${contract.roomId}` : `Nhà trọ: ${contract.motelId}`}
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
                    <div className="font-medium">{contract.monthlyRent?.toLocaleString()}đ</div>
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
                onClick={() => remove(contract.id)}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {contracts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
            Chưa có hợp đồng nào
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">Tạo hợp đồng mới</div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Loại hợp đồng</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTypeChange("ROOM")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      contractType === "ROOM"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "border border-black/10 dark:border-white/15"
                    }`}
                  >
                    Thuê phòng
                  </button>
                  <button
                    onClick={() => handleTypeChange("MOTEL")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      contractType === "MOTEL"
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "border border-black/10 dark:border-white/15"
                    }`}
                  >
                    Thuê cả nhà trọ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {contractType === "ROOM" ? "Chọn phòng" : "Chọn nhà trọ"}
                  </label>
                  {contractType === "ROOM" ? (
                    <select
                      value={form.roomId || ""}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    >
                      <option value="">-- Chọn phòng --</option>
                      {loadingRooms && <option>Đang tải...</option>}
                      {!loadingRooms &&
                        rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.number}
                            {r.price ? ` — ${Number(r.price).toLocaleString()}đ` : ""}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <select
                      value={form.motelId || ""}
                      onChange={(e) => handleMotelChange(e.target.value)}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    >
                      <option value="">-- Chọn nhà trọ --</option>
                      {loadingMotels && <option>Đang tải...</option>}
                      {!loadingMotels &&
                        motels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                            {m.monthlyRent ? ` — ${Number(m.monthlyRent).toLocaleString()}đ` : ""}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Số điện thoại người thuê</label>
                  <input
                    type="tel"
                    value={tenantPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0912345678"
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
                          <div className="font-medium">
                            {tenantCandidate.fullName || tenantCandidate.email || tenantCandidate.phone}
                          </div>
                          <div className="text-xs text-zinc-500">{tenantCandidate.email || ""}</div>
                          <div className="text-xs text-zinc-500">{tenantCandidate.phone || ""}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTenantId(tenantCandidate.id);
                            setForm((f: any) => ({ ...f, tenantId: tenantCandidate.id }));
                            push({ title: "Đã chọn người thuê", type: "success" });
                          }}
                          className="rounded-lg bg-black px-3 py-1 text-xs text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {tenantId && (
                <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  ✓ Đã chọn người thuê
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Từ ngày</label>
                  <input
                    type="date"
                    value={form.startDate || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Đến ngày</label>
                  <input
                    type="date"
                    value={form.endDate || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Giá thuê/tháng (đ)</label>
                  <input
                    type="number"
                    value={form.monthlyRent ?? 0}
                    onChange={(e) => setForm((f: any) => ({ ...f, monthlyRent: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Tiền cọc (đ)</label>
                  <input
                    type="number"
                    value={form.deposit ?? 0}
                    onChange={(e) => setForm((f: any) => ({ ...f, deposit: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Kỳ thanh toán (tháng)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.paymentCycleMonths ?? 1}
                    onChange={(e) => setForm((f: any) => ({ ...f, paymentCycleMonths: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Ngày thanh toán</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.paymentDay ?? 5}
                    onChange={(e) => setForm((f: any) => ({ ...f, paymentDay: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Cọc (tháng)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.depositMonths ?? 2}
                    onChange={(e) => setForm((f: any) => ({ ...f, depositMonths: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>

              <div className="border-t border-black/10 pt-3 dark:border-white/15">
                <h3 className="mb-3 text-sm font-medium">Chi phí dịch vụ (tùy chọn)</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm">Điện (đ/kWh)</label>
                    <input
                      type="number"
                      value={form.electricityCostPerKwh ?? 3500}
                      onChange={(e) =>
                        setForm((f: any) => ({ ...f, electricityCostPerKwh: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Nước (đ/m³)</label>
                    <input
                      type="number"
                      value={form.waterCostPerCubicMeter ?? 15000}
                      onChange={(e) =>
                        setForm((f: any) => ({ ...f, waterCostPerCubicMeter: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Internet (đ/tháng)</label>
                    <input
                      type="number"
                      value={form.internetCost ?? 100000}
                      onChange={(e) => setForm((f: any) => ({ ...f, internetCost: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Gửi xe (đ/tháng)</label>
                    <input
                      type="number"
                      value={form.parkingCost ?? 150000}
                      onChange={(e) => setForm((f: any) => ({ ...f, parkingCost: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm">Phí dịch vụ (đ/tháng)</label>
                    <input
                      type="number"
                      value={form.serviceFee ?? 50000}
                      onChange={(e) => setForm((f: any) => ({ ...f, serviceFee: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    />
                  </div>
                </div>
              </div>

              {contractType === "ROOM" && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Số người tối đa</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxOccupants ?? 2}
                    onChange={(e) => setForm((f: any) => ({ ...f, maxOccupants: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">Điều khoản đặc biệt</label>
                <textarea
                  value={form.specialTerms || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, specialTerms: e.target.value }))}
                  placeholder="Nhập các điều khoản đặc biệt (tùy chọn)"
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setContractType("ROOM");
                    setTenantPhone("");
                    setTenantCandidate(null);
                    setTenantMessage(null);
                    setTenantId(null);
                  }}
                  className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button
                  onClick={() => save()}
                  disabled={loading}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
                >
                  {loading ? "Đang tạo..." : "Tạo hợp đồng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
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
                  <span className="text-zinc-500">Loại hợp đồng</span>
                  <div className="font-medium">
                    {selectedContract.type === "ROOM" ? "Thuê phòng" : "Thuê nhà trọ"}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500">Mã hợp đồng</span>
                  <div className="font-medium">{selectedContract.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">
                    {selectedContract.type === "ROOM" ? "Phòng" : "Nhà trọ"}
                  </span>
                  <div className="font-medium">
                    {selectedContract.type === "ROOM" ? selectedContract.roomId : selectedContract.motelId}
                  </div>
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
                  <div className="font-medium">{selectedContract.monthlyRent?.toLocaleString()}đ</div>
                </div>
                <div>
                  <span className="text-zinc-500">Tiền cọc</span>
                  <div className="font-medium">{selectedContract.deposit?.toLocaleString()}đ</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Kỳ thanh toán</span>
                  <div className="font-medium">{selectedContract.paymentCycleMonths} tháng</div>
                </div>
                <div>
                  <span className="text-zinc-500">Ngày thanh toán</span>
                  <div className="font-medium">Ngày {selectedContract.paymentDay}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500">Cọc tính theo</span>
                  <div className="font-medium">{selectedContract.depositMonths} tháng</div>
                </div>
                <div>
                  <span className="text-zinc-500">Trạng thái</span>
                  <div className="font-medium">{selectedContract.status || "Bình thường"}</div>
                </div>
              </div>

              {selectedContract.electricityCostPerKwh && (
                <div>
                  <span className="text-zinc-500">Điện</span>
                  <div className="font-medium">
                    {selectedContract.electricityCostPerKwh.toLocaleString()}đ/kWh
                  </div>
                </div>
              )}

              {selectedContract.waterCostPerCubicMeter && (
                <div>
                  <span className="text-zinc-500">Nước</span>
                  <div className="font-medium">
                    {selectedContract.waterCostPerCubicMeter.toLocaleString()}đ/m³
                  </div>
                </div>
              )}

              {selectedContract.maxOccupants && (
                <div>
                  <span className="text-zinc-500">Số người tối đa</span>
                  <div className="font-medium">{selectedContract.maxOccupants} người</div>
                </div>
              )}

              {selectedContract.specialTerms && (
                <div>
                  <span className="text-zinc-500">Điều khoản đặc biệt</span>
                  <div className="mt-1 rounded-lg bg-black/5 p-3 text-sm dark:bg-white/5">
                    {selectedContract.specialTerms}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedContract(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
