"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/providers/ToastProvider";
import { authService } from "../../../lib/services/auth";
import type { UserRole } from "../../../lib/services/auth";

export default function RegisterPage() {
  const { push } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("LANDLORD");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      push({ title: "Mật khẩu không khớp", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role,
      });
      push({ title: "Đăng ký thành công", description: "Vui lòng đăng nhập", type: "success" });
      router.push("/login");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Đăng ký thất bại. Vui lòng thử lại.";
      push({ title: "Lỗi", description: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/" className="mb-4 flex items-center justify-center gap-3">
        <Image src="/images/e-motel.png" width={44} height={44} alt="E-motel" className="rounded-md" />
        <span className="text-lg font-semibold">E-motel</span>
      </Link>
      <h1 className="mb-1 text-xl font-semibold">Đăng ký</h1>
      <p className="mb-6 text-sm text-slate-400">Chọn vai trò phù hợp (mặc định: Chủ trọ).</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Họ</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              placeholder="Nguyễn"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Tên</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              placeholder="Văn A"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Số điện thoại</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
            placeholder="0912345678"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Mật khẩu</label>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Xác nhận mật khẩu</label>
          <input
            required
            minLength={6}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Vai trò</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors">
            <option value="LANDLORD" className="bg-slate-900">Chủ trọ</option>
            <option value="TENANT" className="bg-slate-900">Người thuê</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all"
        >
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
        <div className="text-center text-sm">
          <a href="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline">Đã có tài khoản? Đăng nhập</a>
        </div>
      </form>
    </div>
  );
}
