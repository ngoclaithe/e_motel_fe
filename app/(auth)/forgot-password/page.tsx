"use client";

import { FormEvent, useState } from "react";
import { useToast } from "../../../components/providers/ToastProvider";

export default function ForgotPasswordPage() {
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const send = (e: FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
    push({ title: "Đã gửi OTP", description: `OTP đã gửi tới ${email}`, type: "info" });
  };

  const reset = (e: FormEvent) => {
    e.preventDefault();
    push({ title: "Đặt lại mật khẩu thành công", type: "success" });
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Quên mật khẩu</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">Nhập email để nhận OTP và đặt lại mật khẩu.</p>
      {!otpSent ? (
        <form onSubmit={send} className="space-y-4">
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
          <button className="btn-primary w-full">Gửi OTP</button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">OTP</label>
            <input
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
              placeholder="Nhập mã OTP"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mật khẩu mới</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
              placeholder="••••••••"
            />
          </div>
          <button className="btn-primary w-full">Đặt lại mật khẩu</button>
        </form>
      )}
    </div>
  );
}
