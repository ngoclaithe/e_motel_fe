"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/providers/ToastProvider";
import type { UserRole } from "../../../types";

export default function LoginPage() {
  const { push } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("landlord");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try {
        localStorage.setItem("emotel_session", JSON.stringify({ email, role }));
        push({ title: "Đăng nhập thành công", description: `Xin chào ${email}`, type: "success" });
        router.push(`/${role}`);
      } catch {
        push({ title: "Lỗi", description: "Không thể lưu phiên đăng nhập", type: "error" });
      }
    }, 800);
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Đăng nhập</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">Sử dụng email và mật khẩu của b��n.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Vai trò</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
          >
            <option value="admin">Admin</option>
            <option value="landlord">Chủ trọ</option>
            <option value="tenant">Người thuê</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <div className="flex items-center justify-between text-sm">
          <a href="/register" className="text-foreground/90 underline-offset-4 hover:underline">Đăng ký</a>
          <a href="/forgot-password" className="text-foreground/90 underline-offset-4 hover:underline">Quên mật khẩu?</a>
        </div>
      </form>
    </div>
  );
}
