"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/providers/ToastProvider";
import type { UserRole } from "../types";

function normalizeRole(value: unknown): UserRole | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (v === "admin" || v === "landlord" || v === "tenant") return v;
  if (v === "landlord".toUpperCase()) return "landlord";
  if (v === "tenant".toUpperCase()) return "tenant";
  if (v === "admin".toUpperCase()) return "admin";
  return null;
}

async function fetchMe(): Promise<{ role?: string } | null> {
  try {
    const res = await fetch("/api/v1/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function routeForRole(role: UserRole): string {
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

export function useAuth() {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      localStorage.setItem("emotel_session", JSON.stringify({ email }));

      const me = await fetchMe();
      let role: UserRole | null = normalizeRole(me?.role);

      if (!role) {
        try {
          const users: Array<{ email: string; role?: string }> = JSON.parse(localStorage.getItem("emotel_users") || "[]");
          const found = users.find((u) => u.email === email);
          role = normalizeRole(found?.role) || "landlord";
        } catch {
          role = "landlord";
        }
      }

      push({ title: "Đăng nhập thành công", description: `Xin chào ${email}`, type: "success" });
      router.push(routeForRole(role));
    } catch (e) {
      push({ title: "Lỗi", description: "Không thể đăng nhập. Vui lòng thử lại.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role: UserRole) => {
    router.push(routeForRole(role));
  };

  return { login, redirectByRole, loading };
}
