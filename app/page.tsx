import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Image src="/images/e-motel.png" width={24} height={24} alt="E-motel" className="rounded" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">E-Motel</span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-xl border-2 border-blue-200 bg-white/50 px-6 py-2.5 text-sm font-medium text-blue-700 backdrop-blur-sm transition-all hover:bg-white hover:border-blue-300 dark:border-blue-800 dark:bg-white/10 dark:text-blue-300 dark:hover:bg-white/20"
              >
                Đăng ký
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20">
        {/* Hero Section */}
        <section className="grid gap-12 pt-20 md:grid-cols-2 md:items-center md:pt-32">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              Giải pháp quản lý nhà trọ hiện đại
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Quản lý nhà trọ
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                Thông minh & Hiệu quả
              </span>
            </h1>

            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              E-Motel giúp chủ trọ và người thuê quản lý phòng, hợp đồng và hóa đơn một cách dễ dàng.
              Giao diện trực quan, tối ưu mobile và hỗ trợ dark mode.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1"
              >
                Bắt đầu miễn phí
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Đăng nhập
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Chủ trọ</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Phòng trọ</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Người dùng</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Visual */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-3xl"></div>
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/50 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-800/50">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"></div>
                  <div className="h-32 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Tính năng nổi bật</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Mọi thứ bạn cần để quản lý nhà trọ hiệu quả
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-8 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800/50">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold">Quản lý phòng trọ</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Tạo, chỉnh sửa và theo dõi trạng thái phòng trọ một cách dễ dàng với giao diện trực quan.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-8 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800/50">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold">Hợp đồng & Hóa đơn</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Quản lý hợp đồng thuê và tạo hóa đơn tự động. Theo dõi thanh toán dễ dàng.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/50 p-8 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800/50">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold">Báo cáo thống kê</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Xem báo cáo doanh thu, tỷ lệ lấp đầy và xuất dữ liệu dưới dạng CSV.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-blue-600 to-indigo-600 p-12 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Tham gia cùng hàng trăm chủ trọ đang sử dụng E-Motel
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
                >
                  Đăng ký ngay
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-gray-200 pt-12 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Image src="/images/e-motel.png" width={18} height={18} alt="E-motel" className="rounded" />
              </div>
              <span className="font-semibold">E-Motel</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} E-Motel. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                Chính sách
              </a>
              <a href="#" className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                Điều khoản
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
