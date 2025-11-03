import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-black">
      <header className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/file.svg" width={36} height={36} alt="E-motel" className="rounded-md" />
            <span className="text-lg font-semibold">E-motel</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-primary px-4 py-2 text-sm">Đăng nhập</Link>
            <Link href="/register" className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Đăng ký</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight">Quản lý nhà trọ — nhanh, trực quan và chuyên nghiệp</h1>
            <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">E-motel giúp chủ trọ và người thuê quản lý phòng, hợp đồng và hóa đơn dễ dàng. Giao diện trực quan, tối ưu mobile và hỗ trợ dark mode.</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn-primary inline-flex items-center px-5 py-3 text-sm font-medium">Bắt đầu (Đăng nhập)</Link>
              <Link href="/register" className="inline-flex items-center rounded-xl border border-black/10 px-5 py-3 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Tạo tài khoản</Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="feature text-center">
                <div className="text-sm font-semibold">Quản lý phòng</div>
                <div className="mt-2 text-xs text-zinc-500">Tạo, sửa, lọc theo trạng thái</div>
              </div>
              <div className="feature text-center">
                <div className="text-sm font-semibold">Hợp đồng & Hóa đơn</div>
                <div className="mt-2 text-xs text-zinc-500">Theo dõi thanh toán và trạng thái hợp đồng</div>
              </div>
              <div className="feature text-center">
                <div className="text-sm font-semibold">Báo cáo nhanh</div>
                <div className="mt-2 text-xs text-zinc-500">Doanh thu, phòng trống, lịch sử thanh toán</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="card w-full max-w-md overflow-hidden">
              <Image src="/globe.svg" alt="E-motel illustration" width={560} height={360} className="object-cover" />
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Cách hoạt động</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="feature text-center">
              <div className="text-sm font-semibold">1. Đăng ký</div>
              <div className="mt-2 text-xs text-zinc-500">Tạo tài khoản chủ trọ hoặc người thuê</div>
            </div>
            <div className="feature text-center">
              <div className="text-sm font-semibold">2. Quản lý</div>
              <div className="mt-2 text-xs text-zinc-500">Thêm nhà trọ, phòng, hợp đồng và hóa đơn</div>
            </div>
            <div className="feature text-center">
              <div className="text-sm font-semibold">3. Theo dõi</div>
              <div className="mt-2 text-xs text-zinc-500">Xem báo cáo, gửi thông báo và xuất PDF</div>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-black/10 pt-8 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>© {new Date().getFullYear()} E-motel. Bản quyền thuộc về bạn.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Chính sách bảo mật</a>
              <a href="#" className="hover:underline">Điều khoản</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
