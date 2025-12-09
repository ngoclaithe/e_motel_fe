"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useCurrentRole } from "../../hooks/useAuth";
import type { UserRole } from "../../types";
import {
  LayoutDashboard,
  Users,
  Building2,
  DoorOpen,
  FileText,
  Receipt,
  Wrench,
  UserCircle,
  BarChart3,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const role = useCurrentRole();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getNav = (r: UserRole | null) => {
    if (r === "LANDLORD") {
      return [
        { href: "/landlord", label: "Tổng quan", icon: LayoutDashboard },
        { href: "/motels", label: "Nhà trọ", icon: Building2 },
        { href: "/rooms", label: "Phòng", icon: DoorOpen },
        { href: "/landlord/contracts", label: "Hợp đồng", icon: FileText },
        { href: "/landlord/bills", label: "Hóa đơn", icon: Receipt },
        { href: "/landlord/feedbacks", label: "Sửa chữa", icon: Wrench },
        { href: "/profile", label: "Hồ sơ", icon: UserCircle },
      ];
    }
    if (r === "TENANT") {
      return [
        { href: "/tenant", label: "Tổng quan", icon: LayoutDashboard },
        { href: "/contracts", label: "Hợp đồng", icon: FileText },
        { href: "/bills", label: "Hóa đơn", icon: Receipt },
        { href: "/feedbacks", label: "Sửa chữa", icon: Wrench },
        { href: "/profile", label: "Hồ sơ", icon: UserCircle },
      ];
    }
    if (r === "ADMIN") {
      return [
        { href: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard },
        { href: "/admin/users", label: "Người dùng", icon: Users },
        { href: "/admin/motels", label: "Nhà trọ", icon: Building2 },
        { href: "/admin/rooms", label: "Phòng", icon: DoorOpen },
        { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
        { href: "/admin/notifications", label: "Thông báo", icon: Bell },
        { href: "/profile", label: "Hồ sơ", icon: UserCircle },
      ];
    }
    return [];
  };

  const nav = mounted ? getNav(role) : [];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-20 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white shadow-lg hover:bg-black/5 dark:border-white/10 dark:bg-black/80 dark:hover:bg-white/10 md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-40 h-screen shrink-0 border-r border-black/10 bg-white transition-all duration-300 dark:border-white/10 dark:bg-black/90 md:sticky",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-black/10 px-4 dark:border-white/10">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">E-Motel</span>
              </div>
            )}

            {/* Desktop Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 md:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>

            {/* Mobile Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="flex rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    "hover:bg-black/5 dark:hover:bg-white/10",
                    isActive && "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
                    !isActive && "text-gray-700 dark:text-gray-300"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isCollapsed && "mx-auto")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="border-t border-black/10 p-4 dark:border-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                © 2024 E-Motel
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
