"use client";

import { useEffect, useState } from "react";
import { useEnsureRole, useCurrentRole, useAuth } from "../../../hooks/useAuth";
import type { UserRole } from "../../../types";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  toRole?: UserRole | "all";
  toEmail?: string;
  createdAt: string;
  read?: boolean;
}

function getInitialNotifications(role: UserRole | null, userEmail: string | undefined): NotificationItem[] {
  try {
    const allNotifications = JSON.parse(localStorage.getItem("emotel_notifications") || "[]");
    const filtered = (allNotifications as NotificationItem[]).filter((n: NotificationItem) => {
      const isForRole = !n.toRole || n.toRole === "all" || n.toRole === role;
      const isForEmail = !n.toEmail || n.toEmail === userEmail;
      return isForRole && isForEmail;
    });
    return filtered.sort((a: NotificationItem, b: NotificationItem) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export default function NotificationsPage() {
  useEnsureRole(["tenant", "landlord", "admin"]);
  const role = useCurrentRole();
  const { getSession } = useAuth();
  const session = getSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getInitialNotifications(role, session?.email)
  );

  useEffect(() => {
    const updated = getInitialNotifications(role, session?.email);
    setNotifications(updated);
  }, [role, session?.email]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => getInitialNotifications(role, session?.email));
    }, 5000);
    return () => clearInterval(interval);
  }, [role, session?.email]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Thông báo</h1>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-12 text-center text-sm text-zinc-500 dark:border-white/15">
          Bạn không có thông báo nào
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/50"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-3 w-3 flex-shrink-0 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="font-semibold text-black dark:text-white">{notif.title}</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {notif.message}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    {new Date(notif.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
