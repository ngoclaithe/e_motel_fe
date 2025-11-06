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
    monthlyRent: undefined,
    latitude: undefined,
    longitude: undefined,
    images: [],
  });

  useEffect(() => {
    fetchMotels();
  }, [page, limit, query]);

  const fetchMotels = async () => {
    try {
      setLoading(true);
      const response = await motelService.listMotels({
        page,
        limit,
        search: query || undefined,
      });
      setMotels(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching motels:", error);
      push({ title: "Lỗi", description: "Không thể tải danh sách nhà trọ", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.address) return;

    try {
      setUploading(true);
      const imageUrls: string[] = [];

      if (form.images && form.images.length > 0) {
        for (const img of form.images) {
          if (img.startsWith('http')) {
            imageUrls.push(img);
          }
        }
      }

      const payload = {
        name: String(form.name),
        address: String(form.address),
        description: form.description || "",
        totalRooms: form.totalRooms,
        monthlyRent: form.monthlyRent,
        latitude: form.latitude,
        longitude: form.longitude,
        images: imageUrls,
      };

      if (editing) {
        await motelService.updateMotel(editing.id, payload);
        push({ title: "Đã cập nhật", type: "success" });
      } else {
        await motelService.createMotel(payload);
        push({ title: "Đã thêm nhà trọ", type: "success" });
      }

      await fetchMotels();
      setOpen(false);
      setEditing(null);
      setForm({
        name: "",
        address: "",
        ownerEmail: "",
        description: "",
        totalRooms: undefined,
        monthlyRent: undefined,
        latitude: undefined,
        longitude: undefined,
        images: [],
      });
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
      await fetchMotels();
    } catch (error) {
      console.error(error);
      push({ title: "Lỗi", description: "Không thể xóa nhà trọ", type: "error" });
    }
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
            placeholder="Tìm theo tên, địa chỉ"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="w-64 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/15 dark:focus:border-white/25"
          />
          <button onClick={() => setOpen(true)} disabled={loading} className="btn-primary disabled:opacity-50">Thêm</button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-black/40">
          <div className="text-sm text-zinc-500">Đang tải...</div>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {motels.map((m) => (
              <div key={m.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-zinc-500">{m.address}</div>
                  {m.owner && <div className="text-xs text-zinc-500">Chủ: {m.owner.email}</div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { setEditing(m); setForm(m); setOpen(true); }} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Sửa</button>
                  <button onClick={() => remove(m.id)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs text-red-600 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Xóa</button>
                </div>
              </div>
            ))}
            {motels.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">Không có nhà trọ phù hợp</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/40">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Trang {page} / {totalPages} • Tổng {total} nhà trọ
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
                >
                  ← Trước
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
                <div>
                  <label className="mb-1 block text-sm">Giá thuê tháng</label>
                  <input
                    type="number"
                    value={form.monthlyRent || ""}
                    onChange={(e) => setForm((f) => ({ ...f, monthlyRent: e.target.value ? parseFloat(e.target.value) : undefined }))}
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
                <button type="button" onClick={() => { setOpen(false); setEditing(null); setForm({ name: "", address: "", ownerEmail: "", description: "", totalRooms: undefined, monthlyRent: undefined, images: [] }); }} className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Hủy</button>
                <button onClick={save} disabled={uploading} className="btn-primary disabled:opacity-50">{uploading ? "Đang tải..." : "Lưu"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
