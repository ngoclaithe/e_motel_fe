"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "../../lib/utils";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, ...toast }]);
    setTimeout(() => dismiss(id), 3200);
  }, [dismiss]);

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 top-4 z-50 flex w-full justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md",
                "bg-white/80 dark:bg-black/60 border-black/10 dark:border-white/15",
                t.type === "success" && "ring-1 ring-green-500/30",
                t.type === "error" && "ring-1 ring-red-500/30",
                t.type === "info" && "ring-1 ring-blue-500/30"
              )}
            >
              <div className="text-sm font-semibold text-foreground">{t.title}</div>
              {t.description ? (
                <div className="text-xs text-zinc-600 dark:text-zinc-400">{t.description}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
