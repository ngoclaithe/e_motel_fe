"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentRole, useAuth } from "../../hooks/useAuth";
import { notificationService, type Notification } from "../../lib/services/notification";

export default function Header() {
  const role = useCurrentRole();
  const { logout, getSession } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    setEmail(session?.email || null);
  }, [getSession]);

  useEffect(() => {
    if (!mounted || !role || role === "ADMIN") return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getMyNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [mounted, role]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const label = role === "LANDLORD" ? "Chủ trọ" : role === "TENANT" ? "Người thuê" : role === "ADMIN" ? "Quản trị" : null;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-slate-900/50 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 md:hidden">
          <Image src="/images/e-motel.png" alt="E-motel logo" width={28} height={28} className="rounded" />
          <span className="site-title text-sm font-bold text-white">E-motel</span>
        </Link>
        <span className="hidden text-xs text-slate-400 sm:inline">Quản lý nhà trọ hiện đại</span>
      </div>
      <div className="flex items-center gap-3">
        {mounted && email && <div className="hidden text-xs text-slate-300 sm:block">{email}</div>}
        {mounted && label && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200">
            {label}
          </span>
        )}

        {/* Notification Bell - Only for LANDLORD and TENANT */}
        {mounted && (role === "LANDLORD" || role === "TENANT") && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Thông báo</h3>
                      <Link
                        href="/notifications"
                        className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                        onClick={() => setShowNotifications(false)}
                      >
                        Xem tất cả
                      </Link>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">
                        Không có thông báo mới
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="cursor-pointer border-b border-white/5 p-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="font-medium text-sm text-slate-200">{notif.title}</div>
                          <div className="mt-1 text-xs text-slate-400">
                            {notif.message}
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            {new Date(notif.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <button onClick={() => logout()} className="ml-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">Đăng xuất</button>
      </div>
    </header>
  );
}
