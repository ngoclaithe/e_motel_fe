"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Room, RoomStatus, Motel, BathroomType, FurnishingStatus } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { uploadToCloudinary } from "../../../../lib/cloudinary";
import { roomService } from "../../../../lib/services/rooms";
import { motelService } from "../../../../lib/services/motels";
import { Home, Search, Plus, Filter, Edit2, Trash2, Users, Maximize2, Layout, X, Image as ImageIcon, Check, ChevronRight, MapPin } from "lucide-react";

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

export default function AdminRoomsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Đang tải...</div>}>
      <AdminRoomsPageContent />
    </Suspense>
  );
}

function AdminRoomsPageContent() {
  useEnsureRole(["ADMIN"]);
  const { push } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [motels, setMotels] = useState<Motel[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<RoomStatus | "all">("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState<Room | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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
    address: "",
    hasFan: false,
    hasKitchenTable: false,
    lightBulbCount: 0,
    airConditionerCount: 0,
    fanCount: 0,
    waterHeaterCount: 0,
    otherEquipment: "",
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
      const data = await roomService.listAll();
      setRooms(Array.isArray(data) ? data : []);
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
  }, []);

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

      const existingImageUrls = (form.images || []).filter((img) => typeof img === 'string' && img.startsWith('http'));
      const finalImages = [...existingImageUrls, ...imageUrls];

      const basePayload = {
        number: String(form.number),
        area: Number(form.area),
        price: Number(form.price),
        status: form.status,
        amenities: form.amenities || [],
        images: finalImages,
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
        address: form.address ?? "",
        hasFan: form.hasFan ?? false,
        hasKitchenTable: form.hasKitchenTable ?? false,
        lightBulbCount: Number(form.lightBulbCount) ?? 0,
        airConditionerCount: Number(form.airConditionerCount) ?? 0,
        fanCount: Number(form.fanCount) ?? 0,
        waterHeaterCount: Number(form.waterHeaterCount) ?? 0,
        otherEquipment: form.otherEquipment ?? "",
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
    setForm({
      ...room,
      images: (room.images || []).map(img => typeof img === 'string' ? img : (img as any).url)
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
    });
  };

  const toggleAmenity = (amenity: string) => {
    setForm((f) => ({
      ...f,
      amenities: (f.amenities || []).includes(amenity)
        ? (f.amenities || []).filter((a) => a !== amenity)
        : [...(f.amenities || []), amenity],
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Home className="h-8 w-8 text-indigo-500" />
            Quản lý phòng
          </h1>
          <p className="mt-1 text-sm text-slate-400">Xem và quản lý tất cả các phòng trong hệ thống</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-500" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus | "all")}
              className="appearance-none rounded-xl border border-white/10 bg-slate-900/40 pl-10 pr-10 py-2.5 text-sm text-white focus:border-indigo-500/50 backdrop-blur-xl outline-none transition-all cursor-pointer"
              disabled={loading}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="VACANT">Còn trống</option>
              <option value="OCCUPIED">Đang thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="group relative overflow-hidden rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-600 active:scale-95 flex items-center gap-2"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            Thêm phòng mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="text-slate-400 font-medium animate-pulse">Đang tải danh sách phòng...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRoom(r)}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col"
            >
              {/* Image Section with Price Overlay */}
              <div className="relative h-48 overflow-hidden bg-slate-800">
                {r.images && r.images.length > 0 ? (
                  <img
                    src={(r.images[0] as any)?.url || String(r.images[0] || '')}
                    alt={`room-${r.id}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-600">
                    <Layout className="h-12 w-12 opacity-20" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                {/* Price Display */}
                <div className="absolute bottom-4 left-6">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Giá thuê</div>
                  <div className="text-xl font-black text-emerald-400">
                    {Number(r.price).toLocaleString()}
                    <span className="text-[10px] font-normal text-slate-300 ml-1">đ/tháng</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 ${r.status === "VACANT" ? "bg-emerald-500/20 text-emerald-400" :
                    r.status === "OCCUPIED" ? "bg-indigo-500/20 text-indigo-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${r.status === "VACANT" ? "bg-emerald-500" :
                      r.status === "OCCUPIED" ? "bg-indigo-500" :
                        "bg-amber-500"
                      }`}></span>
                    {r.status === "VACANT" && "Còn trống"}
                    {r.status === "OCCUPIED" && "Đang thuê"}
                    {r.status === "MAINTENANCE" && "Bảo trì"}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-1 relative">
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-12 translate-x-12 rounded-full bg-indigo-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">Phòng {r.number}</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mb-0.5">Diện tích</div>
                      <div className="text-xs font-bold text-white">{r.area}m²</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mb-0.5">Tầng</div>
                      <div className="text-xs font-bold text-white">{r.floor || 1}</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mb-0.5">Sức chứa</div>
                      <div className="text-xs font-bold text-white">{r.maxOccupancy || 1}</div>
                    </div>
                  </div>

                  {r.amenities && r.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {r.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] text-slate-400">
                          {amenity}
                        </span>
                      ))}
                      {r.amenities.length > 3 && (
                        <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 text-[9px] font-bold">
                          +{r.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(r); }}
                    className="flex-1 rounded-xl bg-indigo-500/10 px-4 py-2.5 text-[10px] font-bold text-indigo-400 transition-all hover:bg-indigo-500 hover:text-white border border-indigo-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3 w-3" />
                    Sửa phòng
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(r.id); }}
                    className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 transition-all hover:bg-red-500 hover:text-white border border-red-500/20 flex items-center justify-center"
                    title="Xóa phòng"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-12 text-center backdrop-blur-xl">
              <Home className="mx-auto h-12 w-12 text-slate-600 opacity-20 mb-4" />
              <div className="text-lg font-medium text-slate-400">Không có phòng phù hợp</div>
              <p className="text-sm text-slate-500">Thử thay đổi bộ lọc hoặc nhà trọ</p>
            </div>
          )}
        </div>
      )}

      {/* View Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedRoom(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-2xl flex flex-col">
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-indigo-500/10 blur-3xl"></div>

            <div className="relative flex-shrink-0 border-b border-white/5 px-8 py-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm">
                  {selectedRoom.number}
                </span>
                Chi tiết phòng {selectedRoom.number}
              </h2>
              <button
                onClick={() => setSelectedRoom(null)}
                className="group rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5 text-slate-400 group-hover:text-white" />
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {((selectedRoom.images || []) as any[]).map((img, idx) => {
                        const imgUrl = typeof img === 'string' ? img : img.url;
                        return (
                          <div
                            key={idx}
                            onClick={() => setViewingImage(imgUrl)}
                            className={`group relative cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-white/5 ${idx === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}
                          >
                            <img src={imgUrl} alt={`img-${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Phóng to</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-700 opacity-20" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white/5 p-5 border border-white/5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Địa chỉ cụ thể</div>
                      <div className="text-white text-sm font-medium flex gap-2">
                        <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        {selectedRoom.address || "Chưa cập nhật địa chỉ"}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-5 border border-white/5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mô tả</div>
                      <div className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 whitespace-pre-wrap min-h-[60px]">
                        {selectedRoom.description || "Chưa có mô tả cho phòng này."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-end justify-between mb-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Giá phòng</div>
                      <div className="text-3xl font-black text-emerald-400">{Number(selectedRoom.price).toLocaleString()}đ<span className="text-sm font-normal text-slate-500">/tháng</span></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-white/5 p-3 border border-white/5 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Diện tích</div>
                        <div className="text-sm font-bold text-white">{selectedRoom.area} m²</div>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3 border border-white/5 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Vị trí</div>
                        <div className="text-sm font-bold text-white">Tầng {selectedRoom.floor || 1}</div>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3 border border-white/5 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Trạng thái</div>
                        <div className={`text-[10px] font-bold ${selectedRoom.status === 'VACANT' ? 'text-green-400' :
                          selectedRoom.status === 'OCCUPIED' ? 'text-blue-400' : 'text-orange-400'
                          }`}>
                          {selectedRoom.status === 'VACANT' && "TRỐNG"}
                          {selectedRoom.status === 'OCCUPIED' && "ĐANG THUÊ"}
                          {selectedRoom.status === "MAINTENANCE" && "BẢO TRÌ"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {(selectedRoom as any).motel && (
                    <div className="rounded-2xl bg-indigo-500/5 p-4 border border-indigo-500/10 flex items-center justify-between">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Layout className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{(selectedRoom as any).motel.name}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{(selectedRoom as any).motel.address}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Tiện nghi & Thiết bị</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300">Điều hòa: {selectedRoom.airConditionerCount || 0}</span>
                      <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300">Quạt: {selectedRoom.fanCount || 0}</span>
                      <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300">Nóng lạnh: {selectedRoom.waterHeaterCount || 0}</span>
                      <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300">Bóng đèn: {selectedRoom.lightBulbCount || 0}</span>
                      {selectedRoom.hasKitchenTable && (
                        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300">Bàn bếp</span>
                      )}
                      {(selectedRoom.amenities || []).map((a) => (
                        <span key={a} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300">
                          {a}
                        </span>
                      ))}
                    </div>
                    {selectedRoom.otherEquipment && (
                      <div className="mt-2 text-[10px] text-slate-500 italic">Khác: {selectedRoom.otherEquipment}</div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Chi phí dịch vụ</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-slate-500 text-[10px] uppercase font-bold mb-1">Điện</span>
                        <span className="text-white font-black text-sm">{selectedRoom.electricityCostPerKwh?.toLocaleString() ?? '0'} đ/kWh</span>
                      </div>
                      <div className="flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-slate-500 text-[10px] uppercase font-bold mb-1">Nước</span>
                        <span className="text-white font-black text-sm">{selectedRoom.waterCostPerCubicMeter?.toLocaleString() ?? '0'} đ/m³</span>
                      </div>
                      <div className="flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-slate-500 text-[10px] uppercase font-bold mb-1">Internet</span>
                        <span className="text-white font-black text-sm">{selectedRoom.internetCost?.toLocaleString() ?? '0'} đ/tháng</span>
                      </div>
                      <div className="flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-slate-500 text-[10px] uppercase font-bold mb-1">Gửi xe</span>
                        <span className="text-white font-black text-sm">{selectedRoom.parkingCost?.toLocaleString() ?? '0'} đ/tháng</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Có sẵn từ: <span className="text-slate-300 font-bold">{selectedRoom.availableFrom ? new Date(selectedRoom.availableFrom).toLocaleDateString('vi-VN') : 'Hiện tại'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex-shrink-0 border-t border-white/5 px-8 py-6 flex justify-end">
              <button
                onClick={() => setSelectedRoom(null)}
                className="rounded-2xl bg-white/5 border border-white/10 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-2xl flex flex-col">
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-indigo-500/10 blur-3xl"></div>

            <div className="relative flex-shrink-0 border-b border-white/5 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">{editing ? "Cập nhật thông tin phòng" : "Thêm phòng mới"}</h2>
              <p className="text-slate-400 text-sm mt-1">Vui lòng điền đầy đủ thông tin để hoàn thiện hồ sơ phòng trọ</p>
            </div>

            <div className="relative flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
              <div className="space-y-12">
                {/* 01. Thông tin cơ bản */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">01</span>
                    Thông tin cơ bản & Vị trí
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Số phòng <span className="text-red-500">*</span></label>
                      <input
                        value={form.number || ""}
                        onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                        placeholder="Ví dụ: 301, P.01..."
                        disabled={uploading}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Thuộc nhà trọ <span className="text-red-500">*</span></label>
                      <select
                        value={form.motelId || ""}
                        onChange={(e) => setForm((f) => ({ ...f, motelId: e.target.value || undefined }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all appearance-none"
                        disabled={uploading}
                      >
                        <option value="">Chọn một nhà trọ trong danh sách</option>
                        {motels.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Địa chỉ cụ thể (nếu khác địa chỉ nhà trọ)</label>
                      <input
                        value={form.address || ""}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                        placeholder="VD: Số 123, Ngõ 45, Đường ABC..."
                        disabled={uploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Giá thuê (đ/tháng) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={form.price ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-emerald-400 font-bold focus:border-emerald-500/50 outline-none transition-all"
                        disabled={uploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Diện tích (m²) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={form.area ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, area: Number(e.target.value) }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all"
                        disabled={uploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Số tầng</label>
                      <input
                        type="number"
                        value={form.floor || 1}
                        onChange={(e) => setForm((f) => ({ ...f, floor: Number(e.target.value) }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-500/50 outline-none transition-all"
                        disabled={uploading}
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-indigo-400" />
                        Thuộc nhà trọ (Liên kết)
                      </label>
                      <select
                        value={form.motelId || ""}
                        onChange={(e) => setForm((f) => ({ ...f, motelId: e.target.value || undefined }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-4 text-white focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                        disabled={uploading}
                      >
                        <option value="" className="bg-slate-900">-- Không liên kết --</option>
                        {motels.map((m) => (
                          <option key={m.id} value={m.id} className="bg-slate-900">
                            {m.name} ({m.address})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 italic ml-1">* Chỉ có thể liên kết với nhà trọ bạn sở hữu và còn trống suất phòng.</p>
                    </div>
                  </div>
                </section>

                {/* 02. Chi tiết & Tiện ích */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">02</span>
                    Chi tiết & Tiện ích phòng
                  </h3>
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Phòng tắm</label>
                          <select
                            value={form.bathroomType || "PRIVATE"}
                            onChange={(e) => setForm((f) => ({ ...f, bathroomType: e.target.value as BathroomType }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                          >
                            <option value="PRIVATE" className="bg-slate-900">Khép kín (Riêng)</option>
                            <option value="SHARED" className="bg-slate-900">Chung</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Nội thất</label>
                          <select
                            value={form.furnishingStatus || "PARTIALLY_FURNISHED"}
                            onChange={(e) => setForm((f) => ({ ...f, furnishingStatus: e.target.value as FurnishingStatus }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                          >
                            <option value="UNFURNISHED" className="bg-slate-900">Trống (Không nội thất)</option>
                            <option value="PARTIALLY_FURNISHED" className="bg-slate-900">Cơ bản</option>
                            <option value="FULLY_FURNISHED" className="bg-slate-900">Đầy đủ nội thất</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Số người tối đa</label>
                          <input
                            type="number"
                            value={form.maxOccupancy || 1}
                            onChange={(e) => setForm((f) => ({ ...f, maxOccupancy: Number(e.target.value) }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Dự kiến trống từ</label>
                          <input
                            type="date"
                            value={form.availableFrom || ""}
                            onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Trạng thái phòng</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['VACANT', 'OCCUPIED', 'MAINTENANCE'] as RoomStatus[]).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, status: s }))}
                              className={`rounded-xl px-4 py-2.5 text-[10px] font-bold border transition-all ${form.status === s
                                ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                }`}
                            >
                              {s === 'VACANT' ? 'CÒN TRỐNG' : s === 'OCCUPIED' ? 'ĐANG THUÊ' : 'BẢO TRÌ'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-slate-300 ml-1">Các tiện ích khác</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {COMMON_AMENITIES.map((name) => (
                          <label key={name} className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={(form.amenities || []).includes(name)}
                              onChange={(e) => {
                                const am = form.amenities || [];
                                setForm(f => ({
                                  ...f,
                                  amenities: e.target.checked ? [...am, name] : am.filter(x => x !== name)
                                }));
                              }}
                              className="hidden"
                            />
                            <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${(form.amenities || []).includes(name) ? "bg-indigo-500 border-indigo-500" : "border-white/20"
                              }`}>
                              {(form.amenities || []).includes(name) && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                            </div>
                            <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors">{name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 03. Thiết bị & Hình ảnh */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">03</span>
                    Trang thiết bị & Hình ảnh
                  </h3>
                  <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'hasAirConditioner', countKey: 'airConditionerCount', label: 'Điều hòa' },
                          { key: 'hasFan', countKey: 'fanCount', label: 'Quạt' },
                          { key: 'hasWaterHeater', countKey: 'waterHeaterCount', label: 'Nóng lạnh' },
                          { key: 'hasKitchenTable', label: 'Bàn bếp (kê sẵn)' },
                          { key: 'hasBalcony', label: 'Ban công' },
                          { key: 'hasWindow', label: 'Cửa sổ' },
                          { key: 'hasKitchen', label: 'Khu vực bếp' },
                          { key: 'hasRefrigerator', label: 'Tủ lạnh' },
                          { key: 'hasWashingMachine', label: 'Máy giặt' },
                          { key: 'hasWardrobe', label: 'Tủ quần áo' },
                          { key: 'hasBed', label: 'Giường ngủ' },
                          { key: 'hasDesk', label: 'Bàn làm việc' },
                        ].map((item) => (
                          <div key={item.key} className="flex flex-col gap-2 p-4 rounded-3xl border border-white/5 bg-white/5">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={!!(form as any)[item.key]}
                                onChange={(e) => setForm(f => {
                                  const update: any = { [item.key]: e.target.checked };
                                  if (item.countKey && e.target.checked && !(f as any)[item.countKey]) {
                                    update[item.countKey] = 1;
                                  }
                                  return { ...f, ...update };
                                })}
                                className="hidden"
                              />
                              <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${(form as any)[item.key] ? "bg-indigo-500 border-indigo-500" : "border-white/20 group-hover:border-white/40"
                                }`}>
                                {(form as any)[item.key] && <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
                              </div>
                              <span className="text-sm font-medium text-slate-300">{item.label}</span>
                            </label>
                            {item.countKey && (form as any)[item.key] && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Số lượng:</span>
                                <input
                                  type="number"
                                  value={(form as any)[item.countKey] || 0}
                                  onChange={(e) => setForm(f => ({ ...f, [item.countKey as string]: Number(e.target.value) }))}
                                  className="w-16 rounded-lg bg-black/20 border border-white/10 px-2 py-1 text-white text-xs text-center outline-none focus:border-indigo-500/50"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Số lượng bóng đèn</label>
                          <input
                            type="number"
                            value={form.lightBulbCount || 0}
                            onChange={(e) => setForm(f => ({ ...f, lightBulbCount: Number(e.target.value) }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Thiết bị khác</label>
                          <textarea
                            value={form.otherEquipment || ""}
                            onChange={(e) => setForm(f => ({ ...f, otherEquipment: e.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none resize-none h-20 text-sm"
                            placeholder="Liệt kê các trang thiết bị khác nếu có..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 space-y-6">
                        <div className="text-center space-y-2">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                          <div className="text-sm font-bold text-white">Hình Ảnh Minh Họa</div>
                          <p className="text-xs text-slate-500">Tải lên tối đa 5 ảnh phòng</p>
                        </div>
                        <input
                          type="file"
                          id="room-images"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImagesChange(e.target.files)}
                          className="hidden"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="room-images"
                          className="block text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                        >
                          Chọn ảnh
                        </label>

                        {form.images && form.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-3">
                            {form.images.map((img, idx) => (
                              <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx)}
                                  className="absolute inset-0 flex items-center justify-center bg-red-500/60 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                  disabled={uploading}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Mô tả ngắn</label>
                        <textarea
                          value={form.description || ""}
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                          className="w-full rounded-[2rem] border border-white/10 bg-slate-800/50 px-6 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all resize-none min-h-[140px] text-sm leading-relaxed"
                          placeholder="Mô tả ưu điểm của phòng..."
                          disabled={uploading}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 04. Chính sách & Chi phí */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">04</span>
                    Cần lưu ý & Chi phí dịch vụ
                  </h3>
                  <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Chính sách thuê phòng</div>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { key: 'allowPets', label: 'Cho phép nuôi thú cưng' },
                          { key: 'allowCooking', label: 'Được phép nấu ăn trong phòng' },
                          { key: 'allowOppositeGender', label: 'Cho phép người khác giới ở cùng' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${(form as any)[item.key] ? "bg-emerald-500 border-emerald-500" : "border-white/20 group-hover:border-white/40"
                                }`}>
                                {(form as any)[item.key] && <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
                              </div>
                              <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={!!(form as any)[item.key]}
                              onChange={(e) => setForm(f => ({ ...f, [item.key]: e.target.checked }))}
                              className="hidden"
                            />
                            <div className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-white transition-colors">
                              {(form as any)[item.key] ? 'BẬT' : 'TẮT'}
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Chu kỳ đóng tiền (tháng)</label>
                          <input type="number" value={form.paymentCycleMonths || 1} onChange={(e) => setForm(f => ({ ...f, paymentCycleMonths: Number(e.target.value) }))} className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Tiền cọc (tháng)</label>
                          <input type="number" value={form.depositMonths || 0} onChange={(e) => setForm(f => ({ ...f, depositMonths: Number(e.target.value) }))} className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5">
                      <div className="text-xs font-bold text-white uppercase tracking-widest text-center mb-6">Chi tiết giá dịch vụ (VNĐ)</div>
                      <div className="space-y-4">
                        {[
                          { key: 'electricityCostPerKwh', label: 'Tiền điện (đ/kWh)' },
                          { key: 'waterCostPerCubicMeter', label: 'Tiền nước (đ/m³)' },
                          { key: 'internetCost', label: 'Internet (đ/tháng)' },
                          { key: 'parkingCost', label: 'Gửi xe (đ/tháng)' },
                          { key: 'serviceFee', label: 'Phí dịch vụ khác (nếu có)' },
                        ].map((item) => (
                          <div key={item.key} className="relative">
                            <label className="absolute -top-2 left-6 px-2 bg-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</label>
                            <input
                              type="number"
                              value={(form as any)[item.key] || 0}
                              onChange={(e) => setForm(f => ({ ...f, [item.key]: Number(e.target.value) }))}
                              className="w-full rounded-2xl bg-black/20 border border-white/10 px-8 py-4 text-white font-mono text-sm outline-none focus:border-indigo-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="relative flex-shrink-0 border-t border-white/5 px-8 py-6 flex justify-end gap-4 bg-slate-900/80 backdrop-blur-xl">
              <button
                type="button"
                onClick={closeModal}
                disabled={uploading}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 px-10 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
              >
                Hủy bỏ
              </button>
              <button
                onClick={save}
                disabled={uploading}
                className="rounded-[1.5rem] bg-indigo-600 px-12 py-4 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center gap-3 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    Đang lưu dữ liệu...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    {editing ? "Lưu thay đổi" : "Tạo phòng ngay"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {viewingImage && (
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
            <img src={viewingImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
