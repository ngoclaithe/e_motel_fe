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
      const r = await roomService.myRooms("VACANT");
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

  const terminate = async (id: string) => {
    if (!confirm("Kết thúc hợp đồng này?")) return;

    try {
      await contractService.terminateContract(id);
      loadContracts(); // Refresh list
      push({ title: "Đã yêu cầu kết thúc hợp đồng", type: "success" });
    } catch (error) {
      push({ title: "Lỗi khi kết thúc hợp đồng", type: "error" });
    }
  };

  const loadContracts = async () => {
    try {
      const response = await contractService.listContracts(1, 100);
      const contractsData = Array.isArray(response) ? response : (response.data || []);
      setContracts(contractsData);
    } catch (err) {
      console.error("Failed to fetch contracts:", err);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Quản lý hợp đồng</h1>
        <button
          onClick={() => {
            dataLoadedRef.current = false;
            setOpen(true);
          }}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-purple-700"
        >
          + Tạo hợp đồng
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-lg font-semibold text-white">
                  {contract.type === "ROOM" ? "Hợp đồng phòng" : "Hợp đồng nhà trọ"}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {contract.type === "ROOM" ? `Phòng: ${contract.roomId}` : `Nhà trọ: ${contract.motelId}`}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
                  <div>
                    <span className="text-slate-500 block mb-1">Từ ngày</span>
                    <div className="font-medium text-slate-200">
                      {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Đến ngày</span>
                    <div className="font-medium text-slate-200">
                      {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Giá thuê</span>
                    <div className="font-medium text-slate-200">{contract.monthlyRent?.toLocaleString()}đ</div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Tiền cọc</span>
                    <div className="font-medium text-slate-200">{contract.deposit?.toLocaleString()}đ</div>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {contract.status === "PENDING_TENANT" && (
                  <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
                    Chờ khách duyệt
                  </span>
                )}
                {contract.status === "TERMINATED" && (
                  <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 border border-rose-500/20">
                    Đã kết thúc
                  </span>
                )}
                {contract.status === "ACTIVE" && !isExpired(contract.endDate) && !isExpiringSoon(contract.endDate) && (
                  <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    Còn hiệu lực
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push(`/landlord/contracts/${contract.id}`)}
                className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 transition-all hover:bg-indigo-500/20 hover:text-indigo-300"
              >
                Xem chi tiết
              </button>
              {contract.status === "ACTIVE" && (
                <button
                  onClick={() => terminate(contract.id)}
                  className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-2 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
                >
                  Kết thúc
                </button>
              )}
            </div>
          </div>
        ))}
        {contracts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
            Chưa có hợp đồng nào
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Tạo hợp đồng mới</h2>
              <p className="text-sm text-slate-400 mt-1">Điền thông tin chi tiết cho hợp đồng thuê mới</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Loại hợp đồng</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTypeChange("ROOM")}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${contractType === "ROOM"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                      }`}
                  >
                    Thuê phòng
                  </button>
                  <button
                    onClick={() => handleTypeChange("MOTEL")}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${contractType === "MOTEL"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                      }`}
                  >
                    Thuê cả nhà trọ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    {contractType === "ROOM" ? "Chọn phòng" : "Chọn nhà trọ"}
                  </label>
                  {contractType === "ROOM" ? (
                    <select
                      value={form.roomId || ""}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="" className="bg-slate-900">-- Chọn phòng --</option>
                      {loadingRooms && <option className="bg-slate-900">Đang tải...</option>}
                      {!loadingRooms &&
                        rooms
                          .filter((r) => r.status === "VACANT")
                          .map((r) => (
                            <option key={r.id} value={r.id} className="bg-slate-900">
                              {r.number}
                              {r.price ? ` — ${Number(r.price).toLocaleString()}đ` : ""}
                            </option>
                          ))}
                    </select>
                  ) : (
                    <select
                      value={form.motelId || ""}
                      onChange={(e) => handleMotelChange(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="" className="bg-slate-900">-- Chọn nhà trọ --</option>
                      {loadingMotels && <option className="bg-slate-900">Đang tải...</option>}
                      {!loadingMotels &&
                        motels.map((m) => (
                          <option key={m.id} value={m.id} className="bg-slate-900">
                            {m.name}
                            {m.monthlyRent ? ` — ${Number(m.monthlyRent).toLocaleString()}đ` : ""}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Số điện thoại người thuê</label>
                  <input
                    type="tel"
                    value={tenantPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0912345678"
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  />
                  <div className="mt-2 text-xs text-slate-400">
                    {searchingTenant && <span>Đang tìm...</span>}
                    {!searchingTenant && tenantMessage && <span className="text-red-400">{tenantMessage}</span>}
                  </div>
                  {tenantCandidate && (
                    <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">
                            {tenantCandidate.fullName || tenantCandidate.email || tenantCandidate.phone}
                          </div>
                          <div className="text-xs text-slate-400">{tenantCandidate.email || ""}</div>
                          <div className="text-xs text-slate-400">{tenantCandidate.phone || ""}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTenantId(tenantCandidate.id);
                            setForm((f: any) => ({ ...f, tenantId: tenantCandidate.id }));
                            push({ title: "Đã chọn người thuê", type: "success" });
                          }}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {tenantId && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-400">
                  ✓ Đã chọn người thuê
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Từ ngày</label>
                  <input
                    type="date"
                    value={form.startDate || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Đến ngày</label>
                  <input
                    type="date"
                    value={form.endDate || ""}
                    onChange={(e) => setForm((f: any) => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Giá thuê/tháng (đ)</label>
                  <input
                    type="number"
                    value={form.monthlyRent ?? 0}
                    onChange={(e) => setForm((f: any) => ({ ...f, monthlyRent: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Tiền cọc (đ)</label>
                  <input
                    type="number"
                    value={form.deposit ?? 0}
                    onChange={(e) => setForm((f: any) => ({ ...f, deposit: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Kỳ thanh toán (tháng)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.paymentCycleMonths ?? 1}
                    onChange={(e) => setForm((f: any) => ({ ...f, paymentCycleMonths: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Ngày thanh toán</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.paymentDay ?? 5}
                    onChange={(e) => setForm((f: any) => ({ ...f, paymentDay: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Cọc (tháng)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.depositMonths ?? 2}
                    onChange={(e) => setForm((f: any) => ({ ...f, depositMonths: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="mb-4 text-sm font-semibold text-white">Chi phí dịch vụ (tùy chọn)</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Điện (đ/kWh)</label>
                    <input
                      type="number"
                      value={form.electricityCostPerKwh ?? 3500}
                      onChange={(e) =>
                        setForm((f: any) => ({ ...f, electricityCostPerKwh: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Nước (đ/m³)</label>
                    <input
                      type="number"
                      value={form.waterCostPerCubicMeter ?? 15000}
                      onChange={(e) =>
                        setForm((f: any) => ({ ...f, waterCostPerCubicMeter: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Internet (đ/tháng)</label>
                    <input
                      type="number"
                      value={form.internetCost ?? 100000}
                      onChange={(e) => setForm((f: any) => ({ ...f, internetCost: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Gửi xe (đ/tháng)</label>
                    <input
                      type="number"
                      value={form.parkingCost ?? 150000}
                      onChange={(e) => setForm((f: any) => ({ ...f, parkingCost: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm text-slate-300">Phí dịch vụ (đ/tháng)</label>
                    <input
                      type="number"
                      value={form.serviceFee ?? 50000}
                      onChange={(e) => setForm((f: any) => ({ ...f, serviceFee: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {contractType === "ROOM" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Số người tối đa</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxOccupants ?? 2}
                    onChange={(e) => setForm((f: any) => ({ ...f, maxOccupants: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Điều khoản đặc biệt</label>
                <textarea
                  value={form.specialTerms || ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, specialTerms: e.target.value }))}
                  placeholder="Nhập các điều khoản đặc biệt (tùy chọn)"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setOpen(false);
                    setContractType("ROOM");
                    setTenantPhone("");
                    setTenantCandidate(null);
                    setTenantMessage(null);
                    setTenantId(null);
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  onClick={() => save()}
                  disabled={loading}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
                >
                  {loading ? "Đang tạo..." : "Tạo hợp đồng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Chi tiết hợp đồng</h2>
              <button
                onClick={() => setSelectedContract(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-500 block mb-1">Loại hợp đồng</span>
                  <div className="font-semibold text-white">
                    {selectedContract.type === "ROOM" ? "Thuê phòng" : "Thuê nhà trọ"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Mã hợp đồng</span>
                  <div className="font-mono text-slate-300">{selectedContract.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-500 block mb-1">
                    {selectedContract.type === "ROOM" ? "Phòng" : "Nhà trọ"}
                  </span>
                  <div className="font-semibold text-white">
                    {selectedContract.type === "ROOM" ? selectedContract.roomId : selectedContract.motelId}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Ngày tạo</span>
                  <div className="text-slate-300">
                    {new Date(selectedContract.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-500 block mb-1">Từ ngày</span>
                  <div className="text-slate-300">
                    {new Date(selectedContract.startDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Đến ngày</span>
                  <div className="text-slate-300">
                    {new Date(selectedContract.endDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-500 block mb-1">Giá thuê (tháng)</span>
                  <div className="text-lg font-bold text-indigo-400">{selectedContract.monthlyRent?.toLocaleString()}đ</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Tiền cọc</span>
                  <div className="text-lg font-bold text-indigo-400">{selectedContract.deposit?.toLocaleString()}đ</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-500 block mb-1">Kỳ thanh toán</span>
                  <div className="text-slate-300">{selectedContract.paymentCycleMonths} tháng</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Ngày thanh toán</span>
                  <div className="text-slate-300">Ngày {selectedContract.paymentDay}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-500 block mb-1">Cọc tính theo</span>
                  <div className="text-slate-300">{selectedContract.depositMonths} tháng</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Trạng thái</span>
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

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedContract(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Đóng
              </button>
              <button
                onClick={async () => {
                  try {
                    await contractService.downloadContract(selectedContract.id);
                    push({ title: "Đang tải xuống hợp đồng...", type: "success" });
                  } catch (error) {
                    push({ title: "Không thể tải hợp đồng", type: "error" });
                    console.error(error);
                  }
                }}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
              >
                Tải về hợp đồng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
