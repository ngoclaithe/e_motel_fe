"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/providers/ToastProvider";
import type { UserRole } from "../../../types";

export default function RegisterPage() {
  const { push } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("landlord");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      push({ title: "Mật khẩu không khớp", type: "error" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      try {
        const existing = JSON.parse(localStorage.getItem("emotel_users") || "[]");
        existing.push({ email, role, createdAt: new Date().toISOString() });
        localStorage.setItem("emotel_users", JSON.stringify(existing));
      } catch {}
      push({ title: "Đăng ký thành công", description: "Vui lòng đăng nhập", type: "success" });
      router.push("/login");
    }, 900);
  };

  return (
    <div>
      <Link href="/" className="mb-4 flex items-center gap-3">
        <Image src="/images/e-motel.png" width={44} height={44} alt="E-motel" className="rounded-md" />
        <span className="text-lg font-semibold">E-motel</span>
      </Link>
      <h1 className="mb-1 text-xl font-semibold">Đăng ký</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">Tạo tài khoản mới để quản lý nhà trọ. Chọn vai trò phù hợp (mặc định: Chủ trọ).</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Xác nhận mật khẩu</label>
          <input
            required
            minLength={6}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Vai trò</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25">
            <option value="landlord">Chủ trọ</option>
            <option value="tenant">Người thuê</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
        <div className="text-center text-sm">
          <a href="/login" className="text-foreground/90 underline-offset-4 hover:underline">Đã có tài khoản? Đăng nhập</a>
        </div>
      </form>
    </div>
  );
}
