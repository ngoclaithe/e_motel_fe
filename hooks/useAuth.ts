"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "../components/providers/ToastProvider";
import type { UserRole } from "../lib/services/auth";
import { useAuthStore } from "@/store/authStore";

function normalizeRole(value: unknown): UserRole | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  if (v === "ADMIN" || v === "LANDLORD" || v === "TENANT") return v as UserRole;
  return null;
}

import { api } from "../lib/api";

async function fetchMe(): Promise<{ id: string; email: string; role?: string; isVerified: boolean } | null> {
  try {
    return await api.get("/api/v1/auth/me");
  } catch {
    return null;
  }
}

export function routeForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TENANT":
      return "/tenant";
    case "LANDLORD":
    default:
      return "/landlord";
  }
}

export function useCurrentRole() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        const me = await fetchMe();
        if (mounted && me) {
          const normalized = normalizeRole(me.role);
          if (normalized) {
            setUser({
              id: me.id,
              email: me.email,
              role: normalized,
              isVerified: me.isVerified,
            });
          }
        }
      }
    })();
    return () => { mounted = false; };
  }, [user, setUser]);

  return user?.role || null;
}

export function useEnsureRole(allowed: UserRole[], fallback?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useCurrentRole();

  useEffect(() => {
    const toKey = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");

    if (role === null) {
      if (pathname !== "/login") {
        router.replace("/login");
      }
      return;
    }

    const current = toKey(role);
    const allowedKeys = (allowed || []).map(toKey);

    if (!allowedKeys.includes(current)) {
      const target = fallback || routeForRole(role);
      if (target !== pathname) {
        router.replace(target);
      }
    }
  }, [role, allowed, fallback, router, pathname]);

  return role;
}

export function useAuth() {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const { setUser, clearUser } = useAuthStore();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await api.post("/api/v1/auth/login", { email, password });

      const me = await fetchMe();
      if (!me) {
        push({ title: "Lỗi", description: "Không thể lấy thông tin người dùng.", type: "error" });
        return;
      }

      const role: UserRole = normalizeRole(me.role) || "LANDLORD";

      setUser({
        id: me.id,
        email: me.email,
        role,
        isVerified: me.isVerified,
      });

      router.push(routeForRole(role));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Email hoặc mật khẩu không đúng";
      push({ title: "Lỗi đăng nhập", description: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const logout = async (opts?: { redirect?: boolean }) => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }

    clearUser();
    if (opts?.redirect !== false) router.push("/login");
  };

  const getSession = () => {
    const user = useAuthStore.getState().user;
    return user ? { email: user.email, token: null } : null;
  };

  const redirectByRole = (role: UserRole) => {
    router.push(routeForRole(role));
  };

  return { login, redirectByRole, logout, getSession, loading };
}
