"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div>
      <Link href="/" className="mb-4 flex items-center justify-center gap-3">
        <Image src="/images/e-motel.png" width={44} height={44} alt="E-motel" className="rounded-md" />
        <span className="text-lg font-semibold">E-motel</span>
      </Link>
      <h1 className="mb-1 text-xl font-semibold">Đăng nhập</h1>
      <p className="mb-6 text-sm text-slate-400">Sử dụng email và mật khẩu của bạn.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-500 transition-colors"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Mật khẩu</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-500 transition-colors"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <div className="flex items-center justify-between text-sm">
          <a href="/register" className="text-indigo-400 hover:text-indigo-300 hover:underline">Đăng ký</a>
          <a href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 hover:underline">Quên mật khẩu?</a>
        </div>
      </form>
    </div>
  );
}
