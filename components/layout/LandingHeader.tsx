import Link from "next/link";
import Image from "next/image";

export default function LandingHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-r from-slate-900/90 to-blue-950/90 backdrop-blur-xl text-white shadow-2xl transition-all duration-300">
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 overflow-hidden group-hover:shadow-blue-500/40 transition-all duration-300">
                            <Image
                                src="/images/e-motel.png"
                                width={40}
                                height={40}
                                alt="E-motel"
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                            E-Motel
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#" className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group py-2">
                            Tính năng
                            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                        </Link>
                        <Link href="#" className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group py-2">
                            Về chúng tôi
                            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                        </Link>
                        <Link href="#" className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group py-2">
                            Liên hệ
                            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
