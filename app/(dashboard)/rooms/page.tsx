"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import type { Room, RoomStatus, Motel } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";
import { uploadToCloudinary } from "../../../lib/cloudinary";

const COMMON_AMENITIES = [
  "Điều hòa",
  "Nóng lạnh",
  "Tủ lạnh",
  "Giường",
  "Tủ quần áo",
  "Bếp riêng",
  "Ban công",
  "WiFi",
  "Tủ bếp",
];

export default function RoomsPage() {
  useEnsureRole(["landlord"]);
  const { push } = useToast();
  const [rooms, setRooms] = useLocalStorage<Room[]>("emotel_rooms", []);
  const [motels, setMotels] = useLocalStorage<Motel[]>("emotel_motels", []);
  const [status, setStatus] = useState<RoomStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [form, setForm] = useState<Partial<Room>>({
    number: "",
    area: 20,
    price: 1000000,
    status: "VACANT",
    amenities: [],
    images: [],
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

  const toggleAmenity = (amenity: string) => {
    setForm((f) => ({
      ...f,
      amenities: (f.amenities || []).includes(amenity)
        ? (f.amenities || []).filter((a) => a !== amenity)
        : [...(f.amenities || []), amenity],
    }));
  };

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

      if (editing) {
        const updatedRoom: Room = {
          ...editing,
          number: String(form.number),
          area: Number(form.area),
          price: Number(form.price),
          status: form.status as RoomStatus,
          amenities: form.amenities || [],
          images: imageUrls.length > 0 ? imageUrls : form.images,
          motelId: form.motelId,
        };
        setRooms(rooms.map((r) => (r.id === editing.id ? updatedRoom : r)));
        push({ title: "Cập nhật phòng thành công", type: "success" });
      } else {
        const newRoom: Room = {
          id: crypto.randomUUID(),
          number: String(form.number),
          area: Number(form.area),
          price: Number(form.price),
          status: form.status as RoomStatus,
          amenities: form.amenities || [],
          images: imageUrls.length > 0 ? imageUrls : [],
          motelId: form.motelId,
          createdAt: new Date().toISOString(),
        };
        setRooms([newRoom, ...rooms]);
        push({ title: "Tạo phòng thành công", type: "success" });
      }
      closeModal();
    } catch (error) {
      console.error(error);
      push({ title: "Lỗi", description: "Không thể lưu phòng", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const remove = (id: string) => {
    if (!confirm("Xóa phòng này?")) return;
    setRooms(rooms.filter((r) => r.id !== id));
    push({ title: "Đã xóa", type: "info" });
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
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Phòng</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
          <button onClick={() => setOpen(true)} className="btn-primary">Thêm phòng</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">Phòng {r.number}</div>
                <div className="mt-0.5 text-xs text-zinc-500">{r.area} m² • {r.price.toLocaleString()}đ</div>
              </div>
              <span className="rounded-full px-2 py-0.5 text-xs text-zinc-700 dark:text-zinc-300" data-status={r.status}>
                {r.status === "VACANT" && "Trống"}
                {r.status === "OCCUPIED" && "Đang thuê"}
                {r.status === "MAINTENANCE" && "Bảo trì"}
              </span>
            </div>
            {r.amenities && r.amenities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {r.amenities.slice(0, 2).map((amenity) => (
                  <span key={amenity} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {amenity}
                  </span>
                ))}
                {r.amenities.length > 2 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    +{r.amenities.length - 2}
                  </span>
                )}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={() => openEditModal(r)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Sửa</button>
              <button onClick={() => remove(r.id)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">Không có phòng phù hợp</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-black/40 flex flex-col">
            <div className="flex-shrink-0 border-b border-black/10 px-6 py-4 dark:border-white/15">
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật phòng" : "Thêm phòng"}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Số phòng <span className="text-red-500">*</span></label>
                    <input
                      value={form.number || ""}
                      onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                      placeholder="101, A1"
                      disabled={uploading}
                    />
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
                  <label className="mb-2 block text-sm font-medium">Tiện ích</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {COMMON_AMENITIES.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer rounded-lg border border-black/10 p-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
                        <input
                          type="checkbox"
                          checked={(form.amenities || []).includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="rounded"
                          disabled={uploading}
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Hình ảnh phòng</label>
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
                {uploading ? "Đang t��i lên..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
