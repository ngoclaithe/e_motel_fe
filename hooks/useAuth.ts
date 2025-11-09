"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/providers/ToastProvider";
import type { UserRole, LoginResponse } from "../lib/services/auth";

function normalizeRole(value: unknown): UserRole | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (v === "admin" || v === "landlord" || v === "tenant") return v as UserRole;
  if (v === "landlord".toUpperCase()) return "landlord";
  if (v === "tenant".toUpperCase()) return "tenant";
  if (v === "admin".toUpperCase()) return "admin";
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
    case "admin":
      return "/admin";
    case "tenant":
      return "/tenant";
    case "landlord":
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
  const role = useCurrentRole();
  useEffect(() => {
    if (role === null) {
      router.replace("/login");
      return;
    }
    if (!allowed.includes(role)) {
      const to = fallback || routeForRole(role);
      router.replace(to);
    }
  }, [role, allowed, fallback, router]);
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
      let loginResponse: Record<string, unknown> | null = null;

      try {
        loginResponse = await api.post("/api/v1/auth/login", { email, password });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Email hoặc mật khẩu không đúng";
        push({ title: "Lỗi đăng nhập", description: errorMessage, type: "error" });
        return;
      }

      if (!loginResponse) {
        push({ title: "Lỗi", description: "Không thể đăng nhập. Vui lòng thử lại.", type: "error" });
        return;
      }

      try {
        const pick = (obj: Record<string, unknown>, keys: string[]): string | null => {
          for (const k of keys) {
            const v = obj && typeof obj === "object" ? (obj)[k as keyof typeof obj] : null;
            if (typeof v === "string" && v.trim()) return v;
          }
          return null;
        };
        const nested = (obj: unknown): Record<string, unknown> | null =>
          (obj && typeof obj === "object" ? (obj as Record<string, unknown>) : null);
        const tokenRaw =
          (loginResponse && (pick(loginResponse, ["token", "access_token", "accessToken", "auth_token"]) ||
                             pick(nested(loginResponse?.data), ["token", "access_token", "accessToken", "auth_token"]) ||
                             pick(nested(loginResponse?.result), ["token", "access_token", "accessToken", "auth_token"])) ) || null;
        const token = typeof tokenRaw === "string" ? tokenRaw.replace(/^Bearer\s+/i, "").trim() : null;

        if (token) {
          localStorage.setItem("emotel_token", token);
          localStorage.setItem("emotel_session", JSON.stringify({ email, token }));
        } else {
          localStorage.setItem("emotel_session", JSON.stringify({ email }));
        }
      } catch {}

      const me = await fetchMe();
      let role: UserRole | null = normalizeRole(me?.role);

      if (!role) {
        try {
          const users: Array<{ email: string; role?: string }> = JSON.parse(
            localStorage.getItem("emotel_users") || "[]"
          ) as Array<{ email: string; role?: string }>;
          const found = users.find((u) => u.email === email);
          role = normalizeRole(found?.role) || "landlord";
        } catch {
          role = "landlord";
        }
      }

      try { if (role) localStorage.setItem("emotel_active_role", role); } catch {}

      push({ title: "Đăng nhập thành công", description: `Xin chào ${email}`, type: "success" });
      router.push(routeForRole(role!));
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
