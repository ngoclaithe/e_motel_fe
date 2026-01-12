import Image from "next/image";
import Link from "next/link";
import SearchBar from "../components/search/SearchBar";
import LandingHeader from "../components/layout/LandingHeader";
import Footer from "../components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-slate-200">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-transparent">
          {/* Modern Gradient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="relative z-10 w-full lg:w-1/2">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-inset ring-white/20 backdrop-blur-sm shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  Giải pháp trọ thông minh số 1
                </div>

                <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6">
                  Tìm Phòng Trọ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-sm">
                    Ưng Ý Nhất
                  </span>
                </h1>

                <p className="mt-6 text-lg leading-relaxed text-slate-400 max-w-lg">
                  Kết nối hàng ngàn chủ trọ và người thuê. Tìm kiếm dễ dàng, thông tin minh bạch, thanh toán an toàn và quản lý hiệu quả.
                </p>

                <div className="mt-12 flex items-center gap-8 text-sm font-semibold text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Xác thực FaceID
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Thanh toán an toàn
                  </div>
                </div>
              </div>

              <div className="relative w-full lg:w-1/2 lg:ml-auto flex justify-center lg:justify-end">
                {/* Explicit width/height for container to ensure visibility */}
                <div className="relative w-full max-w-[600px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 ring-1 ring-white/10 rotate-2 hover:rotate-0 transition-all duration-700 bg-slate-800">
                  <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10"></div>
                  <Image
                    src="/images/hero2.png"
                    alt="App Screenshot"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 -z-10 h-[400px] w-[400px] bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-20 blur-[100px] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 -z-10 h-[400px] w-[400px] bg-gradient-to-tr from-purple-600 to-pink-600 opacity-20 blur-[100px] rounded-full animate-blob animation-delay-2000"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="-mt-12 relative z-20 px-6">
          <div className="mx-auto max-w-5xl">
            <SearchBar />
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 bg-transparent">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-bold leading-7 text-indigo-400 uppercase tracking-wide">Tại sao chọn E-Motel?</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Mọi thứ bạn cần để quản lý hiệu quả
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-400">
                Nền tảng toàn diện giúp tối ưu hóa quy trình vận hành, tiết kiệm thời gian và tăng doanh thu cho chủ trọ.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all hover:bg-white/10 duration-300 group backdrop-blur-sm">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <dt className="text-xl font-bold leading-7 text-white">Quản lý Tập trung</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-relaxed text-slate-400">
                    <p className="flex-auto">Theo dõi trạng thái phòng, danh sách người thuê và lịch sử hợp đồng trên một giao diện duy nhất.</p>
                  </dd>
                </div>

                <div className="flex flex-col rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-purple-500/50 transition-all hover:bg-white/10 duration-300 group backdrop-blur-sm">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <dt className="text-xl font-bold leading-7 text-white">Hợp đồng & Hóa đơn</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-relaxed text-slate-400">
                    <p className="flex-auto">Tạo hợp đồng điện tử và hóa đơn tự động hàng tháng. Gửi thông báo nhắc nợ qua Email/Zalo.</p>
                  </dd>
                </div>

                <div className="flex flex-col rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-pink-500/50 transition-all hover:bg-white/10 duration-300 group backdrop-blur-sm">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <dt className="text-xl font-bold leading-7 text-white">Báo cáo Thông minh</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-relaxed text-slate-400">
                    <p className="flex-auto">Biểu đồ doanh thu trực quan, phân tích tỷ lệ lấp đầy và xu hướng thuê phòng.</p>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-24 px-6 md:px-0 bg-transparent">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/40 px-6 py-24 text-center shadow-2xl shadow-indigo-900/20 rounded-3xl sm:px-16 border border-white/10 backdrop-blur-md">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>

              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Sẵn sàng trải nghiệm sự khác biệt?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Đăng ký ngay hôm nay để nhận 30 ngày dùng thử miễn phí đầy đủ tính năng.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-xl shadow-white/10 hover:bg-slate-200 hover:scale-105 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Đăng ký miễn phí
                </Link>
                <Link href="#" className="text-sm font-semibold leading-6 text-white hover:text-indigo-200 flex items-center gap-1 group">
                  Tìm hiểu thêm <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
