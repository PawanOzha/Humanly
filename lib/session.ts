"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth";

export type { Session } from "@/lib/stores/auth";
export { useSession } from "@/lib/stores/auth";

/** End the session. Pass a path to leave the current page first. */
export function useSignOut(to?: string) {
  const router = useRouter();
  return useCallback(() => {
    if (to) router.replace(to);
    return useAuth.getState().logout();
  }, [router, to]);
}

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const words = local.replace(/[._+-]+/g, " ").trim();
  if (!words) return "Writer";
  return words.replace(/\b\w/g, (c) => c.toUpperCase());
}
