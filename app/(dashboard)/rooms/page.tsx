"use client";

import { useEffect, useMemo, useState } from "react";
import type { Room, RoomStatus, Motel, BathroomType, FurnishingStatus } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole, useCurrentRole } from "../../../hooks/useAuth";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import { roomService, motelService } from "../../../lib/services";

const COMMON_AMENITIES = [
  "Cửa sổ lớn",
  "Ánh sáng tự nhiên tốt",
  "Không gian rộng rãi",
  "View đẹp",
  "Yên tĩnh",
  "Gần trường học",
  "Gần chợ",
  "Gần bệnh viện",
];

export default function RoomsPage() {
  useEnsureRole(["LANDLORD", "TENANT", "ADMIN"]);
  const role = useCurrentRole();
  const { push } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [motels, setMotels] = useState<Motel[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<RoomStatus | "all">("all");
  const [viewFilter, setViewFilter] = useState<'all' | 'mine'>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [form, setForm] = useState<Partial<Room>>({
    number: "",
    area: 20,
    price: 1000000,
    status: "VACANT",
    amenities: [],
    images: [],
    bathroomType: "PRIVATE",
    hasWaterHeater: false,
    furnishingStatus: "PARTIALLY_FURNISHED",
    hasAirConditioner: false,
    hasBalcony: false,
    hasWindow: true,
    hasKitchen: false,
    hasRefrigerator: false,
    hasWashingMachine: false,
    hasWardrobe: false,
    hasBed: true,
    hasDesk: false,
    hasWifi: false,
    maxOccupancy: 1,
    allowPets: false,
    allowCooking: true,
    allowOppositeGender: false,
    floor: 1,
    electricityCostPerKwh: 0,
    waterCostPerCubicMeter: 0,
    internetCost: 0,
    parkingCost: 0,
    serviceFee: 0,
    paymentCycleMonths: 1,
    depositMonths: 0,
    description: "",
    availableFrom: "",
  });

  const filtered = useMemo(() => {
    return status === "all" ? rooms : rooms.filter((r) => r.status === status);
  }, [rooms, status]);

  const handleImagesChange = (files?: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const newImageFiles = [...imageFiles, ...fileArray];
      setImageFiles(newImageFiles);
      const readers = fileArray.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then((dataUrls) => {
        setForm((f) => ({
          ...f,
          images: [...(f.images || []), ...dataUrls],
        }));
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setForm((f) => ({
      ...f,
      images: (f.images || []).filter((_, i) => i !== index),
    }));
  };

  const loadRooms = async () => {
    setLoading(true);
    try {
      let data: unknown;
      if (viewFilter === 'mine') {
        data = await roomService.myRooms();
      } else {
        data = await roomService.listAll();
      }
      setRooms(Array.isArray(data) ? (data as Room[]) : []);
    } catch (e) {
      push({ title: "Lỗi", description: "Không thể tải danh sách phòng", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadMotels = async () => {
    try {
      const res = await motelService.listMotels({ page: 1, limit: 100 });
      const data = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? (res as Motel[]) : [];
      setMotels(data);
    } catch { }
  };

  useEffect(() => {
    loadRooms();
    loadMotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, viewFilter]);

  const save = async () => {
    if (!form.number || !form.area || !form.price) {
      push({ title: "Lỗi", description: "Vui lòng điền tất cả các trường bắt buộc", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const url = await uploadToCloudinary(file);
          imageUrls.push(url);
        }
      }

      const basePayload = {
        number: String(form.number),
        area: Number(form.area),
        price: Number(form.price),
        amenities: form.amenities || [],
        images: imageUrls.length > 0 ? imageUrls : (form.images || []),
        motelId: form.motelId,
        bathroomType: form.bathroomType as BathroomType,
        hasWaterHeater: form.hasWaterHeater ?? false,
        furnishingStatus: form.furnishingStatus as FurnishingStatus,
        hasAirConditioner: form.hasAirConditioner ?? false,
        hasBalcony: form.hasBalcony ?? false,
        hasWindow: form.hasWindow ?? true,
        hasKitchen: form.hasKitchen ?? false,
        hasRefrigerator: form.hasRefrigerator ?? false,
        hasWashingMachine: form.hasWashingMachine ?? false,
        hasWardrobe: form.hasWardrobe ?? false,
        hasBed: form.hasBed ?? true,
        hasDesk: form.hasDesk ?? false,
        hasWifi: form.hasWifi ?? false,
        maxOccupancy: form.maxOccupancy ?? 1,
        allowPets: form.allowPets ?? false,
        allowCooking: form.allowCooking ?? true,
        allowOppositeGender: form.allowOppositeGender ?? false,
        floor: form.floor ?? 1,
        electricityCostPerKwh: form.electricityCostPerKwh ?? 0,
        waterCostPerCubicMeter: form.waterCostPerCubicMeter ?? 0,
        internetCost: form.internetCost ?? 0,
        parkingCost: form.parkingCost ?? 0,
        serviceFee: form.serviceFee ?? 0,
        paymentCycleMonths: form.paymentCycleMonths ?? 1,
        depositMonths: form.depositMonths ?? 0,
        description: form.description ?? "",
        availableFrom: form.availableFrom ? `${form.availableFrom}T00:00:00.000Z` : undefined,
      };

      if (editing) {
        await roomService.updateRoom(editing.id, basePayload as any);
        push({ title: "Cập nhật phòng thành công", type: "success" });
      } else {
        await roomService.createRoom(basePayload as any);
        push({ title: "Tạo phòng thành công", type: "success" });
      }

      await loadRooms();
      closeModal();
    } catch (error) {
      const err = error as any;
      const detail = typeof err?.data === 'string' ? err.data : (err?.data?.message || err?.message || "Không thể lưu phòng");
      push({ title: "Lỗi", description: detail, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa phòng này?")) return;
    try {
      await roomService.deleteRoom(id);
      await loadRooms();
      push({ title: "Đã xóa", type: "info" });
    } catch {
      push({ title: "Lỗi", description: "Không thể xóa phòng", type: "error" });
    }
  };

  const openEditModal = (room: Room) => {
    setEditing(room);
    setForm(room);
    setImageFiles([]);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setImageFiles([]);
    setForm({
      number: "",
      area: 20,
      price: 1000000,
      status: "VACANT",
      amenities: [],
      images: [],
      bathroomType: "PRIVATE",
      hasWaterHeater: false,
      furnishingStatus: "PARTIALLY_FURNISHED",
      hasAirConditioner: false,
      hasBalcony: false,
      hasWindow: true,
      hasKitchen: false,
      hasRefrigerator: false,
      hasWashingMachine: false,
      hasWardrobe: false,
      hasBed: true,
      hasDesk: false,
      hasWifi: false,
      maxOccupancy: 1,
      allowPets: false,
      allowCooking: true,
      allowOppositeGender: false,
      floor: 1,
      electricityCostPerKwh: 0,
      waterCostPerCubicMeter: 0,
      internetCost: 0,
      parkingCost: 0,
      serviceFee: 0,
      paymentCycleMonths: 1,
      depositMonths: 0,
      description: "",
      availableFrom: "",
    });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Phòng</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewFilter('all')}
              className={`rounded-lg px-3 py-1 text-sm ${viewFilter === 'all' ? 'bg-black/5 dark:bg-white/10' : ''}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setViewFilter('mine')}
              disabled={!(role === "LANDLORD" || role === "ADMIN")}
              className={`rounded-lg px-3 py-1 text-sm ${viewFilter === 'mine' ? 'bg-black/5 dark:bg-white/10' : 'opacity-80'}`}
            >
              Của tôi
            </button>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RoomStatus | "all")}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          >
            <option value="all">Tất cả</option>
            <option value="VACANT">Trống</option>
            <option value="OCCUPIED">Đang thuê</option>
            <option value="MAINTENANCE">Bảo trì</option>
          </select>
          {(role === "LANDLORD" || role === "ADMIN") && (
            <button onClick={() => setOpen(true)} className="btn-primary">Thêm phòng</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRoom(r)}
              className="cursor-pointer rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-semibold">Phòng {r.number}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">{r.area} m² • {Number(r.price).toLocaleString()}đ</div>
                </div>
                <span className="rounded-full px-2 py-0.5 text-xs text-zinc-700 dark:text-zinc-300" data-status={r.status}>
                  {r.status === "VACANT" && "Trống"}
                  {r.status === "OCCUPIED" && "Đang thuê"}
                  {r.status === "MAINTENANCE" && "Bảo trì"}
                </span>
              </div>
              {r.images && r.images.length > 0 && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={(r.images[0] as any)?.url || String(r.images[0] || '')} alt={`room-${r.id}`} className="w-full h-36 object-cover rounded-md" />
                </div>
              )}
              {r.amenities && r.amenities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {amenity}
                    </span>
                  ))}
                  {r.amenities.length > 3 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      +{r.amenities.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-zinc-500">Tầng {r.floor ?? '-'}</div>
                <div className="text-xs text-zinc-500">Sức chứa {r.maxOccupancy ?? '-'}</div>
              </div>

              {(role === "LANDLORD" || role === "ADMIN") && (
                <div className="mt-3 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(r); }} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Sửa</button>
                  <button onClick={(e) => { e.stopPropagation(); remove(r.id); }} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">Không có phòng phù hợp</div>
          )}
        </div>
      )}

      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-black/40 flex flex-col">
            <div className="flex-shrink-0 border-b border-black/10 px-6 py-4 dark:border-white/15">
              <h2 className="text-lg font-semibold">Chi tiết phòng {selectedRoom.number}</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {((selectedRoom.images || []) as any[]).slice(0, 4).map((img, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={idx} src={typeof img === 'string' ? img : img.url} alt={`img-${idx}`} className="w-full h-32 object-cover rounded-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-md bg-black/5" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold">Giá: {Number(selectedRoom.price).toLocaleString()}đ</div>
                  <div className="text-xs text-zinc-500">Diện tích: {selectedRoom.area} m²</div>
                  <div className="mt-2 text-xs">{selectedRoom.description}</div>

                  {(selectedRoom as any).motel && (
                    <div className="mt-3 text-xs">
                      <div className="font-medium">Nhà trọ: {(selectedRoom as any).motel.name}</div>
                      <div className="text-zinc-500">{(selectedRoom as any).motel.address}</div>
                    </div>
                  )}

                  <div className="mt-3 text-xs">
                    <div className="font-medium">Tiện nghi</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(selectedRoom.amenities || []).map((a) => (
                        <span key={a} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{a}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-xs">
                    <div>Điện: {selectedRoom.electricityCostPerKwh ?? '-'} đ/kWh</div>
                    <div>Nước: {selectedRoom.waterCostPerCubicMeter ?? '-'} đ/m³</div>
                    <div>Internet: {selectedRoom.internetCost ?? '-'} đ/tháng</div>
                    <div>Tiền gửi xe: {selectedRoom.parkingCost ?? '-'} đ/tháng</div>
                  </div>

                  <div className="mt-3 text-xs text-zinc-500">Có sẵn từ: {selectedRoom.availableFrom || '-'}</div>
                  <div className="text-xs text-zinc-400">Tạo: {new Date(selectedRoom.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 border-t border-black/10 px-6 py-4 dark:border-white/15 flex justify-end gap-2">
              <button onClick={() => setSelectedRoom(null)} className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {(role === "LANDLORD" || role === "ADMIN") && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-black/40 flex flex-col">
            <div className="flex-shrink-0 border-b border-black/10 px-6 py-4 dark:border-white/15">
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật phòng" : "Thêm phòng"}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Số phòng <span className="text-red-500">*</span></label>
                      <input
                        value={form.number || ""}
                        onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        placeholder="301"
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Nhà trọ (tùy chọn)</label>
                      <select
                        value={form.motelId || ""}
                        onChange={(e) => setForm((f) => ({ ...f, motelId: e.target.value || undefined }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      >
                        <option value="">Không chọn nhà trọ</option>
                        {motels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Diện tích (m²) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={form.area ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, area: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Tầng</label>
                      <input
                        type="number"
                        value={form.floor || 1}
                        onChange={(e) => setForm((f) => ({ ...f, floor: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Giá (đ) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={form.price ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Trạng thái</label>
                      <select
                        value={form.status || "VACANT"}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RoomStatus }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      >
                        <option value="VACANT">Trống</option>
                        <option value="OCCUPIED">Đang thuê</option>
                        <option value="MAINTENANCE">Bảo trì</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Có sẵn từ (ngày)</label>
                      <input
                        type="date"
                        value={form.availableFrom || ""}
                        onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="mb-1 block text-sm font-medium">Mô tả</label>
                    <textarea
                      value={form.description || ""}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                      placeholder="Phòng mới xây, thoáng mát, đầy đủ nội thất cơ bản"
                      rows={2}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Chi tiết phòng</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Kiểu phòng tắm</label>
                      <select
                        value={form.bathroomType || "PRIVATE"}
                        onChange={(e) => setForm((f) => ({ ...f, bathroomType: e.target.value as BathroomType }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      >
                        <option value="PRIVATE">Riêng</option>
                        <option value="SHARED">Chung</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Tình trạng nội thất</label>
                      <select
                        value={form.furnishingStatus || "PARTIALLY_FURNISHED"}
                        onChange={(e) => setForm((f) => ({ ...f, furnishingStatus: e.target.value as FurnishingStatus }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      >
                        <option value="UNFURNISHED">Không có nội thất</option>
                        <option value="PARTIALLY_FURNISHED">Nội thất cơ bản</option>
                        <option value="FULLY_FURNISHED">Đầy đủ nội thất</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Sức chứa tối đa (người)</label>
                      <input
                        type="number"
                        value={form.maxOccupancy || 1}
                        onChange={(e) => setForm((f) => ({ ...f, maxOccupancy: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      { key: "hasWaterHeater", label: "Nóng lạnh" },
                      { key: "hasAirConditioner", label: "Điều hòa" },
                      { key: "hasBalcony", label: "Ban công" },
                      { key: "hasWindow", label: "Cửa sổ" },
                      { key: "hasKitchen", label: "Bếp" },
                      { key: "hasRefrigerator", label: "Tủ lạnh" },
                      { key: "hasWashingMachine", label: "Máy giặt" },
                      { key: "hasWardrobe", label: "Tủ quần áo" },
                      { key: "hasBed", label: "Giường" },
                      { key: "hasDesk", label: "Bàn làm việc" },
                      { key: "hasWifi", label: "WiFi" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(form as Record<string, unknown>)[key] as boolean || false}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                          className="rounded"
                          disabled={uploading}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Chính sách phòng</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allowPets || false}
                        onChange={(e) => setForm((f) => ({ ...f, allowPets: e.target.checked }))}
                        className="rounded"
                        disabled={uploading}
                      />
                      <span className="text-sm">Cho phép nuôi thú cưng</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allowCooking ?? true}
                        onChange={(e) => setForm((f) => ({ ...f, allowCooking: e.target.checked }))}
                        className="rounded"
                        disabled={uploading}
                      />
                      <span className="text-sm">Cho phép nấu ăn</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allowOppositeGender || false}
                        onChange={(e) => setForm((f) => ({ ...f, allowOppositeGender: e.target.checked }))}
                        className="rounded"
                        disabled={uploading}
                      />
                      <span className="text-sm">Cho phép giới tính khác</span>
                    </label>
                  </div>
                </div>

                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Chi phí & Điều khoản</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Giá điện (đ/kWh)</label>
                      <input
                        type="number"
                        value={form.electricityCostPerKwh || 0}
                        onChange={(e) => setForm((f) => ({ ...f, electricityCostPerKwh: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Giá nước (đ/m³)</label>
                      <input
                        type="number"
                        value={form.waterCostPerCubicMeter || 0}
                        onChange={(e) => setForm((f) => ({ ...f, waterCostPerCubicMeter: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Giá internet (đ/tháng)</label>
                      <input
                        type="number"
                        value={form.internetCost || 0}
                        onChange={(e) => setForm((f) => ({ ...f, internetCost: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Giá gửi xe (đ/tháng)</label>
                      <input
                        type="number"
                        value={form.parkingCost || 0}
                        onChange={(e) => setForm((f) => ({ ...f, parkingCost: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Phí dịch vụ (đ/tháng)</label>
                      <input
                        type="number"
                        value={form.serviceFee || 0}
                        onChange={(e) => setForm((f) => ({ ...f, serviceFee: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Chu kỳ thanh toán (tháng)</label>
                      <input
                        type="number"
                        value={form.paymentCycleMonths || 1}
                        onChange={(e) => setForm((f) => ({ ...f, paymentCycleMonths: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Tiền cọc (tháng)</label>
                      <input
                        type="number"
                        value={form.depositMonths || 0}
                        onChange={(e) => setForm((f) => ({ ...f, depositMonths: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-semibold">Hình ảnh phòng</h3>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImagesChange(e.target.files)}
                    className="w-full text-sm"
                    disabled={uploading}
                  />
                  {form.images && form.images.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">Đã chọn {form.images.length} hình ảnh</div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {form.images.map((img, idx) => (
                          <div key={idx} className="group relative rounded-lg overflow-hidden bg-black/10 dark:bg-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={`preview-${idx}`} className="w-full h-20 object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition text-white text-lg font-bold hover:bg-black/70"
                              disabled={uploading}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-black/10 px-6 py-4 dark:border-white/15 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={uploading}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                onClick={save}
                disabled={uploading}
                className="btn-primary disabled:opacity-50"
              >
                {uploading ? "Đang tải lên..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
