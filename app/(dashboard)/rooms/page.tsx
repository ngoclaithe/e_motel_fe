"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { roomService, motelService } from "../../../lib/services";
import { Home, Search, Plus, Filter, Edit2, Trash2, Users, Maximize2, Layout, X, Image as ImageIcon, Check, ChevronRight, MapPin } from "lucide-react";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole, useCurrentRole } from "../../../hooks/useAuth";
import { uploadToCloudinary } from "../../../lib/cloudinary";

import type { Room, RoomStatus, Motel, BathroomType, FurnishingStatus } from "../../../types";

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
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải...</div>}>
      <RoomsPageContent />
    </Suspense>
  );
}

function RoomsPageContent() {
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
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [form, setForm] = useState<Partial<Room>>({
    number: "",
    address: "",
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
    hasFan: false,
    hasKitchenTable: false,
    lightBulbCount: 0,
    airConditionerCount: 0,
    fanCount: 0,
    waterHeaterCount: 0,
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

  // Handle roomId from URL to auto-open modal
  const searchParams = useSearchParams();
  useEffect(() => {
    const roomId = searchParams.get('roomId');
    if (roomId && rooms.length > 0) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        openEditModal(room);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, rooms.length]);

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
        address: String(form.address || ""),
        area: Number(form.area),
        price: Number(form.price),
        amenities: form.amenities || [],
        images: [...(form.images || []), ...imageUrls],
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
        airConditionerCount: form.airConditionerCount ?? 0,
        fanCount: form.fanCount ?? 0,
        waterHeaterCount: form.waterHeaterCount ?? 0,
        otherEquipment: form.otherEquipment ?? "",
        motelId: form.motelId,
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
    // Map image objects to URL strings to prevent "[object Object]" issues in the form
    const imageUrls = (room.images || []).map((img: any) =>
      typeof img === 'string' ? img : img.url
    );
    setForm({
      ...room,
      images: imageUrls
    });
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
      airConditionerCount: 0,
      fanCount: 0,
      waterHeaterCount: 0,
      otherEquipment: "",
      motelId: undefined,
    });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-white">Phòng</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewFilter('all')}
              className={`rounded-lg px-3 py-1 text-sm transition-colors ${viewFilter === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setViewFilter('mine')}
              disabled={!(role === "LANDLORD" || role === "ADMIN")}
              className={`rounded-lg px-3 py-1 text-sm transition-colors ${viewFilter === 'mine' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${!(role === "LANDLORD" || role === "ADMIN") ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Của tôi
            </button>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RoomStatus | "all")}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all" className="bg-slate-900">Tất cả</option>
            <option value="VACANT" className="bg-slate-900">Trống</option>
            <option value="OCCUPIED" className="bg-slate-900">Đang thuê</option>
            <option value="MAINTENANCE" className="bg-slate-900">Bảo trì</option>
          </select>
          {(role === "LANDLORD" || role === "ADMIN") && (
            <button onClick={() => setOpen(true)} className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all">Thêm phòng</button>
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
              className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">Phòng {r.number}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400 font-medium">📍 {r.address || "Chưa có địa chỉ"}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{r.area} m² • {Number(r.price).toLocaleString()}đ</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${r.status === "VACANT" ? "border-green-500/20 bg-green-500/10 text-green-400" :
                  r.status === "OCCUPIED" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" :
                    "border-orange-500/20 bg-orange-500/10 text-orange-400"
                  }`}>
                  {r.status === "VACANT" && "Trống"}
                  {r.status === "OCCUPIED" && "Đang thuê"}
                  {r.status === "MAINTENANCE" && "Bảo trì"}
                </span>
              </div>
              {r.images && r.images.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-lg border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={(r.images[0] as any)?.url || String(r.images[0] || '')} alt={`room-${r.id}`} className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              )}
              {r.amenities && r.amenities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                      {amenity}
                    </span>
                  ))}
                  {r.amenities.length > 3 && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                      +{r.amenities.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="text-xs text-slate-500">Tầng {r.floor ?? '-'}</div>
                <div className="text-xs text-slate-500">Sức chứa {r.maxOccupancy ?? '-'}</div>
              </div>

              {(role === "LANDLORD" || role === "ADMIN") && (
                <div className="mt-3 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(r); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors">Sửa</button>
                  <button onClick={(e) => { e.stopPropagation(); remove(r.id); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">Xóa</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Chi tiết phòng {selectedRoom.number}</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {((selectedRoom.images || []) as any[]).slice(0, 4).map((img, idx) => {
                        const imgUrl = typeof img === 'string' ? img : img.url;
                        return (
                          <div
                            key={idx}
                            onClick={() => setViewingImage(imgUrl)}
                            className={`group relative cursor-pointer overflow-hidden rounded-lg ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgUrl} alt={`img-${idx}`} className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${idx === 0 ? 'h-48' : 'h-24'}`} />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                              <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-all">Xem</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-sm">Không có ảnh</div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-slate-400">Giá thuê</div>
                    <div className="text-2xl font-bold text-indigo-400">{Number(selectedRoom.price).toLocaleString()}đ</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-400">Diện tích</div>
                      <div className="text-base text-white">{selectedRoom.area} m²</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-400">Trạng thái</div>
                      <div className={`text-base font-medium ${selectedRoom.status === 'VACANT' ? 'text-green-400' :
                        selectedRoom.status === 'OCCUPIED' ? 'text-blue-400' : 'text-orange-400'
                        }`}>
                        {selectedRoom.status === 'VACANT' && "Trống"}
                        {selectedRoom.status === 'OCCUPIED' && "Đang thuê"}
                        {selectedRoom.status === "MAINTENANCE" && "Bảo trì"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3 text-sm text-slate-300 border border-white/10">
                    <span className="text-slate-500 block mb-1 text-xs uppercase tracking-wider font-semibold">Địa chỉ</span>
                    <span className="text-white font-medium">{selectedRoom.address || "Chưa có địa chỉ cụ thể"}</span>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3 text-sm text-slate-300 border border-white/10">
                    <span className="text-slate-500 block mb-1 text-xs uppercase tracking-wider font-semibold">Mô tả</span>
                    {selectedRoom.description || "Chưa có mô tả"}
                  </div>

                  {(selectedRoom as any).motel && (
                    <div className="rounded-xl bg-white/5 p-3 text-sm border border-white/10">
                      <div className="font-medium text-indigo-300">{(selectedRoom as any).motel.name}</div>
                      <div className="text-slate-400 text-xs mt-1">{(selectedRoom as any).motel.address}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium text-slate-400 mb-2">Tiện ích & Thiết bị</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/10">Điều hòa: {selectedRoom.airConditionerCount || 0}</span>
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/10">Quạt: {selectedRoom.fanCount || 0}</span>
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/10">Nóng lạnh: {selectedRoom.waterHeaterCount || 0}</span>
                      <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/10">Bóng đèn: {selectedRoom.lightBulbCount || 0}</span>
                      {selectedRoom.hasKitchenTable && (
                        <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/10">Bàn bếp</span>
                      )}
                      {selectedRoom.otherEquipment && (
                        <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/10">{selectedRoom.otherEquipment}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400 border-t border-white/10 pt-3">
                    <div>Điện: <span className="text-slate-200">{selectedRoom.electricityCostPerKwh ?? '-'} đ/kWh</span></div>
                    <div>Nước: <span className="text-slate-200">{selectedRoom.waterCostPerCubicMeter ?? '-'} đ/m³</span></div>
                    <div>Internet: <span className="text-slate-200">{selectedRoom.internetCost ?? '-'} đ/tháng</span></div>
                    <div>Gửi xe: <span className="text-slate-200">{selectedRoom.parkingCost ?? '-'} đ/tháng</span></div>
                  </div>

                  <div className="text-xs text-slate-500 pt-2">
                    <div>Có sẵn từ: {selectedRoom.availableFrom || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 border-t border-white/10 px-6 py-4 flex justify-end gap-2 bg-black/20">
              <button onClick={() => setSelectedRoom(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )
      }

      {
        (role === "LANDLORD" || role === "ADMIN") && open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col">
              <div className="flex-shrink-0 border-b border-white/10 px-6 py-4 bg-black/20">
                <h2 className="text-lg font-semibold text-white">{editing ? "Cập nhật phòng" : "Thêm phòng"}</h2>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                  <div className="border-b border-black/10 pb-4 dark:border-white/15">
                    <h3 className="mb-4 text-sm font-semibold">Thông tin cơ bản</h3>
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-slate-300">Địa chỉ cụ thể</label>
                      <input
                        value={form.address || ""}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Số 10, ngõ 123, đường Xuân Thủy..."
                        disabled={uploading}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Số phòng <span className="text-red-500">*</span></label>
                        <input
                          value={form.number || ""}
                          onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          placeholder="301"
                          disabled={uploading}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Diện tích (m²) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={form.area ?? 0}
                          onChange={(e) => setForm((f) => ({ ...f, area: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Tầng</label>
                        <input
                          type="number"
                          value={form.floor || 1}
                          onChange={(e) => setForm((f) => ({ ...f, floor: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Giá (đ) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={form.price ?? 0}
                          onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Trạng thái</label>
                        <select
                          value={form.status || "VACANT"}
                          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RoomStatus }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        >
                          <option value="VACANT" className="bg-slate-900">Trống</option>
                          <option value="OCCUPIED" className="bg-slate-900">Đang thuê</option>
                          <option value="MAINTENANCE" className="bg-slate-900">Bảo trì</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Có sẵn từ (ngày)</label>
                        <input
                          type="date"
                          value={form.availableFrom || ""}
                          onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors icon-white"
                          disabled={uploading}
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Layout className="w-4 h-4 text-indigo-400" />
                          Thuộc nhà trọ (Liên kết)
                        </label>
                        <select
                          value={form.motelId || ""}
                          onChange={(e) => setForm((f) => ({ ...f, motelId: e.target.value || undefined }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                          disabled={uploading}
                        >
                          <option value="" className="bg-slate-900">-- Không liên kết --</option>
                          {motels.map((m) => (
                            <option key={m.id} value={m.id} className="bg-slate-900">
                              {m.name} ({m.address})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                          * Chỉ có thể liên kết với nhà trọ bạn sở hữu và còn trống suất phòng theo giới hạn totalRooms của nhà trọ đó.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="mb-1 block text-sm font-medium text-slate-300">Mô tả</label>
                      <textarea
                        value={form.description || ""}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
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
                        <label className="mb-1 block text-sm font-medium text-slate-300">Kiểu phòng tắm</label>
                        <select
                          value={form.bathroomType || "PRIVATE"}
                          onChange={(e) => setForm((f) => ({ ...f, bathroomType: e.target.value as BathroomType }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        >
                          <option value="PRIVATE" className="bg-slate-900">Riêng</option>
                          <option value="SHARED" className="bg-slate-900">Chung</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Tình trạng nội thất</label>
                        <select
                          value={form.furnishingStatus || "PARTIALLY_FURNISHED"}
                          onChange={(e) => setForm((f) => ({ ...f, furnishingStatus: e.target.value as FurnishingStatus }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        >
                          <option value="UNFURNISHED" className="bg-slate-900">Không có nội thất</option>
                          <option value="PARTIALLY_FURNISHED" className="bg-slate-900">Nội thất cơ bản</option>
                          <option value="FULLY_FURNISHED" className="bg-slate-900">Đầy đủ nội thất</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Sức chứa tối đa (người)</label>
                        <input
                          type="number"
                          value={form.maxOccupancy || 1}
                          onChange={(e) => setForm((f) => ({ ...f, maxOccupancy: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        { key: "hasWaterHeater", label: "Nóng lạnh" },
                        { key: "hasAirConditioner", label: "Điều hòa" },
                        { key: "hasFan", label: "Quạt" },
                        { key: "hasBalcony", label: "Ban công" },
                        { key: "hasWindow", label: "Cửa sổ" },
                        { key: "hasKitchen", label: "Bếp" },
                        { key: "hasKitchenTable", label: "Bàn bếp" },
                        { key: "hasRefrigerator", label: "Tủ lạnh" },
                        { key: "hasWashingMachine", label: "Máy giặt" },
                        { key: "hasWardrobe", label: "Tủ quần áo" },
                        { key: "hasBed", label: "Giường" },
                        { key: "hasDesk", label: "Bàn làm việc" },
                        { key: "hasWifi", label: "WiFi" },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={(form as Record<string, unknown>)[key] as boolean || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setForm((f) => {
                                const newForm = { ...f, [key]: checked };
                                // Logic tự động gán số lượng = 1 khi tick chọn
                                if (key === "hasAirConditioner" && checked && !f.airConditionerCount) newForm.airConditionerCount = 1;
                                if (key === "hasWaterHeater" && checked && !f.waterHeaterCount) newForm.waterHeaterCount = 1;
                                if (key === "hasFan" && checked && !f.fanCount) newForm.fanCount = 1;
                                return newForm;
                              });
                            }}
                            className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                            disabled={uploading}
                          />
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-black/10 pb-4 dark:border-white/15">
                    <h3 className="mb-4 text-sm font-semibold">Chính sách phòng</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.allowPets || false}
                          onChange={(e) => setForm((f) => ({ ...f, allowPets: e.target.checked }))}
                          className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                          disabled={uploading}
                        />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Cho phép nuôi thú cưng</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.allowCooking ?? true}
                          onChange={(e) => setForm((f) => ({ ...f, allowCooking: e.target.checked }))}
                          className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                          disabled={uploading}
                        />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Cho phép nấu ăn</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.allowOppositeGender || false}
                          onChange={(e) => setForm((f) => ({ ...f, allowOppositeGender: e.target.checked }))}
                          className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                          disabled={uploading}
                        />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Cho phép giới tính khác</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-b border-black/10 pb-4 dark:border-white/15">
                    <h3 className="mb-4 text-sm font-semibold">Chi tiết thiết bị</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Số lượng điều hòa</label>
                        <input
                          type="number"
                          min="0"
                          value={form.airConditionerCount ?? 0}
                          onChange={(e) => setForm((f) => ({ ...f, airConditionerCount: Number(e.target.value) }))}
                          className={`w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors ${!form.hasAirConditioner ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={uploading || !form.hasAirConditioner}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Số lượng quạt</label>
                        <input
                          type="number"
                          min="0"
                          value={form.fanCount ?? 0}
                          onChange={(e) => setForm((f) => ({ ...f, fanCount: Number(e.target.value) }))}
                          className={`w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors ${!form.hasFan ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={uploading || !form.hasFan}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Số lượng bình nóng lạnh</label>
                        <input
                          type="number"
                          min="0"
                          value={form.waterHeaterCount ?? 0}
                          onChange={(e) => setForm((f) => ({ ...f, waterHeaterCount: Number(e.target.value) }))}
                          className={`w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors ${!form.hasWaterHeater ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={uploading || !form.hasWaterHeater}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Số lượng bóng đèn</label>
                        <input
                          type="number"
                          min="0"
                          value={form.lightBulbCount ?? 0}
                          onChange={(e) => setForm((f) => ({ ...f, lightBulbCount: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="mb-1 block text-sm font-medium text-slate-300">Thiết bị khác</label>
                      <textarea
                        value={form.otherEquipment || ""}
                        onChange={(e) => setForm((f) => ({ ...f, otherEquipment: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Ví dụ: Tủ lạnh mini, lò vi sóng..."
                        rows={2}
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="border-b border-black/10 pb-4 dark:border-white/15">
                    <h3 className="mb-4 text-sm font-semibold">Chi phí & Điều khoản</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Giá điện (đ/kWh)</label>
                        <input
                          type="number"
                          value={form.electricityCostPerKwh || 0}
                          onChange={(e) => setForm((f) => ({ ...f, electricityCostPerKwh: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Giá nước (đ/m³)</label>
                        <input
                          type="number"
                          value={form.waterCostPerCubicMeter || 0}
                          onChange={(e) => setForm((f) => ({ ...f, waterCostPerCubicMeter: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Giá internet (đ/tháng)</label>
                        <input
                          type="number"
                          value={form.internetCost || 0}
                          onChange={(e) => setForm((f) => ({ ...f, internetCost: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Giá gửi xe (đ/tháng)</label>
                        <input
                          type="number"
                          value={form.parkingCost || 0}
                          onChange={(e) => setForm((f) => ({ ...f, parkingCost: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Phí dịch vụ (đ/tháng)</label>
                        <input
                          type="number"
                          value={form.serviceFee || 0}
                          onChange={(e) => setForm((f) => ({ ...f, serviceFee: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Chu kỳ thanh toán (tháng)</label>
                        <input
                          type="number"
                          value={form.paymentCycleMonths || 1}
                          onChange={(e) => setForm((f) => ({ ...f, paymentCycleMonths: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Tiền cọc (tháng)</label>
                        <input
                          type="number"
                          value={form.depositMonths || 0}
                          onChange={(e) => setForm((f) => ({ ...f, depositMonths: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
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
                      className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all"
                      disabled={uploading}
                    />
                    {form.images && form.images.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-2 text-xs font-medium text-slate-400">Đã chọn {form.images.length} hình ảnh</div>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {form.images.map((img, idx) => (
                            <div key={idx} className="group relative rounded-lg overflow-hidden bg-black/40 border border-white/10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt={`preview-${idx}`} className="w-full h-20 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
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

              <div className="flex-shrink-0 border-t border-black/10 px-6 py-4 dark:border-white/15 flex justify-end gap-2 bg-black/20">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={uploading}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={save}
                  disabled={uploading}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all"
                >
                  {uploading ? "Đang tải lên..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )
      }
      {
        viewingImage && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setViewingImage(null)}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <button
                onClick={() => setViewingImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-red-400 transition-colors"
              >
                ✕ Đóng
              </button>
              <img
                src={viewingImage}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )
      }
    </div >
  );
}
