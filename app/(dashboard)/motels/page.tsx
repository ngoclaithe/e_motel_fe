"use client";

import { useState, useEffect, useCallback } from "react";
import type { Motel, AlleyType, SecurityType } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useCurrentRole, useEnsureRole } from "../../../hooks/useAuth";
import { motelService, type MotelFilterParams } from "../../../lib/services/motels";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import { MapPicker } from "../../../components/MapPicker";
import { Home, Info } from "lucide-react";
import Link from "next/link";
import MotelDetail from "../../../components/motel/MotelDetail";

interface MotelFormImage {
  type: 'new';
  url: string;
}

interface MotelFormData {
  id?: string;
  name: string;
  address: string;
  description?: string;
  totalRooms?: number;
  monthlyRent?: number;
  latitude?: number;
  longitude?: number;
  alleyType?: AlleyType;
  alleyWidth?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  securityType?: SecurityType;
  has24hSecurity?: boolean;
  hasWifi?: boolean;
  hasAirConditioner?: boolean;
  hasWashingMachine?: boolean;
  hasKitchen?: boolean;
  hasRooftop?: boolean;
  allowPets?: boolean;
  allowCooking?: boolean;
  electricityCostPerKwh?: number;
  waterCostPerCubicMeter?: number;
  internetCost?: number;
  parkingCost?: number;
  paymentCycleMonths?: number;
  depositMonths?: number;
  contactPhone?: string;
  contactZalo?: string;
  regulations?: string;
  nearbyPlaces?: string[];
  images?: (string | MotelFormImage)[];
  status?: "VACANT" | "OCCUPIED" | "MAINTENANCE";
}

const INITIAL_FORM: MotelFormData = {
  name: "",
  address: "",
  description: "",
  totalRooms: 0,
  monthlyRent: 0,
  latitude: 21.006709,
  longitude: 105.806434,
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
  depositMonths: 0,
  contactPhone: "",
  contactZalo: "",
  regulations: "",
  nearbyPlaces: [],
  images: [],
  status: "VACANT",
};

