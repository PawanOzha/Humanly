import type { ReactNode } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";

export default function EnterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthScreen />
      {children}
    </>
  );
}
