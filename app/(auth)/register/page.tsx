"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/providers/ToastProvider";

export default function RegisterPage() {
  const { push } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
      push({ title: "Đăng ký thành công", description: "Vui lòng đăng nhập", type: "success" });
      router.push("/login");
    }, 900);
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Đăng ký</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">Tạo tài khoản mới để quản lý nhà trọ.</p>
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
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
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
