import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AccountGate } from "@/components/auth/gate";
import { DashShell } from "@/components/dashboard/shell";
import "./dashboard.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AccountGate>
      <DashShell>{children}</DashShell>
    </AccountGate>
  );
}
