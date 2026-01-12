"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "../../lib/api";
import SearchBar from "../../components/search/SearchBar";
import RoomCard from "../../components/search/RoomCard";
import MotelCard from "../../components/search/MotelCard";
import LandingHeader from "../../components/layout/LandingHeader";
import Footer from "../../components/layout/Footer";

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [resultType, setResultType] = useState<"ROOM" | "MOTEL">("ROOM");

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                const query = searchParams.toString();
                // Sử dụng api utility với prefix /api/v1 tự động hoặc path tương đối
                const data = await api.get<any>(`/api/v1/rooms/public/search?${query}`);
                setRooms(data.data || []);
                setTotal(data.total || 0);
                setResultType(data.type || "ROOM");
            } catch (error) {
                console.error("Failed to fetch rooms", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [searchParams]);

    return (
        <main className="mx-auto pt-28 pb-32 max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Decorative background elements */}
            <div className="fixed top-0 left-0 -z-10 h-full w-full overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
                <div className="absolute top-[20%] -right-[5%] h-[50%] w-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
            </div>

            <div className="mb-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Kết quả <span className="text-blue-400">tìm kiếm</span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 max-w-2xl">
                        Khám phá các căn phòng phù hợp nhất với nhu cầu và phong cách sống của bạn.
                    </p>
                </div>
                <SearchBar />
            </div>

            {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent shadow-lg shadow-blue-500/20"></div>
                    <p className="text-sm font-medium text-slate-400 animate-pulse">Đang tìm kiếm căn phòng phù hợp...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                        <p className="text-sm font-medium text-slate-400">
                            Tìm thấy <span className="font-bold text-blue-400 text-lg">{total}</span> {resultType === "ROOM" ? "phòng" : "nhà trọ"} phù hợp
                        </p>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 p-20 text-center backdrop-blur-xl">
                            <div className="mb-6 rounded-2xl bg-slate-800/50 p-6 text-6xl shadow-inner">🔍</div>
                            <h3 className="mb-2 text-2xl font-bold text-white">Không tìm thấy kết quả</h3>
                            <p className="max-w-md text-slate-400">
                                Rất tiếc, chúng tôi không tìm thấy phòng nào phù hợp với các tiêu chí tìm kiếm hiện tại của bạn.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-8 rounded-xl bg-white/5 px-6 py-2 text-sm font-bold text-white ring-1 ring-white/10 transition-all hover:bg-white/10"
                            >
                                Thử lại hoặc làm mới bộ lọc
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {rooms.map((item) => (
                                <div key={item.id} className="transition-all duration-300 hover:scale-[1.02]">
                                    {resultType === "ROOM" ? (
                                        <RoomCard room={item} />
                                    ) : (
                                        <MotelCard motel={item} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

export default function SearchResultsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-slate-200">
            <LandingHeader />
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent shadow-lg shadow-blue-500/20"></div>
                </div>
            }>
                <SearchResultsContent />
            </Suspense>
            <Footer />
        </div>
    );
}
