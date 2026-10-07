"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "@/components/auth/avatar";
import { useShallow } from "zustand/react/shallow";
import { useSignOut, type Session } from "@/lib/session";
import { useBilling } from "@/lib/stores/billing";
import { EASE, GLASS_BG, GLASS_EDGE, GLASS_ON } from "@/lib/tokens";
import { formatWords, PLANS, wordsLeft, type BillingView } from "@/lib/workspace";

/** The signed-in profile: an avatar that opens a small account menu. */
export function AccountChip({ session, inApp = false }: { session: Session; inApp?: boolean }) {
  const billing = useBilling(useShallow((state): BillingView => ({
    plan: state.plan,
    used: state.used,
    allowance: state.allowance,
    period: state.period,
  })));
  const signOut = useSignOut(inApp ? "/" : undefined);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} style={{ position: "relative" }}>
      <button
        ref={trigger}
        type="button"
        className="hm-account"
        aria-label={`Account menu for ${session.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar session={session} size={32} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="hm-account-menu"
            style={{
              background: GLASS_BG,
              backdropFilter: GLASS_ON,
              WebkitBackdropFilter: GLASS_ON,
              boxShadow: GLASS_EDGE,
              transformOrigin: "top right",
            }}
          >
            <div className="hm-account-meta">
              <div className="hm-account-who">{session.name}</div>
              <div className="hm-account-email">{session.email}</div>
              <div className="hm-account-plan">
                <span>{PLANS[billing.plan].name}</span>
                <span>{formatWords(wordsLeft(billing))} words left</span>
              </div>
            </div>
            <div className="hm-account-rule" aria-hidden />
            <Link href={inApp ? "/" : "/dashboard"} role="menuitem" className="hm-menu-item" onClick={() => setOpen(false)}>
              {inApp ? "Back to site" : "Dashboard"}
            </Link>
            <Link href="/dashboard/plans" role="menuitem" className="hm-menu-item" onClick={() => setOpen(false)}>
              Plan and usage
            </Link>
            <button
              type="button"
              role="menuitem"
              className="hm-menu-item"
              disabled={leaving}
              onClick={() => {
                setLeaving(true);
                void signOut().finally(() => {
                  setLeaving(false);
                  setOpen(false);
                });
              }}
            >
              {leaving ? "Signing out…" : "Sign out"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
