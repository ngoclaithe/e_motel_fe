"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "../../../store/authStore";
import { api } from "../../../lib/api";
import ContractRequestModal from "../../../components/contract/ContractRequestModal";
import LandingHeader from "../../../components/layout/LandingHeader";
import Footer from "../../../components/layout/Footer";

export default function RoomDetailPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const data = await api.get<any>(`/api/v1/rooms/s/${params.slug}`);
                setRoom(data);
            } catch (error) {
                console.error("Error fetching room:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchRoom();
        }
    }, [params.slug]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Không tìm thấy phòng</h1>
                <Link href="/" className="text-blue-600 hover:underline">
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    const images = room.images && room.images.length > 0
        ? room.images.map((img: any) => img.url)
        : ["https://placehold.co/800x600?text=No+Image"];

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-slate-200">
            <LandingHeader />

            <main className="mx-auto max-w-7xl px-4 pt-28 pb-32 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Left Column: Images & Info */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                            <div className="relative h-[400px] w-full md:h-[500px]">
                                <Image
                                    src={images[activeImage]}
                                    alt={`Room ${room.number}`}
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
                            <h2 className="mb-6 text-3xl font-bold text-white">Mô tả chi tiết</h2>
                            <p className="text-lg leading-relaxed text-slate-400">
                                {room.description || "Chưa có mô tả chi tiết cho căn phòng này."}
                            </p>

                            <h3 className="mt-12 mb-6 text-2xl font-bold text-white">Tiện ích & Thiết bị</h3>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {room.hasWifi && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">📶</span> Wifi tốc độ cao
                                    </div>
                                )}
                                {room.hasAirConditioner && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">❄️</span> Điều hòa ({room.airConditionerCount || 1})
                                    </div>
                                )}
                                {room.hasWaterHeater && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">🚿</span> Nóng lạnh ({room.waterHeaterCount || 1})
                                    </div>
                                )}
                                {room.hasFan && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">🌀</span> Quạt ({room.fanCount || 1})
                                    </div>
                                )}
                                {room.hasKitchen && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">🍳</span> Bếp nấu ăn
                                    </div>
                                )}
                                {room.hasKitchenTable && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">🪑</span> Bàn bếp
                                    </div>
                                )}
                                {room.hasRefrigerator && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">🧊</span> Tủ lạnh
                                    </div>
                                )}
                                {room.hasWashingMachine && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">🧺</span> Máy giặt
                                    </div>
                                )}
                                {room.hasWardrobe && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">👕</span> Tủ quần áo
                                    </div>
                                )}
                                {room.hasBed && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">🛏️</span> Giường
                                    </div>
                                )}
                                {room.hasDesk && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">📖</span> Bàn làm việc
                                    </div>
                                )}
                                {room.hasBalcony && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">🌅</span> Ban công
                                    </div>
                                )}
                                {room.lightBulbCount > 0 && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                                        <span className="text-xl">💡</span> {room.lightBulbCount} Bóng đèn
                                    </div>
                                )}
                            </div>

                            {room.amenities && room.amenities.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="mb-4 text-lg font-semibold text-white/70">Tiện ích khác</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {room.amenities.map((amenity: string, idx: number) => (
                                            <span key={idx} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Pricing & Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl">
                            <h1 className="mb-2 text-4xl font-extrabold text-white">
                                Phòng {room.number}
                            </h1>
                            <div className="mb-8 flex items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${room.status === 'VACANT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {room.status === 'VACANT' ? '● CÒN TRỐNG' : '● ĐÃ THUÊ'}
                                </span>
                                {room.floor && (
                                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-400">
                                        TẦNG {room.floor}
                                    </span>
                                )}
                            </div>

                            <div className="mb-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                <p className="text-xs uppercase font-black text-indigo-400 mb-1">Giá thuê hàng quý</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white">
                                        {formatMoney(room.price)}
                                    </span>
                                    <span className="text-slate-500">/ tháng</span>
                                </div>
                            </div>

                            <div className="mb-10 space-y-4">
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Diện tích</span>
                                    <span className="font-bold text-white">{room.area} m²</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Sức chứa</span>
                                    <span className="font-bold text-white">{room.maxOccupancy || 1} người</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Kiểu phòng tắm</span>
                                    <span className="font-bold text-white">{room.bathroomType === 'PRIVATE' ? 'Riêng biệt' : 'Chung'}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Giá điện</span>
                                    <span className="font-bold text-emerald-400">{formatMoney(room.electricityCostPerKwh || 0)} / kWh</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-slate-400">Giá nước</span>
                                    <span className="font-bold text-blue-400">{formatMoney(room.waterCostPerCubicMeter || 0)} / m³</span>
                                </div>
                                {room.internetCost > 0 && (
                                    <div className="flex justify-between py-3 border-b border-white/5">
                                        <span className="text-slate-400">Internet</span>
                                        <span className="font-bold text-indigo-400">{formatMoney(room.internetCost)} / tháng</span>
                                    </div>
                                )}
                                {room.parkingCost > 0 && (
                                    <div className="flex justify-between py-3 border-b border-white/5">
                                        <span className="text-slate-400">Gửi xe</span>
                                        <span className="font-bold text-white">{formatMoney(room.parkingCost)} / chiếc</span>
                                    </div>
                                )}
                            </div>

                            {room.owner && (
                                <div className="mb-10 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                                            {room.owner.firstName?.[0] || 'O'}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-500">Chủ phòng</p>
                                            <p className="text-lg font-bold text-white">
                                                {room.owner.firstName} {room.owner.lastName}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="mt-6 w-full rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 border border-white/10">
                                        📞 {room.owner.phoneNumber}
                                    </button>
                                </div>
                            )}

                            {room.status === 'VACANT' ? (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-5 text-center text-lg font-black text-white shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] hover:from-indigo-500 hover:to-violet-500 active:scale-95"
                                >
                                    Gửi yêu cầu thuê ngay
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full cursor-not-allowed rounded-2xl bg-white/5 py-5 text-center text-lg font-black text-slate-500 border border-white/10"
                                >
                                    Đã có người thuê
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <ContractRequestModal
                room={room}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <Footer />
        </div>
    );
}
