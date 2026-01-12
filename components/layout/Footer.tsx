import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="relative bg-gradient-to-b from-slate-950 to-blue-950 pt-20 pb-10 text-slate-300 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-[100px] -right-[200px] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative mx-auto max-w-7xl px-6">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 overflow-hidden">
                                <Image
                                    src="/images/e-motel.png"
                                    width={40}
                                    height={40}
                                    alt="E-motel"
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                E-Motel
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Giải pháp quản lý nhà trọ hiện đại, giúp kết nối chủ nhà và người thuê nhanh chóng, an toàn và minh bạch.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons */}
                            {[1, 2, 3].map((i) => (
                                <Link key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-1">
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
                            Sản phẩm
                        </h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></span>Tính năng</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></span>Bảng giá</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></span>Dành cho chủ trọ</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></span>Dành cho người thuê</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
                            Hỗ trợ
                        </h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></span>Trung tâm trợ giúp</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></span>Điều khoản sử dụng</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></span>Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform"></span>Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
                            Đăng ký nhận tin
                        </h3>
                        <p className="mb-4 text-sm text-slate-400">
                            Nhận thông tin cập nhật mới nhất về tính năng và ưu đãi.
                        </p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                            <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                                Đăng ký ngay
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-16 border-t border-slate-800 pt-8">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} E-Motel. All rights reserved.
                        </p>
                        <div className="flex gap-8 text-sm font-medium text-slate-500">
                            <Link href="#" className="hover:text-white transition-colors">Quyền riêng tư</Link>
                            <Link href="#" className="hover:text-white transition-colors">Điều khoản</Link>
                            <Link href="#" className="hover:text-white transition-colors">Cookie</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
