import Image from "next/image";
import Link from "next/link";

interface RoomCardProps {
    room: any;
}

export default function RoomCard({ room }: RoomCardProps) {
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const firstImage = room.images && room.images.length > 0
        ? room.images[0].url
        : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800";

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="relative h-56 w-full overflow-hidden">
                <Image
                    src={firstImage}
                    alt={`Room ${room.number}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>

                <div className="absolute top-4 right-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-blue-500/40">
                    {room.area}m²
                </div>

                <div className="absolute bottom-4 left-4">
                    <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md ring-1 ring-emerald-500/30">
                        Phòng trống
                    </span>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            Phòng {room.number}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {room.owner?.address || "Hồ Chí Minh"}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-blue-400">
                            {formatMoney(room.price)}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">mỗi tháng</p>
                    </div>
                </div>

                <p className="mb-6 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {room.description || "Phòng trọ cao cấp, đầy đủ tiện nghi, không gian thoáng mát và an ninh đảm bảo..."}
                </p>

                {/* Amenities Icons */}
                <div className="mb-6 flex flex-wrap gap-4">
                    {room.hasWifi && (
                        <div className="flex flex-col items-center gap-1" title="Wifi">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                </svg>
                            </div>
                        </div>
                    )}
                    {room.hasAirConditioner && (
                        <div className="flex flex-col items-center gap-1" title="Điều hòa">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    )}
                    {room.hasKitchen && (
                        <div className="flex flex-col items-center gap-1" title="Bếp">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                <Link
                    href={`/rooms/${room.slug || room.id}`}
                    className="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600/10 py-3 text-sm font-bold text-white transition-all hover:bg-blue-600"
                >
                    <span className="relative z-10">Xem chi tiết</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-transform duration-300 group-hover/btn:translate-x-0"></div>
                </Link>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        </div>
    );
}
