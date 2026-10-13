"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { AccountChip } from "@/components/auth/account-chip";
import { Mark, type MarkName } from "@/components/dashboard/marks";
import { Meter } from "@/components/dashboard/ui";
import { useSession } from "@/lib/session";
import { useBillingView } from "@/lib/stores/billing";
import { EASE, INK } from "@/lib/tokens";
import { formatWords, PLANS, resetLabel, wordsLeft } from "@/lib/workspace";

type Item = { href: string; label: string; title: string; icon: MarkName };

const WORK: Item[] = [
  { href: "/dashboard", label: "Overview", title: "Overview", icon: "overview" },
  { href: "/dashboard/write", label: "Humanize", title: "Humanize", icon: "humanize" },
  { href: "/dashboard/detect", label: "AI detection", title: "AI detection", icon: "detect" },
  { href: "/dashboard/pdf", label: "PDF check", title: "PDF check", icon: "pdf" },
  { href: "/dashboard/documents", label: "Documents", title: "Documents", icon: "documents" },
];

const ACCOUNT: Item[] = [{ href: "/dashboard/plans", label: "Plan and usage", title: "Plan and usage", icon: "plans" }];

function isCurrent(href: string, path: string) {
  if (href === "/dashboard") return path === "/dashboard";
  return path === href || path.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Link href="/" className="db-brand" aria-label="Humanora home">
      <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden>
        <circle cx="15" cy="15" r="15" fill="#d4f26a" />
        <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
          <path d="M15 7.5v15" />
          <path d="M8.5 11.2l13 7.6" />
          <path d="M21.5 11.2l-13 7.6" />
        </g>
      </svg>
      <span>Humanora</span>
    </Link>
  );
}

function NavGroup({ label, items, path }: { label: string; items: Item[]; path: string }) {
  return (
    <div className="db-nav-group">
      <p className="db-nav-label">{label}</p>
      {items.map((item) => {
        const on = isCurrent(item.href, path);
        return (
          <Link key={item.href} href={item.href} className="db-nav-link" data-active={on} aria-current={on ? "page" : undefined}>
            <Mark name={item.icon} size={17} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function UsageCard() {
  const billing = useBillingView();
  const plan = PLANS[billing.plan];
  const left = wordsLeft(billing);
  const allowance = billing.allowance || plan.monthly;
  return (
    <Link href="/dashboard/plans" className="db-usage">
      <div className="db-usage-top">
        <span>{plan.name} plan</span>
        <span>Resets {resetLabel(billing.period)}</span>
      </div>
      <div className="db-usage-num">
        <strong>{formatWords(left)}</strong>
        <span>words left</span>
      </div>
      <Meter value={billing.used} max={allowance} label="Words used this month" />
      {billing.plan === "free" ? <span className="db-usage-cta">Upgrade for more words</span> : null}
    </Link>
  );
}

export function DashShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const session = useSession();
  const billing = useBillingView();
  const [drawer, setDrawer] = useState(false);
  const [lastPath, setLastPath] = useState(path);
  const current = [...WORK, ...ACCOUNT].find((item) => isCurrent(item.href, path) && item.href !== "/dashboard") ?? WORK[0];

  // Close the drawer when the route changes, during render so there is no flash.
  if (lastPath !== path) {
    setLastPath(path);
    setDrawer(false);
  }

  useEffect(() => {
    if (!drawer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawer(false);
    };
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => {
      if (wide.matches) setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      document.body.style.overflow = previous;
    };
  }, [drawer]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="hm-root db">
        <a href="#db-content" className="db-skip">Skip to content</a>

        <aside className="db-rail" data-open={drawer} aria-label="Workspace">
          <div className="db-rail-top">
            <Brand />
            <button type="button" className="db-icon-btn db-rail-close" aria-label="Close menu" onClick={() => setDrawer(false)}>
              <Mark name="close" size={18} />
            </button>
          </div>
          <nav className="db-nav" aria-label="Primary">
            <NavGroup label="Workspace" items={WORK} path={path} />
            <NavGroup label="Account" items={ACCOUNT} path={path} />
          </nav>
          <div className="db-rail-foot">
            <UsageCard />
          </div>
        </aside>

        <AnimatePresence>
          {drawer ? (
            <motion.button
              key="scrim"
              type="button"
              className="db-scrim"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawer(false)}
            />
          ) : null}
        </AnimatePresence>

        <div className="db-body">
          <header className="db-top hm-pane">
            <div className="db-top-left">
              <button type="button" className="db-icon-btn db-burger" aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>
                <Mark name="menu" size={18} />
              </button>
              <div className="db-top-title">
                <span className="db-top-kicker">Dashboard</span>
                <span className="db-top-sep" aria-hidden>/</span>
                <span className="db-top-page">{current.title}</span>
              </div>
            </div>
            <div className="db-top-right">
              <Link href="/dashboard/plans" className="db-words" aria-label={`${formatWords(wordsLeft(billing))} words left`}>
                <span className="db-words-dot" aria-hidden />
                <strong>{formatWords(wordsLeft(billing))}</strong>
                <span>words left</span>
              </Link>
              <Link href="/dashboard/write" className="db-btn db-btn-ink db-new">
                <Mark name="plus" size={15} />
                <span>New draft</span>
              </Link>
              {session ? <AccountChip session={session} inApp /> : (
                <Link href="/login" className="db-btn db-btn-ghost"><span>Log in</span></Link>
              )}
            </div>
          </header>

          <motion.main
            key={path}
            id="db-content"
            className="db-main"
            tabIndex={-1}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </MotionConfig>
  );
}
