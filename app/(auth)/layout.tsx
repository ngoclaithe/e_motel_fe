import type { ReactNode } from "react";
import "../../app/globals.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-foreground dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-black/40">
        {children}
      </div>
    </div>
  );
}
