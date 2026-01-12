"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "../../../lib/api";
import LandingHeader from "../../../components/layout/LandingHeader";
import Footer from "../../../components/layout/Footer";
import ContractRequestModal from "../../../components/contract/ContractRequestModal";

export default function MotelDetailPage() {
    const params = useParams();
    const [motel, setMotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMotel = async () => {
            try {
                const data = await api.get<any>(`/api/v1/motels/s/${params.slug}`);
                setMotel(data);
            } catch (error) {
                console.error("Error fetching motel:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchMotel();
        }
    }, [params.slug]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
            </div>
        );
    }

    if (!motel) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white">
                <h1 className="text-3xl font-bold">Không tìm thấy nhà trọ</h1>
                <Link href="/" className="text-indigo-400 hover:underline">
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    const images = motel.images && motel.images.length > 0
        ? motel.images.map((img: any) => img.url)
        : ["https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800"];

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-slate-200">
            <LandingHeader />

            <main className="mx-auto pt-28 pb-32 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Left Column: Images & Info */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                            <div className="relative h-[400px] w-full md:h-[500px]">
                                <Image
                                    src={images[activeImage]}
                                    alt={motel.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent"></div>
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-4 p-6 overflow-x-auto">
                                    {images.map((img: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImage === idx ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'border-white/10 opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-12 rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl">
                            <h2 className="mb-6 text-3xl font-bold text-white">Mô tả tổng quát</h2>
                            <p className="text-lg leading-relaxed text-slate-400">
                                {motel.description || "Chưa có mô tả chi tiết cho khu nhà trọ này."}
                            </p>

                            <h3 className="mt-12 mb-6 text-2xl font-bold text-white">Tiện ích tòa nhà</h3>
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${motel.hasElevator ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/5 opacity-40'}`}>
                                    <span className="text-xl">🛗</span> Thang máy
                                </div>
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${motel.hasParking ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/5 opacity-40'}`}>
                                    <span className="text-xl">🛵</span> Hầm để xe
                                </div>
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${motel.has24hSecurity ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/5 opacity-40'}`}>
                                    <span className="text-xl">🛡️</span> Bảo vệ 24/7
                                </div>
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${motel.hasWifi ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/5 opacity-40'}`}>
                                    <span className="text-xl">📶</span> Wifi toàn khu
                                </div>
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${motel.allowCooking ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/5 opacity-40'}`}>
                                    <span className="text-xl">🍳</span> Cho phép nấu ăn
                                </div>
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${motel.allowPets ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/5 opacity-40'}`}>
                                    <span className="text-xl">🐾</span> Cho nuôi thú cưng
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Contact */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl">
                            <h1 className="mb-4 text-4xl font-extrabold text-white">
                                {motel.name}
                            </h1>
                            <p className="mb-8 flex items-center gap-2 text-slate-400 italic">
                                📍 {motel.address}
                            </p>

                            <div className="mb-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                <p className="text-xs uppercase font-black text-indigo-400 mb-1">Giá thuê trung bình</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white">
                                        {motel.monthlyRent ? formatMoney(motel.monthlyRent) : "Liên hệ"}
                                    </span>
                                    <span className="text-slate-500">/ tháng</span>
                                </div>
                            </div>

                            <div className="mb-10 space-y-4">
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Tổng số phòng</span>
                                    <span className="font-bold text-white">{motel.totalRooms} Phòng</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Loại hẻm</span>
                                    <span className="font-bold text-white">{motel.alleyType === 'CAR' ? 'Hẻm xe hơi' : motel.alleyType === 'MOTORBIKE' ? 'Hẻm xe máy' : 'Trong ngõ'}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">An ninh</span>
                                    <span className="font-bold text-white">{motel.securityType}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Tiền cọc</span>
                                    <span className="font-bold text-emerald-400">{motel.depositMonths || 0} tháng</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Kỳ thanh toán</span>
                                    <span className="font-bold text-white">{motel.paymentCycleMonths || 1} tháng / lần</span>
                                </div>
                                {motel.electricityCostPerKwh > 0 && (
                                    <div className="flex justify-between py-3 border-b border-white/5">
                                        <span className="text-slate-400">Điện</span>
                                        <span className="font-bold text-emerald-400">{formatMoney(motel.electricityCostPerKwh)} / kWh</span>
                                    </div>
                                )}
                                {motel.waterCostPerCubicMeter > 0 && (
                                    <div className="flex justify-between py-3 border-b border-white/5">
                                        <span className="text-slate-400">Nước</span>
                                        <span className="font-bold text-blue-400">{formatMoney(motel.waterCostPerCubicMeter)} / m³</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Trạng thái</span>
                                    <span className={`font-bold ${motel.status === "ACTIVE" ? "text-emerald-400" :
                                        motel.status === "FULL" ? "text-blue-400" : "text-red-400"
                                        }`}>
                                        {motel.status === "ACTIVE" && "Đang hoạt động"}
                                        {motel.status === "FULL" && "Hết phòng"}
                                        {motel.status === "INACTIVE" && "Tạm ngưng"}
                                        {!motel.status && "Đang hoạt động"}
                                    </span>
                                </div>
                            </div>

                            {(motel.contactPhone || motel.owner) && (
                                <div className="mb-10 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                                    <div className="space-y-4">
                                        {(motel.contactPhone || motel.owner?.phoneNumber) && (
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">
                                                    📞
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-500">Điện thoại liên hệ</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {motel.contactPhone || motel.owner?.phoneNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {motel.contactZalo && (
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">
                                                    💬
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-500">Zalo</p>
                                                    <p className="text-lg font-bold text-white">{motel.contactZalo}</p>
                                                </div>
                                            </div>
                                        )}
                                        {motel.owner && (
                                            <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                                    {motel.owner.firstName?.[0] || 'O'}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    Quản lý bởi <span className="text-slate-200 font-medium">{motel.owner.firstName} {motel.owner.lastName}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="block w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-5 text-center text-lg font-black text-white shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] hover:from-indigo-500 hover:to-violet-500 active:scale-95"
                            >
                                Gửi yêu cầu thuê nhà
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <ContractRequestModal
                motel={motel}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <Footer />
        </div>
    );
}
