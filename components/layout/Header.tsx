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
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/10 bg-background/80 px-4 backdrop-blur-md dark:border-white/10">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/e-motel.png" alt="E-motel logo" width={28} height={28} className="rounded" />
          <span className="site-title text-sm font-semibold">E-motel</span>
        </Link>
        <span className="hidden text-xs text-zinc-500 sm:inline">Quản lý nhà trọ hiện đại</span>
      </div>
      <div className="flex items-center gap-2">
        {mounted && email && <div className="hidden text-xs text-zinc-600 dark:text-zinc-300 sm:block">{email}</div>}
        {mounted && label && (
          <span className="rounded-lg border border-black/10 px-2 py-1 text-xs text-zinc-600 dark:border-white/15 dark:text-zinc-300">
            Vai trò: {label}
          </span>
        )}

        {/* Notification Bell - Only for LANDLORD and TENANT */}
        {mounted && (role === "LANDLORD" || role === "TENANT") && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg border border-black/10 p-2 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-black/90">
                  <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Thông báo</h3>
                      <Link
                        href="/notifications"
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                        onClick={() => setShowNotifications(false)}
                      >
                        Xem tất cả
                      </Link>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-zinc-500">
                        Không có thông báo mới
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="cursor-pointer border-b border-black/5 p-4 hover:bg-black/5 dark:border-white/5 dark:hover:bg-white/5"
                        >
                          <div className="font-medium text-sm">{notif.title}</div>
                          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            {notif.message}
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
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

        <button onClick={() => logout()} className="ml-2 rounded-lg border border-black/10 px-3 py-1 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">Đăng xuất</button>
      </div>
    </header>
  );
}
