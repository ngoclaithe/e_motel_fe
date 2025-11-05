"use client";

import { useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import type { Motel } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../hooks/useAuth";
import { motelService } from "../../../lib/services/motels";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import { MapPicker } from "../../../components/MapPicker";

export default function MotelsPage() {
  useEnsureRole(["landlord"]);
  const { push } = useToast();
  const [motels, setMotels] = useLocalStorage<Motel[]>("emotel_motels", []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Motel | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Partial<Motel>>({
    name: "",
    address: "",
    description: "",
    totalRooms: 0,
    latitude: 10.7769,
    longitude: 106.6966,
    images: [],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImagesChange = (files?: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);
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

      const payload = {
        name: form.name,
        address: form.address,
        description: form.description || "",
        totalRooms: form.totalRooms || 0,
        latitude: form.latitude || 10.7769,
        longitude: form.longitude || 106.6966,
        images: imageUrls.length > 0 ? imageUrls : form.images || [],
      };

      if (editing) {
        await motelService.updateMotel(editing.id, payload);
        setMotels(motels.map((m) => (m.id === editing.id ? { ...editing, ...payload } as Motel : m)));
        push({ title: "Cập nhật thành công", type: "success" });
      } else {
        const newMotel = await motelService.createMotel(payload);
        setMotels([newMotel, ...motels]);
        push({ title: "Tạo nhà trọ thành công", type: "success" });
      }

      setOpen(false);
      setEditing(null);
      setForm({
        name: "",
        address: "",
        description: "",
        totalRooms: 0,
        latitude: 10.7769,
        longitude: 106.6966,
        images: [],
      });
      setLogoFile(null);
      setImageFiles([]);
    } catch (error) {
      console.error(error);
      push({ title: "Lỗi", description: "Không thể lưu nhà trọ", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const remove = (id: string) => {
    if (!confirm("Xóa nhà trọ này?")) return;
    setMotels(motels.filter((m) => m.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  const openEditModal = (motel: Motel) => {
    setEditing(motel);
    setForm(motel);
    setImageFiles([]);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm({
      name: "",
      address: "",
      description: "",
      totalRooms: 0,
      latitude: 10.7769,
      longitude: 106.6966,
      images: [],
    });
    setImageFiles([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nhà trọ</h1>
        <button onClick={() => setOpen(true)} className="btn-primary">Thêm nhà trọ</button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {motels.map((m) => (
          <div key={m.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
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
              <button onClick={() => openEditModal(m)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Sửa</button>
              <button onClick={() => remove(m.id)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
            </div>
          </div>
        ))}
        {motels.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">Chưa có nhà trọ nào</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-black/40 flex flex-col">
            <div className="flex-shrink-0 border-b border-black/10 px-6 py-4 dark:border-white/15">
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật" : "Thêm nhà trọ"}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Tên nhà trọ <span className="text-red-500">*</span></label>
                  <input
                    value={form.name || ""}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    placeholder="Nhà trọ An Bình"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Địa chỉ <span className="text-red-500">*</span></label>
                  <input
                    value={form.address || ""}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    placeholder="123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Mô tả</label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    placeholder="Nhà trọ sạch sẽ, an ninh tốt, gần trường đại học và chợ."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Tổng số phòng</label>
                  <input
                    type="number"
                    value={form.totalRooms || 0}
                    onChange={(e) => setForm((f) => ({ ...f, totalRooms: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Chọn vị trí trên bản đồ</label>
                  <MapPicker
                    latitude={form.latitude || 10.7769}
                    longitude={form.longitude || 106.6966}
                    onSelect={(lat, lng) => {
                      setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Hình ảnh nhà trọ</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImagesChange(e.target.files)}
                    className="w-full text-sm"
                    disabled={uploading}
                  />
                  {form.images && form.images.length > 0 && (
                    <div className="mt-2 text-xs text-green-600">
                      {form.images.length} hình ảnh sẵn sàng
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-black/10 px-6 py-4 dark:border-white/15 flex justify-end gap-2">
              <button
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
                {uploading ? "Đang tải lên..." : "L��u"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
