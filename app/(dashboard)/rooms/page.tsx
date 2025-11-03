"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import type { Room, RoomStatus } from "../../../types";
import { useToast } from "../../../components/providers/ToastProvider";

export default function RoomsPage() {
  const { push } = useToast();
  const [rooms, setRooms] = useLocalStorage<Room[]>("emotel_rooms", []);
  const [status, setStatus] = useState<RoomStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<Partial<Room>>({ name: "", area: 20, price: 1000000, status: "vacant" });

  const filtered = useMemo(() => {
    return status === "all" ? rooms : rooms.filter((r) => r.status === status);
  }, [rooms, status]);

  const save = () => {
    if (!form.name || !form.status) return;
    if (editing) {
      setRooms(rooms.map((r) => (r.id === editing.id ? { ...editing, ...form, area: Number(form.area), price: Number(form.price) } as Room : r)));
      push({ title: "Cập nhật thành công", type: "success" });
    } else {
      const newItem: Room = {
        id: crypto.randomUUID(),
        name: String(form.name),
        area: Number(form.area || 0),
        price: Number(form.price || 0),
        status: form.status as RoomStatus,
        images: [],
        notes: [],
        createdAt: new Date().toISOString(),
      };
      setRooms([newItem, ...rooms]);
      push({ title: "Tạo phòng thành công", type: "success" });
    }
    setOpen(false);
    setEditing(null);
    setForm({ name: "", area: 20, price: 1000000, status: "vacant" });
  };

  const remove = (id: string) => {
    if (!confirm("Xóa phòng này?")) return;
    setRooms(rooms.filter((r) => r.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Phòng</h1>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          >
            <option value="all">Tất cả</option>
            <option value="vacant">Trống</option>
            <option value="occupied">Đang thuê</option>
            <option value="maintenance">Bảo trì</option>
          </select>
          <button onClick={() => setOpen(true)} className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]">Thêm phòng</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">{r.name}</div>
                <div className="mt-0.5 text-xs text-zinc-500">{r.area} m² • {r.price.toLocaleString()}đ</div>
              </div>
              <span className="rounded-full px-2 py-0.5 text-xs capitalize text-zinc-700 dark:text-zinc-300" data-status={r.status}>
                {r.status === "vacant" && "Trống"}
                {r.status === "occupied" && "Đang thuê"}
                {r.status === "maintenance" && "Bảo trì"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setEditing(r); setForm(r); setOpen(true); }} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Sửa</button>
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
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">{editing ? "Cập nhật" : "Thêm phòng"}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm">Tên</label>
                <input
                  value={form.name || ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Diện tích (m²)</label>
                <input
                  type="number"
                  value={form.area ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, area: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Giá (đ)</label>
                <input
                  type="number"
                  value={form.price ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RoomStatus }))}
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                >
                  <option value="vacant">Trống</option>
                  <option value="occupied">Đang thuê</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <button onClick={() => { setOpen(false); setEditing(null); }} className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Hủy</button>
                <button onClick={save} className="rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
