"use client";

import { useState, useEffect } from "react";
import type { Motel, AlleyType, SecurityType } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { motelService } from "../../../../lib/services/motels";
import { uploadToCloudinary } from "../../../../lib/cloudinary";
import { Building2, Search, Trash2, MapPin, Home, User, Plus, X, ChevronLeft, ChevronRight, Check, Phone, MessageCircle, AlertCircle, Maximize2, Info, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import MotelDetail from "../../../../components/motel/MotelDetail";

export default function AdminMotelsPage() {
  useEnsureRole(["ADMIN"]);
  const { push } = useToast();
  const [motels, setMotels] = useState<Motel[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewingMotel, setViewingMotel] = useState<Motel | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Motel | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [form, setForm] = useState<Partial<Motel>>({
    name: "",
    address: "",
    description: "",
    totalRooms: 0,
    monthlyRent: 0,
    alleyType: "MOTORBIKE",
    alleyWidth: 0,
    hasElevator: false,
    hasParking: false,
    securityType: "NONE",
    has24hSecurity: false,
    hasWifi: false,
    hasAirConditioner: false,
    hasWashingMachine: false,
    hasKitchen: false,
    hasRooftop: false,
    allowPets: false,
    allowCooking: true,
    electricityCostPerKwh: 0,
    waterCostPerCubicMeter: 0,
    internetCost: 0,
    parkingCost: 0,
    paymentCycleMonths: 1,
    depositMonths: 1,
    contactPhone: "",
    contactZalo: "",
    regulations: "",
    nearbyPlaces: [],
    images: [],
  });

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setImageFiles([]);
    setForm({
      name: "",
      address: "",
      description: "",
      totalRooms: 0,
      monthlyRent: 0,
      alleyType: "MOTORBIKE",
      alleyWidth: 0,
      hasElevator: false,
      hasParking: false,
      securityType: "NONE",
      has24hSecurity: false,
      hasWifi: false,
      hasAirConditioner: false,
      hasWashingMachine: false,
      hasKitchen: false,
      hasRooftop: false,
      allowPets: false,
      allowCooking: true,
      electricityCostPerKwh: 0,
      waterCostPerCubicMeter: 0,
      internetCost: 0,
      parkingCost: 0,
      paymentCycleMonths: 1,
      depositMonths: 1,
      contactPhone: "",
      contactZalo: "",
      regulations: "",
      nearbyPlaces: [],
      images: [],
    });
  };

  const openAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (motel: Motel) => {
    setEditing(motel);
    setForm({
      ...motel,
      images: (motel.images || []).map(img => typeof img === 'string' ? img : (img as any).url)
    });
    setOpen(true);
  };

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

  const save = async () => {
    if (!form.name || !form.address) {
      push({ title: "Lỗi", description: "Vui lòng điền tên và địa chỉ nhà trọ", type: "error" });
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
        name: form.name,
        address: form.address,
        description: form.description || "",
        totalRooms: Number(form.totalRooms) || 0,
        monthlyRent: Number(form.monthlyRent) || 0,
        latitude: Number(form.latitude) || 21.006709,
        longitude: Number(form.longitude) || 105.806434,
        alleyType: form.alleyType || "MOTORBIKE",
        alleyWidth: Number(form.alleyWidth) || 0,
        hasElevator: Boolean(form.hasElevator),
        hasParking: Boolean(form.hasParking),
        securityType: form.securityType || "NONE",
        has24hSecurity: Boolean(form.has24hSecurity),
        hasWifi: Boolean(form.hasWifi),
        hasAirConditioner: Boolean(form.hasAirConditioner),
        hasWashingMachine: Boolean(form.hasWashingMachine),
        hasKitchen: Boolean(form.hasKitchen),
        hasRooftop: Boolean(form.hasRooftop),
        allowPets: Boolean(form.allowPets),
        allowCooking: Boolean(form.allowCooking),
        electricityCostPerKwh: Number(form.electricityCostPerKwh) || 0,
        waterCostPerCubicMeter: Number(form.waterCostPerCubicMeter) || 0,
        internetCost: Number(form.internetCost) || 0,
        parkingCost: Number(form.parkingCost) || 0,
        paymentCycleMonths: Number(form.paymentCycleMonths) || 1,
        depositMonths: Number(form.depositMonths) || 0,
        contactPhone: form.contactPhone || "",
        contactZalo: form.contactZalo || "",
        regulations: form.regulations || "",
        nearbyPlaces: Array.isArray(form.nearbyPlaces) ? form.nearbyPlaces : [],
        images: finalImages,
        status: form.status || "VACANT",
      };

      if (editing) {
        await motelService.updateMotel(editing.id, basePayload as any);
        push({ title: "Cập nhật thành công", type: "success" });
      } else {
        await motelService.createMotel(basePayload as any);
        push({ title: "Tạo nhà trọ thành công", type: "success" });
      }

      closeModal();
      await fetchMotels();
    } catch (e: any) {
      push({ title: "Lỗi", description: e?.message || "Không thể lưu thông tin", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchMotels();
  }, [page, query]);

  const fetchMotels = async () => {
    try {
      setLoading(true);
      const response = await motelService.listMotels({
        page,
        limit: 12,
        search: query || undefined,
      });
      setMotels(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching motels:", error);
      push({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa nhà trọ này?")) return;
    try {
      await motelService.deleteMotel(id);
      push({ title: "Đã xóa", type: "info" });
      await fetchMotels();
    } catch (error: any) {
      console.error(error);
      push({ title: "Lỗi", description: error?.message || "Không thể xóa nhà trọ", type: "error" });
    }
  };

  const handleImageError = (motelId: string) => {
    setFailedImages((prev) => new Set(prev).add(motelId));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-indigo-500" />
            Quản lý nhà trọ
          </h1>
          <p className="mt-1 text-sm text-slate-400">Xem và quản lý tất cả nhà trọ trong hệ thống</p>
        </div>
        <button
          onClick={openAdd}
          className="group relative flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="h-5 w-5" />
          <span className="relative">Thêm nhà trọ</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          disabled={loading}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/40 pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all backdrop-blur-xl outline-none"
        />
      </div>

      {loading && (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="text-slate-400 font-medium animate-pulse">Đang tải dữ liệu...</div>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {motels.map((m) => (
              <div
                key={m.id}
                onClick={() => setViewingMotel(m)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-slate-800">
                  {m.images && m.images.length > 0 && !failedImages.has(m.id) ? (
                    <img
                      src={typeof m.images[0] === 'string' ? m.images[0] : ((m.images[0] as Record<string, unknown>)?.url as string) || ''}
                      alt={m.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => handleImageError(m.id)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-600">
                      <Building2 className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

                  {/* Status Overlay */}
                  <div className="absolute top-4 right-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-lg ${((m.status as string) === "VACANT" || (m.status as string) === "ACTIVE" || !m.status) ? "border-green-500/20 bg-green-500/20 text-green-400" :
                      ((m.status as string) === "OCCUPIED" || (m.status as string) === "FULL") ? "border-blue-500/20 bg-blue-500/20 text-blue-400" :
                        "border-red-500/20 bg-red-500/20 text-red-400"
                      }`}>
                      {((m.status as string) === "VACANT" || (m.status as string) === "ACTIVE" || !m.status) && "Đang hoạt động"}
                      {((m.status as string) === "OCCUPIED" || (m.status as string) === "FULL") && "Hết phòng"}
                      {((m.status as string) === "MAINTENANCE" || (m.status as string) === "INACTIVE") && "Tạm ngưng"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1 relative">
                  <div className="absolute right-0 top-0 h-24 w-24 -translate-y-12 translate-x-12 rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"></div>

                  <div className="relative">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight line-clamp-1">{m.name}</h3>
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-indigo-500/70" />
                      <span className="line-clamp-1">{m.address}</span>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Giá trung bình</div>
                        <div className="text-lg font-black text-emerald-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.monthlyRent || 0)}
                          <span className="text-[10px] font-normal text-slate-500 ml-1">/tháng</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <Home className="h-3.5 w-3.5" />
                        </div>
                        <span>{m.totalRooms || 0} phòng
                          {m.rooms && Array.isArray(m.rooms) && (
                            <span className={`ml-1 font-bold ${(m.rooms as any[]).filter(r => r.status === 'VACANT').length > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                              ({(m.rooms as any[]).filter(r => r.status === 'VACANT').length} trống)
                            </span>
                          )}
                        </span>
                      </div>
                      {(m as any).owner && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">
                            {(m as any).owner.firstName || (m as any).owner.lastName
                              ? `${(m as any).owner.firstName || ""} ${(m as any).owner.lastName || ""}`.trim()
                              : (m as any).owner.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewingMotel(m); }}
                      className="rounded-xl border border-white/10 bg-white/5 h-10 w-10 text-slate-300 transition-all hover:bg-white/10 hover:text-white flex items-center justify-center border border-white/10"
                      title="Chi tiết"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                      className="flex-1 rounded-xl bg-indigo-600/10 px-4 py-2.5 text-[10px] font-bold text-indigo-400 transition-all hover:bg-indigo-600 hover:text-white flex items-center justify-center gap-2 border border-indigo-500/20"
                    >
                      <span className="relative">CHỈNH SỬA</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(m.id); }}
                      className="rounded-xl bg-red-500/10 h-10 w-10 text-red-500 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center border border-red-500/20"
                      title="Xóa nhà trọ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {motels.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-12 text-center backdrop-blur-xl">
                <Building2 className="mx-auto h-12 w-12 text-slate-600 opacity-20 mb-4" />
                <div className="text-lg font-medium text-slate-400">Không tìm thấy nhà trọ</div>
                <p className="text-sm text-slate-500">Thử tìm kiếm với từ khóa khác</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
              <div className="text-sm text-slate-400">
                Trang <span className="font-bold text-white">{page}</span> / {totalPages}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-all hover:bg-white/10 disabled:opacity-30 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-all hover:bg-white/10 disabled:opacity-30 flex items-center gap-2"
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Detail Modal */}
      {viewingMotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
            <MotelDetail
              motel={viewingMotel}
              onClose={() => setViewingMotel(null)}
            />
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
              <h2 className="text-2xl font-bold text-white">{editing ? "Cập nhật nhà trọ" : "Thêm nhà trọ mới"}</h2>
              <p className="text-slate-400 text-sm mt-1">Vui lòng điền đầy đủ thông tin để quản lý nhà trọ hiệu quả hơn</p>
            </div>

            <div className="relative flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
              <div className="space-y-12">
                {/* 01. Thông tin cơ bản */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">01</span>
                    Thông tin cơ bản & Vị trí
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Tên nhà trọ <span className="text-red-500">*</span></label>
                      <input
                        value={form.name || ""}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                        placeholder="Ví dụ: E-Motel Cầu Giấy..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                      <input
                        value={form.address || ""}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                        placeholder="Số nhà, tên đường, phường/xã..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Giá thuê TB (đ/tháng)</label>
                        <input
                          type="number"
                          value={form.monthlyRent || 0}
                          onChange={(e) => setForm((f) => ({ ...f, monthlyRent: Number(e.target.value) }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-emerald-400 font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Tổng số phòng</label>
                        <input
                          type="number"
                          value={form.totalRooms || 0}
                          onChange={(e) => setForm((f) => ({ ...f, totalRooms: Number(e.target.value) }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Mô tả ngắn</label>
                      <input
                        value={form.description || ""}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-600 outline-none"
                        placeholder="Mô tả nhanh về nhà trọ..."
                      />
                    </div>
                  </div>
                </section>

                {/* 02. Cơ sở vật chất tòa nhà */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">02</span>
                    Đặc điểm & Cơ sở vật chất
                  </h3>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Loại ngõ</label>
                          <select
                            value={form.alleyType || "MOTORBIKE"}
                            onChange={(e) => setForm(f => ({ ...f, alleyType: e.target.value as AlleyType }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                          >
                            <option value="MOTORBIKE" className="bg-slate-900">Xe máy</option>
                            <option value="CAR" className="bg-slate-900">Ô tô</option>
                            <option value="BOTH" className="bg-slate-900">Cả hai</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Độ rộng ngõ (m)</label>
                          <input
                            type="number"
                            value={form.alleyWidth || 0}
                            onChange={(e) => setForm(f => ({ ...f, alleyWidth: Number(e.target.value) }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Loại an ninh</label>
                          <select
                            value={form.securityType || "NONE"}
                            onChange={(e) => setForm(f => ({ ...f, securityType: e.target.value as SecurityType }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none"
                          >
                            <option value="NONE" className="bg-slate-900">Tự quản</option>
                            <option value="CAMERA" className="bg-slate-900">Camera</option>
                            <option value="GUARD" className="bg-slate-900">Có bảo vệ</option>
                            <option value="BOTH" className="bg-slate-900">Cả hai</option>
                          </select>
                        </div>
                        <div className="pt-8 flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.has24hSecurity || false}
                              onChange={(e) => setForm(f => ({ ...f, has24hSecurity: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-3 text-sm font-medium text-slate-300">Bảo vệ 24/7</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { key: 'hasElevator', label: 'Thang máy' },
                        { key: 'hasParking', label: 'Bãi đỗ xe' },
                        { key: 'hasWifi', label: 'WiFi free' },
                        { key: 'hasAirConditioner', label: 'Điều hòa' },
                        { key: 'hasWashingMachine', label: 'Máy giặt' },
                        { key: 'hasKitchen', label: 'Bếp chung' },
                        { key: 'hasRooftop', label: 'Sân thượng' },
                        { key: 'allowPets', label: 'Nuôi thú cưng' },
                        { key: 'allowCooking', label: 'Được nấu ăn' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={!!(form as any)[item.key]}
                            onChange={(e) => setForm(f => ({ ...f, [item.key]: e.target.checked }))}
                            className="hidden"
                          />
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${(form as any)[item.key] ? "bg-indigo-500 border-indigo-500" : "border-white/20 group-hover:border-white/40"
                            }`}>
                            {(form as any)[item.key] && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase transition-colors">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 03. Chi tiết chi phí */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">03</span>
                    Chi tiết chi phí & Điều khoản
                  </h3>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Tiền điện (đ/kWh)</label>
                        <input type="number" value={form.electricityCostPerKwh || 0} onChange={(e) => setForm(f => ({ ...f, electricityCostPerKwh: Number(e.target.value) }))} className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Tiền nước (đ/m³)</label>
                        <input type="number" value={form.waterCostPerCubicMeter || 0} onChange={(e) => setForm(f => ({ ...f, waterCostPerCubicMeter: Number(e.target.value) }))} className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Tiền Internet (đ/tháng)</label>
                        <input type="number" value={form.internetCost || 0} onChange={(e) => setForm(f => ({ ...f, internetCost: Number(e.target.value) }))} className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Phí gửi xe (đ/tháng)</label>
                        <input type="number" value={form.parkingCost || 0} onChange={(e) => setForm(f => ({ ...f, parkingCost: Number(e.target.value) }))} className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Chu kỳ đóng (tháng)</label>
                        <input type="number" value={form.paymentCycleMonths || 1} onChange={(e) => setForm(f => ({ ...f, paymentCycleMonths: Number(e.target.value) }))} className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Số tháng cọc</label>
                        <input type="number" value={form.depositMonths || 1} onChange={(e) => setForm(f => ({ ...f, depositMonths: Number(e.target.value) }))} className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 04. Liên hệ & Quy định */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span className="h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px]">04</span>
                    Liên hệ, Truyền thông & Nội quy
                  </h3>
                  <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Số điện thoại liên hệ</label>
                          <input value={form.contactPhone || ""} onChange={(e) => setForm(f => ({ ...f, contactPhone: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none" placeholder="VD: 0912xxxxxx" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Link Zalo / SĐT Zalo</label>
                          <input value={form.contactZalo || ""} onChange={(e) => setForm(f => ({ ...f, contactZalo: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white outline-none" placeholder="VD: zalo.me/..." />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Nội quy nhà trọ</label>
                        <textarea
                          value={form.regulations || ""}
                          onChange={(e) => setForm(f => ({ ...f, regulations: e.target.value }))}
                          className="w-full rounded-3xl border border-white/10 bg-slate-800/50 px-4 py-4 text-white outline-none resize-none h-32 text-sm"
                          placeholder="Liệt kê các nội quy quan trọng như giờ giấc, vệ sinh..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Địa điểm lân cận (cách nhau bởi dấu phẩy)</label>
                        <textarea
                          value={(form.nearbyPlaces || []).join(", ")}
                          onChange={(e) => setForm(f => ({ ...f, nearbyPlaces: e.target.value.split(",").map(p => p.trim()).filter(p => !!p) }))}
                          className="w-full rounded-3xl border border-white/10 bg-slate-800/50 px-4 py-4 text-white outline-none resize-none h-20 text-sm"
                          placeholder="VD: ĐH Quốc Gia, BigC Thăng Long, Công viên Nghĩa Đô..."
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-slate-300 ml-1">Hình ảnh nhà trọ (Tối đa 8 ảnh)</label>
                      <div className="p-6 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 space-y-4">
                        <input
                          type="file"
                          id="motel-images"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImagesChange(e.target.files)}
                          className="hidden"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="motel-images"
                          className="flex flex-col items-center justify-center py-10 rounded-3xl border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
                        >
                          <Plus className="h-10 w-10 text-slate-600 group-hover:text-indigo-400 mb-2" />
                          <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-widest">Nhấn để chọn ảnh</span>
                        </label>

                        {form.images && form.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-3 mt-4">
                            {form.images.map((img, idx) => (
                              <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
                                <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx)}
                                  className="absolute inset-0 flex items-center justify-center bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                  disabled={uploading}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {editing && editing.rooms && editing.rooms.length > 0 && (
                  <section className="border-t border-white/5 pt-12">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400 mb-6">
                      <span className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-[10px]">05</span>
                      Phòng trọ đang liên kết ({editing.rooms.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {editing.rooms.map((room) => (
                        <div key={room.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-white/5 group/room hover:border-emerald-500/30 transition-all">
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white group-hover/room:text-emerald-400 transition-colors">Phòng {room.number}</div>
                            <div className="text-[10px] text-slate-500">{room.area}m² - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${room.status === 'VACANT' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                              room.status === 'OCCUPIED' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                                'border-red-500/30 bg-red-500/10 text-red-400'
                              }`}>
                              {room.status === 'VACANT' ? 'TRỐNG' : room.status === 'OCCUPIED' ? 'ĐÃ THUÊ' : 'BẢO TRÌ'}
                            </span>
                            <Link
                              href={`/admin/rooms?roomId=${room.id}`}
                              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-emerald-500/20 transition-all"
                              title="Xem chi tiết quản lý phòng"
                            >
                              <Info className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[10px] text-slate-500 italic">* Để thay đổi liên kết, vui lòng vào mục "Quản lý phòng" để chỉnh sửa từng phòng.</p>
                  </section>
                )}
              </div>
            </div>

            <div className="relative flex-shrink-0 border-t border-white/5 px-8 py-6 flex justify-end gap-4 bg-slate-900/80 backdrop-blur-xl">
              <button
                type="button"
                onClick={closeModal}
                disabled={uploading}
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30"
              >
                Hủy bỏ
              </button>
              <button
                onClick={save}
                disabled={uploading}
                className="rounded-2xl bg-indigo-600 px-10 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editing ? "Lưu thay đổi" : "Thêm nhà trọ mới"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {viewingImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setViewingImage(null)}></div>
          <img src={viewingImage} alt="Full size" className="relative max-w-full max-h-full object-contain rounded-3xl shadow-2xl" />
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-8 right-8 rounded-full bg-white/10 p-4 transition-transform hover:scale-110"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
