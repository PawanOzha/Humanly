"use client";

import { useEffect, useState } from "react";
import { LINKS } from "@/lib/links";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/lib/stores/auth";
import { useGuest, type GuestGate } from "@/lib/stores/guest";
import { EASE } from "@/lib/tokens";

/**
 * The cookie notice waits. It stays out of the way until the visitor has
 * scrolled, moved, or typed, then settles in once the page has had a moment.
 */
function useArrival(active: boolean) {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (!active || arrived) return;
    let timer = 0;
    let moved = 0;
    const settle = () => {
      cleanup();
      timer = window.setTimeout(() => setArrived(true), 1400);
    };
    const onScroll = () => {
      if (window.scrollY > 48) settle();
    };
    const onMove = () => {
      moved += 1;
      if (moved > 6) settle();
    };
    const onKey = () => settle();
    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onKey);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onKey, { passive: true });
    return () => {
      cleanup();
      window.clearTimeout(timer);
    };
  }, [active, arrived]);

  return arrived;
}

export function ConsentBanner() {
  const choice = useGuest((state) => state.choice);
  const ready = useAuth((state) => state.status === "ready");
  const signedIn = useAuth((state) => !!state.user);
  const path = usePathname();
  // Free checks only exist on the landing page, so that is the only place to ask.
  const wanted = choice === "unknown" && ready && !signedIn && path === "/";
  const arrived = useArrival(wanted);

  return (
    <AnimatePresence>
      {wanted && arrived && (
        <motion.aside
          key="consent"
          className="hm-consent"
          role="dialog"
          aria-labelledby="hm-consent-title"
          aria-describedby="hm-consent-body"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p id="hm-consent-title" className="hm-consent-title">Cookies</p>
          <p id="hm-consent-body" className="hm-consent-body">
            One small cookie remembers this choice and counts your free checks. Accept for 3 free checks on this network, or decline and keep 1.
          </p>
          <div className="hm-consent-actions">
            <button type="button" className="hm-consent-ghost" onClick={() => useGuest.getState().choose("declined")}>Decline</button>
            <button type="button" className="hm-consent-ink" onClick={() => useGuest.getState().choose("accepted")}>Accept</button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

const COPY: Record<Exclude<GuestGate, null>, { kicker: string; title: string; body: string }> = {
  words: {
    kicker: "Free limit",
    title: "That draft is over 500 words.",
    body: "Free checks read the first 500 words. Log in for a higher limit, or keep the first 500 and continue.",
  },
  login: {
    kicker: "Free checks used",
    title: "Create a free account to keep going.",
    body: "Your free checks on this network are used. An account adds a monthly word allowance and keeps your documents.",
  },
};

/**
 * Sits inside the editor card, under the text. It never covers the page, so
 * the visitor can keep scrolling while it is open.
 */
export function GuestNote({ onTrim }: { onTrim: () => void }) {
  const gate = useGuest((state) => state.gate);
  const copy = gate ? COPY[gate] : null;

  return (
    <AnimatePresence initial={false}>
      {gate && copy && (
        <motion.div
          key={gate}
          className="hm-note"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="hm-note-card">
            <div className="hm-note-copy">
              <p className="hm-note-kicker hm-mono">{copy.kicker}</p>
              <p className="hm-note-title">{copy.title}</p>
              <p className="hm-note-body">{copy.body}</p>
            </div>
            <div className="hm-note-actions">
              <a href={gate === "words" ? LINKS.login : LINKS.signup} className="hm-note-ink">
                {gate === "words" ? "Log in" : "Create account"}
              </a>
              {gate === "words" ? (
                <button type="button" className="hm-note-ghost" onClick={() => { onTrim(); useGuest.getState().close(); }}>Keep first 500</button>
              ) : (
                <a href={LINKS.login} className="hm-note-ghost">Log in</a>
              )}
            </div>
            <button type="button" className="hm-note-close" aria-label="Dismiss" onClick={() => useGuest.getState().close()}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
