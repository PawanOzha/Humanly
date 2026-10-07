"use client";

import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { bindUsage } from "@/lib/live";
import { applyCachedAccount, bootstrapAccount, refreshAccount } from "@/lib/stores/auth";
import { hydrateGuest } from "@/lib/stores/guest";
import { useBilling } from "@/lib/stores/billing";
import { useDocuments } from "@/lib/stores/documents";

export function AccountProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    applyCachedAccount();
    hydrateGuest();
  }, []);
  useEffect(() => {
    bindUsage((usage) => useBilling.getState().apply(usage));
    void bootstrapAccount();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "humanly.documents" || event.key === "humanly.workspace") useDocuments.getState().reloadLocal();
      if (event.key === "humanly.billing" && useBilling.getState().source === "local") useBilling.getState().loadLocal();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshAccount);
    document.addEventListener("visibilitychange", refreshAccount);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshAccount);
      document.removeEventListener("visibilitychange", refreshAccount);
      bindUsage(null);
    };
  }, []);
  return children;
}
