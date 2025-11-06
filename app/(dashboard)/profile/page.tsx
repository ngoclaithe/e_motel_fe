"use client";

import { useState, useEffect } from "react";
import { useEnsureRole, useAuth, useCurrentRole } from "../../../hooks/useAuth";
import { useToast } from "../../../components/providers/ToastProvider";

export default function ProfilePage() {
  useEnsureRole(["tenant", "landlord", "admin"]);
  const { push } = useToast();
  const role = useCurrentRole();
  const { logout, getSession } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatar: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const session = getSession();

  useEffect(() => {
    const loadUserData = () => {
      try {
        const users = JSON.parse(localStorage.getItem("emotel_users") || "[]") as Array<{
          email: string;
          fullName?: string;
          phone?: string;
          address?: string;
          avatar?: string;
        }>;
        const currentUser = users.find((u) => u.email === session?.email);
        if (currentUser) {
          setForm({
            fullName: currentUser.fullName || "",
            phone: currentUser.phone || "",
            address: currentUser.address || "",
            avatar: currentUser.avatar || "",
          });
        }
      } catch {}
    };
    loadUserData();
  }, [session?.email]);

  const saveProfile = () => {
    if (!form.fullName) {
      push({ title: "Lỗi", description: "Vui lòng nhập họ tên", type: "error" });
      return;
    }

    try {
      const users: Array<{
        email: string;
        fullName?: string;
        phone?: string;
        address?: string;
        avatar?: string;
      }> = JSON.parse(localStorage.getItem("emotel_users") || "[]");
      const updatedUsers: Array<{
        email: string;
        fullName?: string;
        phone?: string;
        address?: string;
        avatar?: string;
      }> = users.map((u) =>
        u.email === session?.email
          ? { ...u, ...form }
          : u
      );
      localStorage.setItem("emotel_users", JSON.stringify(updatedUsers));
      push({ title: "Cập nhật thành công", type: "success" });
      setIsEditing(false);
    } catch {
      push({ title: "Lỗi", description: "Không thể cập nhật hồ sơ", type: "error" });
    }
  };

  const changePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      push({ title: "Lỗi", description: "Vui lòng điền tất cả các trường", type: "error" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      push({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", type: "error" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      push({ title: "Lỗi", description: "Mật khẩu phải có ít nhất 6 ký tự", type: "error" });
      return;
    }

    try {
      const users: Array<{
        email: string;
        password?: string;
        fullName?: string;
        phone?: string;
        address?: string;
        avatar?: string;
      }> = JSON.parse(localStorage.getItem("emotel_users") || "[]");
      const currentUser = users.find((u) => u.email === session?.email);

      if (!currentUser) {
        push({ title: "Lỗi", description: "Không tìm thấy người dùng", type: "error" });
        return;
      }

      if (currentUser.password !== passwordForm.currentPassword) {
        push({ title: "Lỗi", description: "Mật khẩu hiện tại không đúng", type: "error" });
        return;
      }

      const updatedUsers: Array<{
        email: string;
        password?: string;
        fullName?: string;
        phone?: string;
        address?: string;
        avatar?: string;
      }> = users.map((u) =>
        u.email === session?.email
          ? { ...u, password: passwordForm.newPassword }
          : u
      );
      localStorage.setItem("emotel_users", JSON.stringify(updatedUsers));
      push({ title: "Đổi mật khẩu thành công", type: "success" });
      setChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      push({ title: "Lỗi", description: "Không thể đổi mật khẩu", type: "error" });
    }
  };

  const onFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const getRoleLabel = () => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "landlord":
        return "Chủ trọ";
      case "tenant":
        return "Người thuê";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-center">
            {form.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatar}
                alt="Avatar"
                className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-black/10 text-sm font-semibold dark:bg-white/10">
                {form.fullName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="text-lg font-semibold">{form.fullName || "Chưa cập nhật"}</div>
            <div className="mt-1 text-sm text-zinc-500">{session?.email}</div>
            <div className="mt-2 inline-block rounded-full bg-black/10 px-3 py-1 text-xs font-medium dark:bg-white/10">
              {getRoleLabel()}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Chỉnh sửa
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-zinc-500">Họ tên</span>
                  <div className="font-medium">{form.fullName || "Chưa cập nhật"}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Email</span>
                  <div className="font-medium">{session?.email}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Số điện thoại</span>
                  <div className="font-medium">{form.phone || "Chưa cập nhật"}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Địa chỉ</span>
                  <div className="font-medium">{form.address || "Chưa cập nhật"}</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Chỉnh sửa hồ sơ</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm">Họ tên</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Địa chỉ</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFile(e.target.files?.[0])}
                    className="w-full text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                  >
                    Hủy
                  </button>
                  <button onClick={saveProfile} className="btn-primary">
                    Lưu
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
        {!changingPassword ? (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bảo mật</h2>
            <button
              onClick={() => setChangingPassword(true)}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              Đổi mật khẩu
            </button>
          </div>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold">Đổi mật khẩu</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  Hủy
                </button>
                <button onClick={changePassword} className="btn-primary">
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
