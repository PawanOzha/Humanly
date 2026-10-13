"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { bootstrapAccount, useAuth } from "@/lib/stores/auth";

/**
 * Keeps the dashboard for signed-in people. This only decides what the browser
 * shows; every API call checks the session again on the server.
 */
export function AccountGate({ children }: { children: ReactNode }) {
  const status = useAuth((state) => state.status);
  const configured = useAuth((state) => state.configured);
  const offline = useAuth((state) => state.offline);
  const user = useAuth((state) => state.user);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "ready" || !configured || user) return;
    const next = path && path.startsWith("/") ? path : "/dashboard";
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [status, configured, user, path, router]);

  if (user) return children;
  if (status === "ready" && offline) return <Unreachable />;
  // Accounts are switched off on this server (local development): work on-device.
  if (status === "ready" && !configured) return children;
  return <Opening />;
}

function Unreachable() {
  return (
    <div className="db-boot" role="alert">
      <div className="db-boot-card">
        <span className="db-boot-icon" aria-hidden>!</span>
        <h1>We can&apos;t reach Humanora</h1>
        <p>Your connection may be down, or the service is restarting. Your documents are safe.</p>
        <div>
          <button type="button" className="db-btn db-btn-ink" onClick={() => void bootstrapAccount()}>
            <span>Try again</span>
          </button>
          <Link href="/" className="db-btn db-btn-ghost"><span>Back to site</span></Link>
        </div>
      </div>
    </div>
  );
}

export function Opening() {
  return (
    <div className="db-boot" aria-busy="true" aria-live="polite">
      <div className="db-boot-card">
        <span className="db-boot-spin" aria-hidden />
        <p>Opening your dashboard</p>
      </div>
    </div>
  );
}
