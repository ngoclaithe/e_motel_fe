"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
    const router = useRouter();
    const [searchType, setSearchType] = useState<"ROOM" | "MOTEL">("ROOM");
    const [keyword, setKeyword] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.append("type", searchType);
        if (keyword) params.append("keyword", keyword);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);

        router.push(`/search-results?${params.toString()}`);
    };


    return (
        <div className="relative w-full rounded-2xl bg-white/80 p-6 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:bg-gray-900/80 dark:ring-white/10">
            {/* Search Type Selector */}
            <div className="mb-6 flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                <button
                    onClick={() => setSearchType("ROOM")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${searchType === "ROOM"
                            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    Phòng trọ
                </button>
                <button
                    onClick={() => setSearchType("MOTEL")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${searchType === "MOTEL"
                            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                >
                    Nhà trọ
                </button>
            </div>

            {/* Decorative gradient border effect */}
            <div className="absolute inset-0 -z-10 -m-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-20 blur-xl"></div>

            <form onSubmit={handleSearch} className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1">
                    <label htmlFor="keyword" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Địa điểm / Tên phòng
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="keyword"
                            placeholder="Nhập khu vực, tên đường..."
                            className="w-full rounded-xl border-0 bg-gray-100 py-4 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:w-2/5">
                    <div className="flex-1">
                        <label htmlFor="minPrice" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Giá thấp nhất
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <span className="text-sm font-bold">₫</span>
                            </div>
                            <input
                                type="number"
                                id="minPrice"
                                placeholder="0"
                                className="w-full rounded-xl border-0 bg-gray-100 py-4 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="maxPrice" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Giá cao nhất
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <span className="text-sm font-bold">₫</span>
                            </div>
                            <input
                                type="number"
                                id="maxPrice"
                                placeholder="Tối đa"
                                className="w-full rounded-xl border-0 bg-gray-100 py-4 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-end lg:w-auto">
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Tìm kiếm
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
}
