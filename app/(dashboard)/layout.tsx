import type { ReactNode } from "react";
import AppShell from "../../components/layout/AppShell";
import "../../app/globals.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