export default function MotelsPage() {
  useEnsureRole(["LANDLORD", "TENANT"]);
  const role = useCurrentRole();
  const { push } = useToast();

  const [tab, setTab] = useState<'my' | 'all'>(role === "TENANT" ? 'all' : 'my');
  const [motels, setMotels] = useState<Motel[]>([]);
  const [allMotels, setAllMotels] = useState<Motel[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Motel | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<MotelFormData>(INITIAL_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [nearbyPlaceInput, setNearbyPlaceInput] = useState("");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [viewingMotel, setViewingMotel] = useState<Motel | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Pagination and filtering for "All Motels" tab
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<MotelFilterParams>({});

  type BooleanAmenityKey = 'hasWifi' | 'hasAirConditioner' | 'hasWashingMachine' | 'hasKitchen' | 'hasRooftop';
  const AMENITIES: { key: BooleanAmenityKey; label: string }[] = [
    { key: 'hasWifi', label: 'WiFi' },
    { key: 'hasAirConditioner', label: 'Điều hòa' },
    { key: 'hasWashingMachine', label: 'Máy giặt' },
    { key: 'hasKitchen', label: 'Bếp chung' },
    { key: 'hasRooftop', label: 'Sân thượng' },
  ];


  const fetchMyMotels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await motelService.getMyMotels();
      setMotels(response.data || []);
    } catch (error) {
      console.error("Error fetching my motels:", error);
      push({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  const fetchAllMotels = useCallback(async () => {
    try {
      setLoading(true);
      const params: MotelFilterParams = {
        page,
        limit: 12,
        search: searchTerm || undefined,
        ...filters,
      };
      const response = await motelService.listMotels(params);
      setAllMotels(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching all motels:", error);
      push({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filters, push]);

  useEffect(() => {
    if (role === "LANDLORD" && tab === 'my') {
      fetchMyMotels();
    } else if (tab === 'all') {
      fetchAllMotels();
    }
  }, [tab, role, page, searchTerm, filters, fetchMyMotels, fetchAllMotels]);

  const handleImagesChange = (files?: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const newImageFiles = [...imageFiles, ...fileArray];
      setImageFiles(newImageFiles);

      const readers = fileArray.map((file) => {
        return new Promise<MotelFormImage>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ type: 'new', url: String(reader.result) });
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
    const images = form.images || [];
    const image = images[index];

    if (image && typeof image === 'object' && 'type' in image && image.type === 'new') {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }

    setForm((f) => ({
      ...f,
      images: (f.images || []).filter((_, i) => i !== index),
    }));
  };

  const addNearbyPlace = () => {
    if (nearbyPlaceInput.trim()) {
      setForm((f) => ({
        ...f,
        nearbyPlaces: [...(f.nearbyPlaces || []), nearbyPlaceInput.trim()],
      }));
      setNearbyPlaceInput("");
    }
  };

  const removeNearbyPlace = (index: number) => {
    setForm((f) => ({
      ...f,
      nearbyPlaces: (f.nearbyPlaces || []).filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    if (!form.name || !form.address) {
      push({ title: "Lỗi", description: "Vui lòng điền tên và địa chỉ", type: "error" });
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

      const existingImageUrls = (form.images || [])
        .filter((img) => typeof img === 'string')
        .map((img) => img as string);

      const finalImageUrls = [...existingImageUrls, ...imageUrls];

      const payload = {
        name: form.name,
        address: form.address,
        description: form.description || "",
        totalRooms: form.totalRooms || 0,
        latitude: form.latitude || 21.006709,
        longitude: form.longitude || 105.806434,
        alleyType: form.alleyType || "MOTORBIKE",
        alleyWidth: form.alleyWidth || 0,
        hasElevator: form.hasElevator || false,
        hasParking: form.hasParking || false,
        securityType: form.securityType || "NONE",
        has24hSecurity: form.has24hSecurity || false,
        hasWifi: form.hasWifi || false,
        hasAirConditioner: form.hasAirConditioner || false,
        hasWashingMachine: form.hasWashingMachine || false,
        hasKitchen: form.hasKitchen || false,
        hasRooftop: form.hasRooftop || false,
        allowPets: form.allowPets || false,
        allowCooking: form.allowCooking ?? true,
        electricityCostPerKwh: form.electricityCostPerKwh || 0,
        waterCostPerCubicMeter: form.waterCostPerCubicMeter || 0,
        internetCost: form.internetCost || 0,
        parkingCost: form.parkingCost || 0,
        paymentCycleMonths: form.paymentCycleMonths || 1,
        depositMonths: form.depositMonths || 0,
        monthlyRent: form.monthlyRent || 0,
        contactPhone: form.contactPhone || "",
        contactZalo: form.contactZalo || "",
        regulations: form.regulations || "",
        nearbyPlaces: form.nearbyPlaces || [],
        images: finalImageUrls,
        status: mapStatus(form.status),
      };

      if (editing) {
        await motelService.updateMotel(editing.id, payload);
        push({ title: "Cập nhật thành công", type: "success" });
      } else {
        await motelService.createMotel(payload);
        push({ title: "Tạo nhà trọ thành công", type: "success" });
      }

      await fetchMyMotels();
      closeModal();
    } catch (error) {
      console.error(error);
      push({ title: "Lỗi", description: "Không thể lưu nhà trọ", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa nhà trọ này?")) return;
    try {
      await motelService.deleteMotel(id);
      push({ title: "Đã xóa", type: "info" });
      await fetchMyMotels();
    } catch (error) {
      console.error(error);
      push({ title: "Lỗi", description: "Không thể xóa nhà trọ", type: "error" });
    }
  };

  const mapStatus = (status: any) => {
    if (status === "ACTIVE") return "VACANT";
    if (status === "FULL") return "OCCUPIED";
    if (status === "INACTIVE") return "MAINTENANCE";
    return status;
  };

  const openEditModal = (motel: Motel) => {
    setEditing(motel);
    setForm({
      ...motel,
      status: mapStatus(motel.status),
      images: (motel.images || []).map(img => typeof img === 'string' ? img : (img as any).url),
    });
    setImageFiles([]);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setImageFiles([]);
    setNearbyPlaceInput("");
    setForm(INITIAL_FORM);
  };

  const handleImageError = (motelId: string) => {
    setFailedImages((prev) => new Set(prev).add(motelId));
  };

  const displayMotels = tab === 'my' ? motels : allMotels;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Nhà trọ</h1>
        {role === "LANDLORD" && (
          <button
            onClick={() => setOpen(true)}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all"
          >
            Thêm nhà trọ
          </button>
        )}
      </div>

      {/* Tabs */}
      {role === "LANDLORD" && (
        <div className="flex gap-4 border-b border-white/10">
          <button
            onClick={() => {
              setTab('my');
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'my'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Của tôi
          </button>
          <button
            onClick={() => {
              setTab('all');
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'all'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Tất cả
          </button>
        </div>
      )}

      {/* Search and Filter for "All Motels" tab */}
      {tab === 'all' && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl">
          <input
            type="text"
            placeholder="Tìm kiếm nhà trọ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors placeholder-slate-500"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={filters.hasWifi || false}
                onChange={(e) => {
                  setFilters(f => ({ ...f, hasWifi: e.target.checked || undefined }));
                  setPage(1);
                }}
                className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
              />
              WiFi
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={filters.hasParking || false}
                onChange={(e) => {
                  setFilters(f => ({ ...f, hasParking: e.target.checked || undefined }));
                  setPage(1);
                }}
                className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
              />
              Gửi xe
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={filters.allowPets || false}
                onChange={(e) => {
                  setFilters(f => ({ ...f, allowPets: e.target.checked || undefined }));
                  setPage(1);
                }}
                className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
              />
              Thú cưng
            </label>
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur-xl">
          <div className="text-sm text-slate-400">Đang tải...</div>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayMotels.map((m) => (
              <div
                key={m.id}
                onClick={() => setViewingMotel(m)}
                className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 shadow-sm overflow-hidden transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 backdrop-blur-xl flex flex-col"
              >
                <div className="h-40 overflow-hidden bg-black/20 relative">
                  {m.images && m.images.length > 0 && !failedImages.has(m.id) ? (
                    <img
                      src={typeof m.images[0] === 'string' ? m.images[0] : ((m.images[0] as Record<string, unknown>)?.url as string) || ''}
                      alt={m.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(m.id)}
                    />
                  ) : (
                    <div className="text-sm text-slate-500">Không có hình ảnh</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60" />
                </div>
                <div className="p-4 flex flex-col flex-1 relative">
                  <div>
                    <div className="font-medium text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{m.name}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">📍 {m.address}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-400">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.monthlyRent || 0)}
                        <span className="text-[10px] font-normal text-slate-500 ml-1">/tháng</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${((m.status as string) === "VACANT" || (m.status as string) === "ACTIVE") ? "border-green-500/20 bg-green-500/10 text-green-400" :
                        ((m.status as string) === "OCCUPIED" || (m.status as string) === "FULL") ? "border-blue-500/20 bg-blue-500/10 text-blue-400" :
                          "border-red-500/20 bg-red-500/10 text-red-400"
                        }`}>
                        {((m.status as string) === "VACANT" || (m.status as string) === "ACTIVE" || !m.status) && "Đang hoạt động"}
                        {((m.status as string) === "OCCUPIED" || (m.status as string) === "FULL") && "Hết phòng"}
                        {((m.status as string) === "MAINTENANCE" || (m.status as string) === "INACTIVE") && "Tạm ngưng"}
                      </span>
                    </div>
                  </div>
                  {m.totalRooms && (
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                      Tổng {m.totalRooms} phòng
                      {m.rooms && Array.isArray(m.rooms) && (
                        <span className={`ml-1 font-medium ${(m.rooms as any[]).filter(r => r.status === 'VACANT').length > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          ({(m.rooms as any[]).filter(r => r.status === 'VACANT').length} phòng trống)
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    {role === "LANDLORD" && tab === 'my' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(m); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors">Sửa</button>
                        <button onClick={(e) => { e.stopPropagation(); remove(m.id); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">Xóa</button>
                      </>
                    )}
                    {role === "TENANT" && (
                      <div className="text-xs text-indigo-400 font-medium mt-1">
                        Xem chi tiết →
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {displayMotels.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
                {tab === 'my' ? 'Chưa có nhà trọ nào' : 'Không tìm thấy nhà trọ'}
              </div>
            )}
          </div>

          {/* Pagination for "All Motels" tab */}
          {tab === 'all' && totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl">
              <div className="text-sm text-slate-400">
                Trang {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-50 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-50 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {viewingMotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
            <MotelDetail
              motel={viewingMotel}
              onClose={() => setViewingMotel(null)}
            />
          </div>
        </div>
      )}



      {role === "LANDLORD" && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 bg-slate-900 shadow-xl flex flex-col">
            <div className="flex-shrink-0 border-b border-white/10 px-6 py-4 bg-black/20">
              <h2 className="text-lg font-semibold text-white">{editing ? "Cập nhật nhà trọ" : "Thêm nhà trọ"}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Tên nhà trọ <span className="text-red-500">*</span></label>
                      <input
                        value={form.name || ""}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Nhà trọ Sinh Viên Hòa Bình"
                        disabled={uploading}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Trạng thái</label>
                        <select
                          value={form.status || "VACANT"}
                          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          disabled={uploading}
                        >
                          <option value="VACANT" className="bg-slate-900">Đang hoạt động</option>
                          <option value="OCCUPIED" className="bg-slate-900">Hết phòng</option>
                          <option value="MAINTENANCE" className="bg-slate-900">Tạm ngưng</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-300">Giá thuê TB (VNĐ) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={form.monthlyRent || 0}
                          onChange={(e) => setForm((f) => ({ ...f, monthlyRent: Number(e.target.value) }))}
                          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                          placeholder="VD: 3000000"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Địa chỉ <span className="text-red-500">*</span></label>
                      <input
                        value={form.address || ""}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="123 Nguyễn Văn Linh, Phường Hòa Khánh Nam"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Mô tả</label>
                      <textarea
                        value={form.description || ""}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Nhà trọ gần trường, giá rẻ, an ninh tốt, sạch sẽ"
                        rows={2}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                {/* Chi tiết tòa nhà */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">Chi tiết tòa nhà</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Tổng số phòng</label>
                      <input
                        type="number"
                        value={form.totalRooms || 0}
                        onChange={(e) => setForm((f) => ({ ...f, totalRooms: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Loại hẻm</label>
                      <select
                        value={form.alleyType || "MOTORBIKE"}
                        onChange={(e) => setForm((f) => ({ ...f, alleyType: e.target.value as AlleyType }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        disabled={uploading}
                      >
                        <option value="MOTORBIKE" className="bg-slate-900">Hẻm xe máy</option>
                        <option value="CAR" className="bg-slate-900">Hẻm ô tô</option>
                        <option value="BOTH" className="bg-slate-900">Cả hai</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Chiều rộng hẻm (m)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={form.alleyWidth || 0}
                        onChange={(e) => setForm((f) => ({ ...f, alleyWidth: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        disabled={uploading}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer flex-1 text-slate-300 hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={form.hasElevator || false}
                          onChange={(e) => setForm((f) => ({ ...f, hasElevator: e.target.checked }))}
                          className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
                          disabled={uploading}
                        />
                        <span className="text-sm">Có thang máy</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* An toàn & Tiếp cận */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">An toàn & Tiếp cận</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Hệ thống bảo mật</label>
                      <select
                        value={form.securityType || "NONE"}
                        onChange={(e) => setForm((f) => ({ ...f, securityType: e.target.value as SecurityType }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        disabled={uploading}
                      >
                        <option value="NONE" className="bg-slate-900">Không</option>
                        <option value="CAMERA" className="bg-slate-900">Camera</option>
                        <option value="GUARD" className="bg-slate-900">Bảo vệ</option>
                        <option value="BOTH" className="bg-slate-900">Cả hai</option>
                      </select>
                      <label className="mt-2 flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={form.has24hSecurity || false}
                          onChange={(e) => setForm((f) => ({ ...f, has24hSecurity: e.target.checked }))}
                          className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
                          disabled={uploading}
                        />
                        <span className="text-sm">Bảo mật 24/7</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={form.hasParking || false}
                        onChange={(e) => setForm((f) => ({ ...f, hasParking: e.target.checked }))}
                        className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
                        disabled={uploading}
                      />
                      <span className="text-sm">Có chỗ gửi xe</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={form.allowPets || false}
                        onChange={(e) => setForm((f) => ({ ...f, allowPets: e.target.checked }))}
                        className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
                        disabled={uploading}
                      />
                      <span className="text-sm">Cho phép nuôi thú cưng</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={form.allowCooking ?? true}
                        onChange={(e) => setForm((f) => ({ ...f, allowCooking: e.target.checked }))}
                        className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
                        disabled={uploading}
                      />
                      <span className="text-sm">Cho phép nấu ăn</span>
                    </label>
                  </div>
                </div>

                {/* Tiện ích */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">Tiện ích chung</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {AMENITIES.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={Boolean(form[key])}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked } as MotelFormData))}
                          className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-indigo-500"
                          disabled={uploading}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Thông tin liên hệ */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">Thông tin liên hệ</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Số điện thoại</label>
                      <input
                        value={form.contactPhone || ""}
                        onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="0905123456"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-300">Zalo</label>
                      <input
                        value={form.contactZalo || ""}
                        onChange={(e) => setForm((f) => ({ ...f, contactZalo: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="0905123456"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                {/* Chi phí & Điều khoản */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">Chi phí & Điều khoản</h3>
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

                {/* Quy định */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">Quy định nhà trọ</h3>
                  <textarea
                    value={form.regulations || ""}
                    onChange={(e) => setForm((f) => ({ ...f, regulations: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    placeholder="- Không gây ồn sau 22h&#10;- Giữ gìn vệ sinh chung&#10;- Không nuôi thú cưng"
                    rows={3}
                    disabled={uploading}
                  />
                </div>

                {/* Địa điểm lân cận */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">Địa điểm lân cận</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={nearbyPlaceInput}
                      onChange={(e) => setNearbyPlaceInput(e.target.value)}
                      className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                      placeholder="VD: ĐH Bách Khoa 500m"
                      disabled={uploading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addNearbyPlace();
                        }
                      }}
                    />
                    <button
                      onClick={addNearbyPlace}
                      disabled={uploading}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                    >
                      Thêm
                    </button>
                  </div>
                  {form.nearbyPlaces && form.nearbyPlaces.length > 0 && (
                    <div className="space-y-2">
                      {form.nearbyPlaces.map((place, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg bg-black/20 p-2 border border-white/10">
                          <span className="text-sm text-white">{place}</span>
                          <button
                            onClick={() => removeNearbyPlace(idx)}
                            disabled={uploading}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vị trí bản đồ */}
                <div className="border-b border-white/10 pb-4">
                  <h3 className="mb-4 text-sm font-semibold text-white">Vị trí trên bản đồ</h3>
                  <MapPicker
                    latitude={form.latitude || 21.006709}
                    longitude={form.longitude || 105.806434}
                    onSelect={(lat, lng) => {
                      setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
                    }}
                  />
                </div>

                {/* Hình ảnh */}
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-white">Hình ảnh nhà trọ</h3>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImagesChange(e.target.files)}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                    disabled={uploading}
                  />
                  {form.images && form.images.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-2 text-xs font-medium text-slate-400">Đã chọn {form.images.length} hình ảnh</div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {form.images.map((img, idx) => {
                          const imgUrl = typeof img === 'string' ? img : (img && typeof img === 'object' && 'url' in img ? img.url : '');
                          return (
                            <div key={idx} className="group relative rounded-lg overflow-hidden bg-black/20 border border-white/10">
                              <img src={imgUrl} alt={`preview-${idx}`} className="w-full h-20 object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition text-white text-lg font-bold hover:bg-black/70"
                                disabled={uploading}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {editing && editing.rooms && editing.rooms.length > 0 && (
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
                      <Home className="w-4 h-4 text-emerald-400" />
                      Phòng trọ đang liên kết ({editing.rooms.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {editing.rooms.map((room) => (
                        <div key={room.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/10 group/room hover:border-indigo-500/50 transition-all">
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white group-hover/room:text-indigo-400 transition-colors">Phòng {room.number}</div>
                            <div className="text-[10px] text-slate-500">{room.area}m² - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${room.status === 'VACANT' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                              room.status === 'OCCUPIED' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                                'border-red-500/30 bg-red-500/10 text-red-400'
                              }`}>
                              {room.status === 'VACANT' ? 'TRỐNG' : room.status === 'OCCUPIED' ? 'ĐÃ THUÊ' : 'BẢO TRÌ'}
                            </span>
                            <Link
                              href={`${(role as any) === 'ADMIN' ? '/admin' : ''}/rooms?roomId=${room.id}`}
                              className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500/20 transition-all"
                              title="Xem chi tiết quản lý phòng"
                            >
                              <Info className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] text-slate-500 italic">* Để thay đổi liên kết, vui lòng vào mục "Quản lý phòng" để chỉnh sửa từng phòng.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-white/10 px-6 py-4 flex justify-end gap-2 bg-black/20">
              <button
                type="button"
                onClick={closeModal}
                disabled={uploading}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
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
      )}

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
            <img
              src={viewingImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
