"use client";

import { useState, useEffect, useCallback } from "react";
import type { Motel, AlleyType, SecurityType } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useCurrentRole, useEnsureRole } from "../../../hooks/useAuth";
import { motelService, type MotelFilterParams } from "../../../lib/services/motels";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import { MapPicker } from "../../../components/MapPicker";

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
  contactEmail?: string;
  contactZalo?: string;
  regulations?: string;
  nearbyPlaces?: string[];
  images?: (string | MotelFormImage)[];
}

const INITIAL_FORM: MotelFormData = {
  name: "",
  address: "",
  description: "",
  totalRooms: 0,
  latitude: 10.7769,
  longitude: 106.6966,
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
  contactEmail: "",
  contactZalo: "",
  regulations: "",
  nearbyPlaces: [],
  images: [],
};

export default function MotelsPage() {
  useEnsureRole(["landlord", "tenant"]);
  const role = useCurrentRole();
  const { push } = useToast();

  const [tab, setTab] = useState<'my' | 'all'>(role === 'tenant' ? 'all' : 'my');
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

  // Pagination and filtering for "All Motels" tab
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<MotelFilterParams>({});

  useEffect(() => {
    if (role === 'landlord' && tab === 'my') {
      fetchMyMotels();
    } else if (tab === 'all') {
      fetchAllMotels();
    }
  }, [tab, role, page, searchTerm, filters, fetchMyMotels, fetchAllMotels]);

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

      const finalImageUrls = imageUrls.length > 0 ? imageUrls : existingImageUrls;

      const payload = {
        name: form.name,
        address: form.address,
        description: form.description || "",
        totalRooms: form.totalRooms || 0,
        latitude: form.latitude || 10.7769,
        longitude: form.longitude || 106.6966,
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
        contactPhone: form.contactPhone || "",
        contactEmail: form.contactEmail || "",
        contactZalo: form.contactZalo || "",
        regulations: form.regulations || "",
        nearbyPlaces: form.nearbyPlaces || [],
        images: finalImageUrls,
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

  const openEditModal = (motel: Motel) => {
    setEditing(motel);
    setForm({
      ...motel,
      images: (motel.images || []).map(img => img),
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nhà trọ</h1>
        {role === 'landlord' && (
          <button onClick={() => setOpen(true)} disabled={loading} className="btn-primary disabled:opacity-50">
            Thêm nhà trọ
          </button>
        )}
      </div>

      {/* Tabs */}
      {role === 'landlord' && (
        <div className="flex gap-4 border-b border-black/10 dark:border-white/15">
          <button
            onClick={() => {
              setTab('my');
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'my'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Của tôi
          </button>
          <button
            onClick={() => {
              setTab('all');
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'all'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Tất cả
          </button>
        </div>
      )}

      {/* Search and Filter for "All Motels" tab */}
      {tab === 'all' && (
        <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40">
          <input
            type="text"
            placeholder="Tìm kiếm nhà trọ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filters.hasWifi || false}
                onChange={(e) => {
                  setFilters(f => ({ ...f, hasWifi: e.target.checked || undefined }));
                  setPage(1);
                }}
                className="rounded"
              />
              WiFi
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filters.hasParking || false}
                onChange={(e) => {
                  setFilters(f => ({ ...f, hasParking: e.target.checked || undefined }));
                  setPage(1);
                }}
                className="rounded"
              />
              Gửi xe
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filters.allowPets || false}
                onChange={(e) => {
                  setFilters(f => ({ ...f, allowPets: e.target.checked || undefined }));
                  setPage(1);
                }}
                className="rounded"
              />
              Thú cưng
            </label>
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Đang tải...</div>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayMotels.map((m) => (
              <div key={m.id} className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden dark:border-white/10 dark:bg-black/40 flex flex-col">
                <div className="h-40 overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  {m.images && m.images.length > 0 && !failedImages.has(m.id) ? (
                    <img
                      src={typeof m.images[0] === 'string' ? m.images[0] : ((m.images[0] as Record<string, unknown>)?.url as string) || ''}
                      alt={m.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(m.id)}
                    />
                  ) : (
                    <div className="text-sm text-zinc-400">Không có hình ảnh</div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-zinc-500">{m.address}</div>
                  </div>
                  {m.totalRooms && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      Tổng phòng: {m.totalRooms}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    {role === 'landlord' && tab === 'my' && (
                      <>
                        <button onClick={() => openEditModal(m)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Sửa</button>
                        <button onClick={() => remove(m.id)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
                      </>
                    )}
                    {role === 'tenant' && (
                      <button onClick={() => setViewingMotel(m)} className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xem chi tiết</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {displayMotels.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
                {tab === 'my' ? 'Chưa có nhà trọ nào' : 'Không tìm thấy nhà trọ'}
              </div>
            )}
          </div>

          {/* Pagination for "All Motels" tab */}
          {tab === 'all' && totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Trang {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {viewingMotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-black/40 flex flex-col">
            <div className="flex-shrink-0 border-b border-black/10 px-6 py-4 dark:border-white/15 flex justify-between items-center">
              <h2 className="text-lg font-semibold">{viewingMotel.name}</h2>
              <button onClick={() => setViewingMotel(null)} className="text-zinc-500 hover:text-black dark:hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {viewingMotel.images && viewingMotel.images.length > 0 && (
                  <div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {viewingMotel.images.slice(0, 4).map((img, idx) => {
                        const imgUrl = typeof img === 'string' ? img : ((img as Record<string, unknown>)?.url as string) || '';
                        return (
                          <div key={idx} className="rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 h-32">
                            <img src={imgUrl} alt={`${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-2 text-sm font-semibold">Địa chỉ</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{viewingMotel.address}</div>
                </div>

                {viewingMotel.description && (
                  <div>
                    <div className="mb-2 text-sm font-semibold">Mô tả</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">{viewingMotel.description}</div>
                  </div>
                )}

                {viewingMotel.totalRooms && (
                  <div>
                    <div className="mb-2 text-sm font-semibold">Tổng phòng</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">{viewingMotel.totalRooms}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {viewingMotel.hasWifi && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ WiFi</span>
                    </div>
                  )}
                  {viewingMotel.hasParking && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Gửi xe</span>
                    </div>
                  )}
                  {viewingMotel.hasAirConditioner && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Điều hòa</span>
                    </div>
                  )}
                  {viewingMotel.hasWashingMachine && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Máy giặt</span>
                    </div>
                  )}
                  {viewingMotel.hasKitchen && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Bếp chung</span>
                    </div>
                  )}
                  {viewingMotel.hasRooftop && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Sân thượng</span>
                    </div>
                  )}
                  {viewingMotel.allowPets && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Cho phép thú cưng</span>
                    </div>
                  )}
                  {viewingMotel.allowCooking && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✓ Cho phép nấu ăn</span>
                    </div>
                  )}
                </div>

                {(viewingMotel.electricityCostPerKwh || viewingMotel.waterCostPerCubicMeter || viewingMotel.internetCost) && (
                  <div className="border-t border-black/10 pt-4 dark:border-white/15">
                    <div className="mb-3 text-sm font-semibold">Chi phí</div>
                    <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {viewingMotel.electricityCostPerKwh && <div>Điện: {viewingMotel.electricityCostPerKwh.toLocaleString()}đ/kWh</div>}
                      {viewingMotel.waterCostPerCubicMeter && <div>Nước: {viewingMotel.waterCostPerCubicMeter.toLocaleString()}đ/m³</div>}
                      {viewingMotel.internetCost && <div>Internet: {viewingMotel.internetCost.toLocaleString()}đ/tháng</div>}
                      {viewingMotel.parkingCost && <div>Gửi xe: {viewingMotel.parkingCost.toLocaleString()}đ/tháng</div>}
                    </div>
                  </div>
                )}

                {viewingMotel.nearbyPlaces && viewingMotel.nearbyPlaces.length > 0 && (
                  <div className="border-t border-black/10 pt-4 dark:border-white/15">
                    <div className="mb-3 text-sm font-semibold">Địa điểm lân cận</div>
                    <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {viewingMotel.nearbyPlaces.map((place, idx) => (
                        <div key={idx}>• {place}</div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingMotel.regulations && (
                  <div className="border-t border-black/10 pt-4 dark:border-white/15">
                    <div className="mb-3 text-sm font-semibold">Quy định</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line">{viewingMotel.regulations}</div>
                  </div>
                )}

                {(viewingMotel.contactPhone || viewingMotel.contactEmail || viewingMotel.contactZalo) && (
                  <div className="border-t border-black/10 pt-4 dark:border-white/15">
                    <div className="mb-3 text-sm font-semibold">Thông tin liên hệ</div>
                    <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {viewingMotel.contactPhone && <div>SĐT: {viewingMotel.contactPhone}</div>}
                      {viewingMotel.contactEmail && <div>Email: {viewingMotel.contactEmail}</div>}
                      {viewingMotel.contactZalo && <div>Zalo: {viewingMotel.contactZalo}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-black/10 px-6 py-4 dark:border-white/15 flex justify-end">
              <button
                onClick={() => setViewingMotel(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {role === 'landlord' && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-black/40 flex flex-col">
            <div className="flex-shrink-0 border-b border-black/10 px-6 py-4 dark:border-white/15">
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật nhà trọ" : "Thêm nhà trọ"}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Tên nhà trọ <span className="text-red-500">*</span></label>
                      <input
                        value={form.name || ""}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        placeholder="Nhà trọ Sinh Vi��n Hòa Bình"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Địa chỉ <span className="text-red-500">*</span></label>
                      <input
                        value={form.address || ""}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        placeholder="123 Nguyễn Văn Linh, Phường Hòa Khánh Nam"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Mô tả</label>
                      <textarea
                        value={form.description || ""}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        placeholder="Nhà trọ g���n trường, giá rẻ, an ninh tốt, sạch sẽ"
                        rows={2}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                {/* Chi tiết tòa nhà */}
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Chi tiết tòa nhà</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Tổng số phòng</label>
                      <input
                        type="number"
                        value={form.totalRooms || 0}
                        onChange={(e) => setForm((f) => ({ ...f, totalRooms: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Loại hẻm</label>
                      <select
                        value={form.alleyType || "MOTORBIKE"}
                        onChange={(e) => setForm((f) => ({ ...f, alleyType: e.target.value as AlleyType }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      >
                        <option value="MOTORBIKE">Hẻm xe máy</option>
                        <option value="CAR">Hẻm ô tô</option>
                        <option value="BOTH">Cả hai</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Chiều rộng hẻm (m)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={form.alleyWidth || 0}
                        onChange={(e) => setForm((f) => ({ ...f, alleyWidth: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={form.hasElevator || false}
                          onChange={(e) => setForm((f) => ({ ...f, hasElevator: e.target.checked }))}
                          className="rounded"
                          disabled={uploading}
                        />
                        <span className="text-sm">Có thang máy</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* An toàn & Tiếp cận */}
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">An toàn & Tiếp cận</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Hệ thống bảo mật</label>
                      <select
                        value={form.securityType || "NONE"}
                        onChange={(e) => setForm((f) => ({ ...f, securityType: e.target.value as SecurityType }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        disabled={uploading}
                      >
                        <option value="NONE">Không</option>
                        <option value="CAMERA">Camera</option>
                        <option value="GUARD">Bảo vệ</option>
                        <option value="BOTH">Cả hai</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={form.has24hSecurity || false}
                          onChange={(e) => setForm((f) => ({ ...f, has24hSecurity: e.target.checked }))}
                          className="rounded"
                          disabled={uploading}
                        />
                        <span className="text-sm">Bảo mật 24/7</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hasParking || false}
                        onChange={(e) => setForm((f) => ({ ...f, hasParking: e.target.checked }))}
                        className="rounded"
                        disabled={uploading}
                      />
                      <span className="text-sm">Có chỗ g���i xe</span>
                    </label>
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
                      <span className="text-sm">Cho ph��p nấu ăn</span>
                    </label>
                  </div>
                </div>

                {/* Tiện ích */}
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Tiện ích chung</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      { key: "hasWifi", label: "WiFi" },
                      { key: "hasAirConditioner", label: "Điều hòa" },
                      { key: "hasWashingMachine", label: "Máy giặt" },
                      { key: "hasKitchen", label: "Bếp chung" },
                      { key: "hasRooftop", label: "Sân thượng" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(form as Record<string, unknown>)[key] as boolean || false}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked } as MotelFormData))}
                          className="rounded"
                          disabled={uploading}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Thông tin liên hệ */}
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Thông tin liên hệ</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
                      <input
                        value={form.contactPhone || ""}
                        onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        placeholder="0905123456"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={form.contactEmail || ""}
                        onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        placeholder="chutro@example.com"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Zalo</label>
                      <input
                        value={form.contactZalo || ""}
                        onChange={(e) => setForm((f) => ({ ...f, contactZalo: e.target.value }))}
                        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                        placeholder="0905123456"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                {/* Chi phí & Điều khoản */}
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

                {/* Quy định */}
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Quy định nhà trọ</h3>
                  <textarea
                    value={form.regulations || ""}
                    onChange={(e) => setForm((f) => ({ ...f, regulations: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    placeholder="- Không gây ồn sau 22h&#10;- Giữ gìn vệ sinh chung&#10;- Không nuôi thú cưng"
                    rows={3}
                    disabled={uploading}
                  />
                </div>

                {/* Địa điểm lân cận */}
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Địa điểm lân cận</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={nearbyPlaceInput}
                      onChange={(e) => setNearbyPlaceInput(e.target.value)}
                      className="flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
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
                      className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10 disabled:opacity-50"
                    >
                      Thêm
                    </button>
                  </div>
                  {form.nearbyPlaces && form.nearbyPlaces.length > 0 && (
                    <div className="space-y-2">
                      {form.nearbyPlaces.map((place, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg bg-black/5 p-2 dark:bg-white/10">
                          <span className="text-sm">{place}</span>
                          <button
                            onClick={() => removeNearbyPlace(idx)}
                            disabled={uploading}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vị trí bản đồ */}
                <div className="border-b border-black/10 pb-4 dark:border-white/15">
                  <h3 className="mb-4 text-sm font-semibold">Vị trí trên bản đồ</h3>
                  <MapPicker
                    latitude={form.latitude || 10.7769}
                    longitude={form.longitude || 106.6966}
                    onSelect={(lat, lng) => {
                      setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
                    }}
                  />
                </div>

                {/* Hình ảnh */}
                <div>
                  <h3 className="mb-4 text-sm font-semibold">Hình ảnh nhà trọ</h3>
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
                        {form.images.map((img, idx) => {
                          const imgUrl = typeof img === 'string' ? img : (img && typeof img === 'object' && 'url' in img ? img.url : '');
                          return (
                            <div key={idx} className="group relative rounded-lg overflow-hidden bg-black/10 dark:bg-white/10">
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
