"use client";

import { useState, useEffect } from "react";
import { useEnsureRole, useAuth, useCurrentRole } from "../../../hooks/useAuth";
import { useToast } from "../../../components/providers/ToastProvider";
import { userService } from "../../../lib/services";

export default function ProfilePage() {
  useEnsureRole(["TENANT", "LANDLORD", "ADMIN"]);
  const { push } = useToast();
  const role = useCurrentRole();
  const { logout, getSession } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const session = getSession();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getProfile() as any;
      setForm({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      push({ title: "Không thể tải thông tin", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!form.firstName || !form.lastName) {
      push({ title: "Vui lòng nhập họ và tên", type: "error" });
      return;
    }

    try {
      await userService.updateProfile(form);
      push({ title: "Cập nhật thành công", type: "success" });
      setIsEditing(false);
      loadUserData();
    } catch (err) {
      console.error("Failed to update profile:", err);
      push({ title: "Không thể cập nhật hồ sơ", type: "error" });
    }
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      push({ title: "Vui lòng điền tất cả các trường", type: "error" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      push({ title: "Mật khẩu xác nhận không khớp", type: "error" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      push({ title: "Mật khẩu phải có ít nhất 6 ký tự", type: "error" });
      return;
    }

    try {
      await userService.changePassword({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      push({ title: "Đổi mật khẩu thành công", type: "success" });
      setChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Failed to change password:", err);
      push({ title: err.message || "Không thể đổi mật khẩu", type: "error" });
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "LANDLORD":
        return "Chủ trọ";
      case "TENANT":
        return "Người thuê";
      default:
        return role;
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-black/10 text-2xl font-semibold dark:bg-white/10">
              {form.firstName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="text-lg font-semibold">{form.firstName} {form.lastName}</div>
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
                  <span className="text-zinc-500">Họ</span>
                  <div className="font-medium">{form.firstName || "Chưa cập nhật"}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Tên</span>
                  <div className="font-medium">{form.lastName || "Chưa cập nhật"}</div>
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
                  <label className="mb-1 block text-sm">Họ</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Tên</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
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
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={saveProfile}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
                  >
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
                <button
                  onClick={changePassword}
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
                >
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
