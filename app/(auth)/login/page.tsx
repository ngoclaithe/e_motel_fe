"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../components/providers/ToastProvider";

export default function LoginPage() {
  const { push } = useToast();
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
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">Sử dụng email và mật khẩu của bạn.</p>
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
