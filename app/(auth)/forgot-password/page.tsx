"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../../components/providers/ToastProvider";
import { authService } from "../../../lib/services/auth";

export default function ForgotPasswordPage() {
  const { push } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      push({ title: "Lỗi", description: "Vui lòng nhập email", type: "error" });
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword({ email });
      setOtpSent(true);
      push({
        title: "Đã gửi OTP",
        description: `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra email (có thể trong spam).`,
        type: "success"
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      push({
        title: "Lỗi",
        description: error?.message || "Không thể gửi OTP. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      push({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      push({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      push({ title: "Lỗi", description: "Mật khẩu phải có ít nhất 6 ký tự", type: "error" });
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({ email, otp, newPassword });
      push({
        title: "Thành công",
        description: "Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập...",
        type: "success"
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      push({
        title: "Lỗi",
        description: error?.message || "OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {!otpSent
            ? "Nhập email của bạn để nhận mã OTP đặt lại mật khẩu"
            : "Nhập mã OTP đã được gửi đến email và mật khẩu mới"}
        </p>
      </div>

      {!otpSent ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/15 dark:focus:border-white/25"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>

          <div className="text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Mã OTP</label>
            <input
              required
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              maxLength={6}
              className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/15 dark:focus:border-white/25"
              placeholder="Nhập 6 chữ số"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Mã OTP có hiệu lực trong 15 phút
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Mật khẩu mới</label>
            <input
              required
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/15 dark:focus:border-white/25"
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Xác nhận mật khẩu</label>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-black/20 disabled:opacity-50 dark:border-white/15 dark:focus:border-white/25"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={loading}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
            >
              Gửi lại mã OTP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
