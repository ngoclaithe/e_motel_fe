import type { Motel } from "../../types";
import {
    MapPin,
    Phone,
    MessageCircle,
    Mail,
    User as UserIcon,
    Clock,
    ShieldCheck,
    Wifi,
    Wind,
    WashingMachine,
    ChefHat,
    Home,
    Dog,
    Zap,
    Droplets,
    Globe,
    Bike,
    ArrowUpDown,
    LayoutDashboard,
    DollarSign,
    Info,
    X
} from "lucide-react";

interface MotelDetailProps {
    motel: Motel;
    onClose: () => void;
}

export default function MotelDetail({ motel, onClose }: MotelDetailProps) {
    const formatMoney = (amount?: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/20">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-white/10 px-6 py-4 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-xl font-bold text-white truncate max-w-[80%]">{motel.name}</h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-8">
                    {/* Images Gallery */}
                    {motel.images && motel.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {motel.images.map((img, idx) => {
                                const url = typeof img === 'string' ? img : (img as any).url;
                                return (
                                    <div key={idx} className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                        <img src={url} alt={`${motel.name} - ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Contact Info - Moved Up & Enhanced */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-indigo-600/20 border border-indigo-500/30 p-6 shadow-xl shadow-indigo-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                <Phone className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-bold text-lg">Thông tin liên hệ</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="space-y-4">
                                {motel.contactPhone && (
                                    <div className="flex items-center gap-3 text-slate-200">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold leading-none mb-1">Số điện thoại trọ</p>
                                            <span className="text-sm font-bold tracking-wide">{motel.contactPhone}</span>
                                        </div>
                                    </div>
                                )}
                                {motel.contactZalo && (
                                    <div className="flex items-center gap-3 text-slate-200">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
                                            <MessageCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold leading-none mb-1">Zalo liên hệ</p>
                                            <span className="text-sm font-bold tracking-wide">{motel.contactZalo}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                {motel.owner?.phoneNumber && (
                                    <div className="flex items-center gap-3 text-slate-200">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold leading-none mb-1">SĐT Chủ nhà</p>
                                            <span className="text-sm font-bold tracking-wide">{motel.owner.phoneNumber}</span>
                                        </div>
                                    </div>
                                )}
                                {motel.owner?.email && (
                                    <div className="flex items-center gap-3 text-slate-200">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold leading-none mb-1">Email liên hệ</p>
                                            <span className="text-sm font-bold tracking-wide">{motel.owner.email}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!motel.contactPhone && !motel.contactZalo && !motel.owner?.phoneNumber && !motel.owner?.email && (
                                <div className="col-span-full p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-center text-sm text-red-400">
                                    Chưa có thông tin liên hệ được cập nhật.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-white">Vị trí & Địa chỉ</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{motel.address}</p>
                            {motel.alleyType && (
                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                                        Hẻm: {motel.alleyType === 'CAR' ? 'Xe hơi' : motel.alleyType === 'MOTORBIKE' ? 'Xe máy' : 'Đi bộ'}
                                    </span>
                                    {motel.alleyWidth && (
                                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                                            Rộng: {motel.alleyWidth}m
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-white">Giá & Trạng thái</h3>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="text-2xl font-bold text-emerald-400">{formatMoney(motel.monthlyRent)} <span className="text-xs font-normal text-slate-500">/ tháng</span></div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${((motel.status as string) === 'VACANT' || (motel.status as string) === 'ACTIVE') ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                                        ((motel.status as string) === 'OCCUPIED' || (motel.status as string) === 'FULL') ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                                            'border-red-500/30 bg-red-500/10 text-red-400'
                                        }`}>
                                        {((motel.status as string) === 'VACANT' || (motel.status as string) === 'ACTIVE') ? 'ĐANG HOẠT ĐỘNG' :
                                            ((motel.status as string) === 'OCCUPIED' || (motel.status as string) === 'FULL') ? 'HẾT PHÒNG' : 'TẠM NGƯNG'}
                                    </span>
                                    <span className="text-xs text-slate-500">Tổng: {motel.totalRooms} phòng</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities Grid */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white pl-1 flex items-center gap-2">
                            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                            Tiện ích tòa nhà
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { has: motel.hasElevator, icon: LayoutDashboard, label: "Thang máy" },
                                { has: motel.hasParking, icon: Bike, label: "Gửi xe" },
                                { has: motel.hasWifi, icon: Globe, label: "WiFi" },
                                { has: motel.hasAirConditioner, icon: Wind, label: "Điều hòa" },
                                { has: motel.hasWashingMachine, icon: WashingMachine, label: "Máy giặt" },
                                { has: motel.hasKitchen, icon: ChefHat, label: "Bếp chung" },
                                { has: motel.hasRooftop, icon: Home, label: "Sân thượng" },
                                { has: motel.has24hSecurity, icon: ShieldCheck, label: "Bảo vệ 24/7" },
                                { has: motel.allowPets, icon: Dog, label: "Thú cưng" },
                                { has: motel.allowCooking, icon: ChefHat, label: "Nấu ăn" },
                            ].filter(item => item.has).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/5">
                                    <item.icon className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs text-slate-300">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Costs Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white pl-1 flex items-center gap-2">
                            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                            Chi tiết chi phí
                        </h3>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 divide-y divide-white/5">
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-sm text-slate-400">Giá điện</span>
                                <span className="text-sm font-semibold text-emerald-400">{formatMoney(motel.electricityCostPerKwh)} / kWh</span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-sm text-slate-400">Giá nước</span>
                                <span className="text-sm font-semibold text-blue-400">{formatMoney(motel.waterCostPerCubicMeter)} / m³</span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-sm text-slate-400">Internet</span>
                                <span className="text-sm font-semibold text-white">{formatMoney(motel.internetCost)} / tháng</span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-sm text-slate-400">Gửi xe</span>
                                <span className="text-sm font-semibold text-white">{formatMoney(motel.parkingCost)} / tháng</span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-sm text-slate-400">Cọc / Chu kỳ</span>
                                <span className="text-sm font-semibold text-white">{motel.depositMonths} tháng / {motel.paymentCycleMonths} tháng</span>
                            </div>
                        </div>
                    </div>

                    {/* Description & Regulations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-white pl-1 flex items-center gap-2">
                                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                Mô tả chi tiết
                            </h3>
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-400 leading-relaxed min-h-[100px]">
                                {motel.description || "Không có mô tả"}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-white pl-1 flex items-center gap-2">
                                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                Quy định nhà trọ
                            </h3>
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-400 leading-relaxed min-h-[100px] whitespace-pre-line">
                                {motel.regulations || "Không có quy định riêng"}
                            </div>
                        </div>
                    </div>

                    {/* Rooms List Section */}
                    {motel.rooms && motel.rooms.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white pl-1 flex items-center gap-2">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                Danh sách phòng trọ ({motel.rooms.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {motel.rooms.map((room) => (
                                    <div key={room.id} className="group relative rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${room.status === 'VACANT' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    <Home className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Phòng {room.number}</h4>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{room.area}m² • Tầng {room.floor || 1}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${room.status === 'VACANT' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                                                room.status === 'OCCUPIED' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                                                    'border-red-500/30 bg-red-500/10 text-red-400'
                                                }`}>
                                                {room.status === 'VACANT' ? 'TRỐNG' : room.status === 'OCCUPIED' ? 'ĐÃ THUÊ' : 'BẢO TRÌ'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="text-lg font-black text-emerald-400">{formatMoney(room.price)}</div>
                                            <a
                                                href={`/rooms/${room.id}`}
                                                className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500/20 transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <Info className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
