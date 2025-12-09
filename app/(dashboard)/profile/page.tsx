"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useEnsureRole, useAuth, useCurrentRole } from "../../../hooks/useAuth";
import { useToast } from "../../../components/providers/ToastProvider";
import { userService } from "../../../lib/services";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import FaceVerification from "../../../components/FaceVerification";

export default function ProfilePage() {
  useEnsureRole(["TENANT", "LANDLORD", "ADMIN"]);
  const { push } = useToast();
  const role = useCurrentRole();
  const { getSession } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);

  const [userData, setUserData] = useState<any>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    avatar: "",
    bankName: "",
    bankCode: "",
    bankAccountNumber: "",
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
      const data = await userService.getProfile() as any;
      setUserData(data);
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        avatar: data.avatar || "",
        bankName: data.bankName || "",
        bankCode: data.bankCode || "",
        bankAccountNumber: data.bankAccountNumber || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      push({ title: "Không thể tải thông tin", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      push({ title: "Vui lòng chọn file ảnh", type: "error" });
      return;
    }

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, avatar: url }));
      push({ title: "Upload ảnh thành công", type: "success" });
    } catch (err) {
      console.error("Upload error:", err);
      push({ title: "Không thể upload ảnh", type: "error" });
    } finally {
      setUploading(false);
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
      case "ADMIN": return "Quản trị viên";
      case "LANDLORD": return "Chủ trọ";
      case "TENANT": return "Người thuê";
      default: return role;
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Avatar Card */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <div className="text-center">
            <div className="relative mx-auto mb-4 h-24 w-24">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/10 text-2xl font-semibold dark:bg-white/10">
                  {form.firstName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            {uploading && <div className="text-xs text-blue-600">Đang upload...</div>}
            <div className="flex items-center justify-center gap-2">
              <div className="text-lg font-semibold">{form.firstName} {form.lastName}</div>
              {userData?.isVerifiedIdentity ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <button
                  onClick={() => setShowFaceVerification(true)}
                  className="transition-all hover:scale-110"
                  title="Click để xác thực danh tính"
                >
                  <XCircle className="h-5 w-5 text-red-600 cursor-pointer" />
                </button>
              )}
            </div>
            <div className="mt-1 text-sm text-zinc-500">{session?.email}</div>
            <div className="mt-2 inline-block rounded-full bg-black/10 px-3 py-1 text-xs font-medium dark:bg-white/10">
              {getRoleLabel()}
            </div>
          </div>
        </div>

        {/* Info Card */}
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
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
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
                  <div className="font-medium">{form.phoneNumber || "Chưa cập nhật"}</div>
                </div>
                <div className="sm:col-span-2">
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
                <div className="grid gap-3 sm:grid-cols-2">
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
                </div>
                <div>
                  <label className="mb-1 block text-sm">Số điện thoại</label>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
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

      {/* Bank Info - For LANDLORD and TENANT */}
      {(role === "LANDLORD" || role === "TENANT") && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black/40">
          <h2 className="mb-4 text-lg font-semibold">Thông tin ngân hàng</h2>
          {!isEditing ? (
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <span className="text-zinc-500">Ngân hàng</span>
                <div className="font-medium">{form.bankName || "Chưa cập nhật"}</div>
              </div>
              <div>
                <span className="text-zinc-500">Mã ngân hàng</span>
                <div className="font-medium font-mono">{form.bankCode || "Chưa cập nhật"}</div>
              </div>
              <div>
                <span className="text-zinc-500">Số tài khoản</span>
                <div className="font-medium font-mono">{form.bankAccountNumber || "Chưa cập nhật"}</div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm">Tên ngân hàng</label>
                <input
                  value={form.bankName}
                  onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                  placeholder="VD: Vietcombank"
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Mã ngân hàng</label>
                <input
                  value={form.bankCode}
                  onChange={(e) => setForm((f) => ({ ...f, bankCode: e.target.value.toUpperCase() }))}
                  placeholder="VD: VCB"
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Số tài khoản</label>
                <input
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm((f) => ({ ...f, bankAccountNumber: e.target.value }))}
                  placeholder="VD: 1234567890"
                  className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-black/20 dark:border-white/15 dark:focus:border-white/25"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Password Section */}
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

      {/* Face Verification Modal */}
      {showFaceVerification && (
        <FaceVerification
          onClose={() => setShowFaceVerification(false)}
          onVerified={() => {
            loadUserData(); // Reload user data to update verified status
          }}
        />
      )}
    </div>
  );
}
