import Image from "next/image";
import Link from "next/link";

interface MotelCardProps {
    motel: any;
}

export default function MotelCard({ motel }: MotelCardProps) {
    const firstImage = motel.images && motel.images.length > 0
        ? motel.images[0].url
        : "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800";

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="relative h-56 w-full overflow-hidden">
                <Image
                    src={firstImage}
                    alt={motel.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>

                <div className="absolute top-4 right-4 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-indigo-500/40">
                    {motel.totalRooms} Phòng
                </div>
            </div>

            <div className="p-6">
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {motel.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {motel.address}
                    </p>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">Giá từ</p>
                        <p className="text-lg font-black text-indigo-400">
                            {motel.monthlyRent ? formatMoney(motel.monthlyRent) : "Liên hệ"}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-400 ring-1 ring-blue-500/20">
                            {motel.alleyType || "Oto vào"}
                        </span>
                    </div>
                </div>

                <p className="mb-6 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {motel.description || "Tòa nhà căn hộ dịch vụ cao cấp, đầy đủ tiện ích, an ninh 24/7, khu dân cư trí thức..."}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {motel.hasElevator && <span className="text-[10px] bg-white/5 py-1 px-2 rounded-md text-slate-400">Thang máy</span>}
                    {motel.hasParking && <span className="text-[10px] bg-white/5 py-1 px-2 rounded-md text-slate-400">Gửi xe</span>}
                    {motel.has24hSecurity && <span className="text-[10px] bg-white/5 py-1 px-2 rounded-md text-slate-400">Bảo vệ 24/7</span>}
                </div>

                <Link
                    href={`/motels/${motel.slug || motel.id}`}
                    className="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-indigo-600/10 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-600"
                >
                    <span className="relative z-10">Xem chi tiết nhà</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-transform duration-300 group-hover/btn:translate-x-0"></div>
                </Link>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        </div>
    );
}
