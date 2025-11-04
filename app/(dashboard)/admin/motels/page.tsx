"use client";

import { useState } from "react";
import type { Motel } from "../../../../types";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import { useToast } from "../../../../components/providers/ToastProvider";
import { useEnsureRole } from "../../../../hooks/useAuth";

export default function AdminMotelsPage() {
  useEnsureRole(["admin"]);
  const { push } = useToast();
  const [motels, setMotels] = useLocalStorage<Motel[]>("emotel_motels", []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Motel | null>(null);
  const [form, setForm] = useState<Partial<Motel>>({ name: "", address: "", ownerEmail: "" });

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
        logoUrl: form.logoUrl || "",
        description: form.description || "",
        createdAt: new Date().toISOString(),
      };
      setMotels([item, ...motels]);
      push({ title: "Đã thêm nhà trọ", type: "success" });
    }
    setOpen(false);
    setEditing(null);
    setForm({ name: "", address: "", ownerEmail: "" });
  };

  const remove = (id: string) => {
    if (!confirm("Xóa nhà trọ này?")) return;
    setMotels(motels.filter((m) => m.id !== id));
    push({ title: "Đã xóa", type: "info" });
  };

  const onFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logoUrl: String(reader.result) }));
    reader.readAsDataURL(file);
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
            <div className="flex items-center gap-3">
              {m.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.logoUrl} alt={m.name} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/10 text-xs font-semibold dark:bg-white/10">Logo</div>
              )}
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-zinc-500">{m.address}</div>
                <div className="text-xs text-zinc-500">Chủ: {m.ownerEmail}</div>
              </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
            <div className="mb-4 text-lg font-semibold">{editing ? "Cập nhật" : "Thêm nhà trọ"}</div>
            <div className="space-y-3">
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
                <label className="mb-1 block text-sm">Logo</label>
                <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="w-full text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setOpen(false); setEditing(null); }} className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Hủy</button>
                <button onClick={save} className="btn-primary">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
