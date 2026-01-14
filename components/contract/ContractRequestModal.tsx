"use client";

import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

interface ContractRequestModalProps {
    room?: any;
    motel?: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function ContractRequestModal({ room, motel, isOpen, onClose }: ContractRequestModalProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const target = room || motel;
    const isRoom = !!room;

    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        monthlyRent: target?.price || target?.monthlyRent || 0,
        deposit: target?.price || target?.monthlyRent || 0, 
        message: "",
    });

    if (!isOpen) return null;

    if (!user) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
                    <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Đăng nhập để tiếp tục</h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                        Bạn cần đăng nhập để gửi yêu cầu thuê phòng.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => router.push("/login")}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/api/v1/contract-requests", {
                type: isRoom ? "ROOM" : "MOTEL",
                roomId: room?.id,
                motelId: motel?.id,
                tenantId: user.id,
                startDate: formData.startDate,
                endDate: formData.endDate,
                monthlyRent: Number(formData.monthlyRent),
                deposit: Number(formData.deposit),
                message: formData.message,
            });

            alert("Gửi yêu cầu thành công!");
            onClose();
            router.push("/tenant/contract-requests");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
                <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gửi yêu cầu thuê {isRoom ? "phòng" : "nhà"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {isRoom ? `Phòng: ${room.number}` : `Nhà trọ: ${motel.name}`} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.monthlyRent)}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ngày bắt đầu
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-600 dark:bg-gray-700"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ngày kết thúc
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-600 dark:bg-gray-700"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Giá thuê (VNĐ)
                            </label>
                            <input
                                type="number"
                                required
                                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-600 dark:bg-gray-700"
                                value={formData.monthlyRent}
                                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tiền cọc (VNĐ)
                            </label>
                            <input
                                type="number"
                                required
                                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-600 dark:bg-gray-700"
                                value={formData.deposit}
                                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Lời nhắn (Tùy chọn)
                        </label>
                        <textarea
                            className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-600 dark:bg-gray-700"
                            rows={3}
                            placeholder="VD: Tôi muốn chuyển đến vào cuối tuần..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
