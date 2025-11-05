"use client";

import { useState, useEffect } from "react";
import type { Motel } from "../../../../types";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";
import { motelService } from "../../../../lib/services/motels";
import { uploadToCloudinary } from "../../../../lib/cloudinary";

export default function AdminMotelsPage() {
  useEnsureRole(["admin"]);
  const { push } = useToast();
  const [motels, setMotels] = useState<Motel[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Motel | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState<Partial<Motel>>({
    name: "",
    address: "",
    ownerEmail: "",
    description: "",
    totalRooms: undefined,
    latitude: undefined,
    longitude: undefined,
    images: [],
  });

  const filtered = motels.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.address.toLowerCase().includes(q) ||
      (m.ownerEmail || "").toLowerCase().includes(q)
    );
  });

  const save = () => {
    if (!form.name || !form.address || !form.ownerEmail) return;
    if (editing) {
      setMotels(motels.map((m) => (m.id === editing.id ? { ...editing, ...form } as Motel : m)));
      push({ title: "Đã cập nhật", type: "success" });
    } else {
      const item: Motel = {
        id: crypto.randomUUID(),
        name: String(form.name),
        address: String(form.address),
        ownerEmail: String(form.ownerEmail),
        description: form.description || "",
        totalRooms: form.totalRooms,
        latitude: form.latitude,
        longitude: form.longitude,
        images: form.images || [],
        createdAt: new Date().toISOString(),
      };
      setMotels([item, ...motels]);
      push({ title: "Đã thêm nhà trọ", type: "success" });
    }
    setOpen(false);
    setEditing(null);
    setForm({
      name: "",
      address: "",
      ownerEmail: "",
      description: "",
      totalRooms: undefined,
      latitude: undefined,
      longitude: undefined,
      images: [],
    });
  };

  const remove = (id: string) => {
    if (!confirm("Xóa nhà trọ này?")) return;
    setMotels(motels.filter((m) => m.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  const onImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
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
  };

  const removeImage = (index: number) => {
    setForm((f) => ({
      ...f,
      images: (f.images || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Nhà trọ</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Tìm theo tên, địa chỉ, email chủ"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          />
          <button onClick={() => setOpen(true)} className="btn-primary">Thêm</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-zinc-500">{m.address}</div>
              <div className="text-xs text-zinc-500">Chủ: {m.ownerEmail}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setEditing(m); setForm(m); setOpen(true); }} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Sửa</button>
              <button onClick={() => remove(m.id)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">Không có nhà trọ phù hợp</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40 my-8">
            <div className="mb-4 text-lg font-semibold">{editing ? "Cập nhật" : "Thêm nhà trọ"}</div>
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <label className="mb-1 block text-sm">Tên</label>
                <input
                  value={form.name || ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Địa chỉ</label>
                <input
                  value={form.address || ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Email chủ</label>
                <input
                  type="email"
                  value={form.ownerEmail || ""}
                  onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Mô tả</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25 resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm">Tổng phòng</label>
                  <input
                    type="number"
                    value={form.totalRooms || ""}
                    onChange={(e) => setForm((f) => ({ ...f, totalRooms: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm">Ảnh nhà trọ</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onImageFiles(e.target.files)}
                  disabled={uploading}
                  className="w-full text-sm disabled:opacity-50"
                />
              </div>
              {form.images && form.images.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Đã chọn {form.images.length} hình ảnh</label>
                  <div className="grid grid-cols-4 gap-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="group relative rounded-lg overflow-hidden bg-black/10 dark:bg-white/10">
                        <img src={img} alt={`motel-${idx}`} className="w-full h-20 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-lg font-bold hover:bg-black/70"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm">Vĩ độ</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.latitude || ""}
                    onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Kinh độ</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.longitude || ""}
                    onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setOpen(false); setEditing(null); setForm({ name: "", address: "", ownerEmail: "", description: "", images: [] }); }} className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Hủy</button>
                <button onClick={save} disabled={uploading} className="btn-primary disabled:opacity-50">{uploading ? "Đang tải..." : "Lưu"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
