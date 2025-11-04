"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useCurrentRole } from "../../hooks/useAuth";

export default function Sidebar() {
  const pathname = usePathname();
  const role = useCurrentRole();

  const nav = (() => {
    if (role === "landlord") {
      return [
        { href: "/landlord", label: "Tổng quan" },
        { href: "/motels", label: "Nhà trọ" },
        { href: "/rooms", label: "Phòng" },
        { href: "/landlord/contracts", label: "Hợp đồng" },
        { href: "/landlord/bills", label: "Hóa đơn" },
        { href: "/landlord/feedbacks", label: "Sửa chữa" },
        { href: "/notifications", label: "Thông báo" },
        { href: "/profile", label: "Hồ sơ" },
      ];
    }
    if (role === "tenant") {
      return [
        { href: "/tenant", label: "Tổng quan" },
        { href: "/contracts", label: "Hợp đồng" },
        { href: "/bills", label: "Hóa đơn" },
        { href: "/feedbacks", label: "Sửa chữa" },
        { href: "/notifications", label: "Thông báo" },
        { href: "/profile", label: "Hồ sơ" },
      ];
    }
    if (role === "admin") {
      return [
        { href: "/admin", label: "Bảng điều khiển" },
        { href: "/admin/users", label: "Người dùng" },
        { href: "/admin/motels", label: "Nhà trọ" },
        { href: "/admin/rooms", label: "Phòng" },
        { href: "/admin/reports", label: "Báo cáo" },
        { href: "/admin/notifications", label: "Quản lý thông báo" },
        { href: "/notifications", label: "Thông báo" },
        { href: "/profile", label: "Hồ sơ" },
      ];
    }
    return [] as { href: string; label: string }[];
  })();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-black/10 px-4 py-6 dark:border-white/10 md:block">
      <div className="mb-6 text-lg font-semibold">E-Motel</div>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-black/5 dark:hover:bg-white/10",
              pathname === item.href ? "bg-black/10 dark:bg-white/15" : ""
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
