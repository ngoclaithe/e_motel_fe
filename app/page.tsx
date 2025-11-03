import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-foreground dark:bg-black">
      <main className="mx-auto w-full max-w-4xl rounded-3xl border border-black/10 bg-white p-10 shadow-xl dark:border-white/10 dark:bg-black/40">
        <div className="flex flex-col gap-6 text-center">
          <h1 className="text-3xl font-semibold">E-Motel – Nền tảng quản lý nhà trọ hiện đại</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Bắt đầu bằng việc đăng nhập hoặc khám phá nhanh các bảng điều khiển theo vai trò.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]">Đăng nhập</Link>
            <Link href="/register" className="rounded-xl border border-black/10 px-5 py-3 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Đăng ký</Link>
            <Link href="/landlord" className="rounded-xl border border-black/10 px-5 py-3 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Chủ trọ</Link>
            <Link href="/admin" className="rounded-xl border border-black/10 px-5 py-3 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Admin</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
