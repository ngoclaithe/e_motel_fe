"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "../components/providers/ToastProvider";
import type { UserRole, LoginResponse } from "../lib/services/auth";

function normalizeRole(value: unknown): UserRole | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  if (v === "ADMIN" || v === "LANDLORD" || v === "TENANT") return v as UserRole;
  return null;
}

import { api } from "../lib/api";

async function fetchMe(): Promise<{ role?: string } | null> {
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

function readActiveEmail(): string | null {
  try {
    const session = JSON.parse(localStorage.getItem("emotel_session") || "null");
    return session?.email || null;
  } catch {
    return null;
  }
}

function inferRoleFromLocal(email: string | null): UserRole | null {
  try {
    const active = normalizeRole(localStorage.getItem("emotel_active_role"));
    if (active) return active;
    if (!email) return null;
    const users: Array<{ email: string; role?: string }> = JSON.parse(localStorage.getItem("emotel_users") || "[]");
    const found = users.find((u) => u.email === email);
    const role = normalizeRole(found?.role);
    return role;
  } catch {
    return null;
  }
}

export function useCurrentRole() {
  const [role, setRole] = useState<UserRole | null>(() => inferRoleFromLocal(readActiveEmail()));

  useEffect(() => {
    let mounted = true;
    (async () => {
      const me = await fetchMe();
      const normalized = normalizeRole(me?.role);
      if (mounted && normalized) {
        try { localStorage.setItem("emotel_active_role", normalized); } catch {}
        setRole(normalized);
      } else if (mounted) {
        setRole(inferRoleFromLocal(readActiveEmail()) || null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return role;
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

  const clearLocal = () => {
    try {
      localStorage.removeItem("emotel_token");
      localStorage.removeItem("emotel_session");
      localStorage.removeItem("emotel_active_role");
    } catch {}
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      let loginResponse: LoginResponse | null = null;

      try {
        loginResponse = await api.post("/api/v1/auth/login", { email, password });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Email hoặc mật khẩu không đúng";
        push({ title: "Lỗi đăng nhập", description: errorMessage, type: "error" });
        return;
      }

      if (!loginResponse?.accessToken) {
        push({ title: "Lỗi", description: "Không thể đăng nhập. Vui lòng thử lại.", type: "error" });
        return;
      }

      // Store tokens
      localStorage.setItem("emotel_token", loginResponse.accessToken);
      localStorage.setItem("emotel_session", JSON.stringify({ email, token: loginResponse.accessToken }));

      if (loginResponse.refreshToken) {
        localStorage.setItem("emotel_refresh_token", loginResponse.refreshToken);
      }

      const me = await fetchMe();
      let role: UserRole | null = normalizeRole(me?.role);

      if (!role) {
        role = "LANDLORD";
      }

      try {
        if (role) localStorage.setItem("emotel_active_role", role);
      } catch {}

      push({ title: "Đăng nhập thành công", description: `Xin chào ${email}`, type: "success" });
      router.push(routeForRole(role));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể đăng nhập. Vui lòng thử lại.";
      push({ title: "Lỗi", description: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const logout = (opts?: { redirect?: boolean }) => {
    clearLocal();
    push({ title: "Đã đăng xuất", type: "info" });
    if (opts?.redirect !== false) router.push("/login");
  };

  const getSession = () => {
    try {
      return JSON.parse(localStorage.getItem("emotel_session") || "null");
    } catch {
      return null;
    }
  };

  const redirectByRole = (role: UserRole) => {
    router.push(routeForRole(role));
  };

  return { login, redirectByRole, logout, getSession, loading };
}
