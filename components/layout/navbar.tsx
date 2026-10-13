"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { AccountChip } from "@/components/auth/account-chip";
import { Logo } from "@/components/ui/logo";
import { Magnetic } from "@/components/ui/magnetic";
import { LINKS } from "@/lib/links";
import { useSession, useSignOut } from "@/lib/session";
import { useAuth } from "@/lib/stores/auth";
import { EASE, GLASS_BG, GLASS_EDGE, GLASS_ON, INK, LINE } from "@/lib/tokens";

const MotionLink = motion.create(Link);

const NAV = [{ l: "How it works", h: "#how" }, { l: "Examples", h: "#examples" }, { l: "API", h: "#api" }, { l: "Pricing", h: "#pricing" }, { l: "FAQ", h: "#faq" }];

type Pill = { x: number; w: number; h: number };

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [pill, setPill] = useState<Pill | null>(null);
  const links = useRef<HTMLDivElement>(null);
  const session = useSession();
  const ready = useAuth((state) => state.status === "ready");
  const signOut = useSignOut();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  const place = (el: HTMLElement) => {
    const parent = links.current;
    if (!parent) return;
    const parentBox = parent.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    setPill({ x: box.left - parentBox.left, w: box.width, h: box.height });
  };

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60, display: "flex", justifyContent: "center", padding: "0 16px", pointerEvents: "none" }}>
      <div style={{ width: "100%", maxWidth: 1280, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="hm-nav-enter" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <nav
            className="hm-navbar"
            data-scrolled={scrolled}
            style={{ pointerEvents: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 0 18px" }}
          >
            <Logo />
            <div
              ref={links}
              className="hm-nav-links"
              onMouseLeave={() => setHover(null)}
              style={{ gap: 0 }}
            >
              {pill && hover && (
                <motion.span
                  className="hm-nav-pill"
                  initial={false}
                  animate={{ x: pill.x, width: pill.w, height: pill.h }}
                  transition={{ type: "tween", duration: 0.22, ease: EASE }}
                />
              )}
              {NAV.map((n) => (
                <a
                  key={n.l}
                  href={n.h}
                  onMouseEnter={(event) => {
                    setHover(n.l);
                    place(event.currentTarget);
                  }}
                  style={{ position: "relative", zIndex: 1, padding: "6px 13px", fontSize: 14, fontWeight: 450, letterSpacing: "-0.01em", color: INK, opacity: hover && hover !== n.l ? 0.6 : 1, transition: "opacity .25s ease", textDecoration: "none", borderRadius: 999 }}
                >
                  {n.l}
                </a>
              ))}
            </div>
            <div className="hm-nav-auth">
              {!ready ? null : session ? (
                <>
                  <Link className="hm-dash-go" href="/dashboard">Dashboard</Link>
                  <AccountChip session={session} />
                </>
              ) : (
                <>
                  <a className="hm-login" href={LINKS.login} style={{ padding: "6px 13px", fontSize: 14, fontWeight: 450, letterSpacing: "-0.01em", color: INK, textDecoration: "none" }}>Log in</a>
                  <Magnetic>
                    <motion.a href={LINKS.signup} whileTap={{ scale: 0.985 }} transition={{ type: "tween", duration: 0.16, ease: EASE }}
                      style={{ display: "inline-flex", alignItems: "center", background: INK, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em", padding: "8px 16px", borderRadius: 999, boxShadow: "inset 0 .5px 0 rgba(255,255,255,.22), 0 1px 2px rgba(17,18,15,.2)" }}>
                      Get started
                    </motion.a>
                  </Magnetic>
                </>
              )}
              <button className="hm-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}
                style={{ width: 36, height: 36, borderRadius: 999, border: `.5px solid ${LINE}`, background: "rgba(255,255,255,.7)", cursor: "pointer", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4.5 }}>
                <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 2.9 : 0 }} transition={{ duration: 0.22, ease: EASE }} style={{ width: 15, height: 1.5, background: INK, borderRadius: 2 }} />
                <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -2.9 : 0 }} transition={{ duration: 0.22, ease: EASE }} style={{ width: 15, height: 1.5, background: INK, borderRadius: 2 }} />
              </button>
            </div>
          </nav>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div className="hm-glass" initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ pointerEvents: "auto", width: "min(820px, 100%)", marginTop: 8, borderRadius: 22, padding: 8, background: GLASS_BG, backdropFilter: GLASS_ON, WebkitBackdropFilter: GLASS_ON, boxShadow: GLASS_EDGE }}>
              {NAV.map((n, i) => (
                <motion.a key={n.l} href={n.h} onClick={() => setOpen(false)} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, duration: 0.28, ease: EASE }}
                  style={{ display: "block", padding: "12px 14px", fontSize: 17, fontWeight: 450, letterSpacing: "-0.015em", color: INK, textDecoration: "none", borderRadius: 14 }}>{n.l}</motion.a>
              ))}
              {!ready ? null : session ? (
                <>
                  <MotionLink href="/dashboard" onClick={() => setOpen(false)} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * NAV.length, duration: 0.28, ease: EASE }}
                    style={{ display: "block", padding: "12px 14px", fontSize: 17, fontWeight: 450, letterSpacing: "-0.015em", color: INK, textDecoration: "none", borderRadius: 14 }}>
                    Dashboard
                  </MotionLink>
                  <button type="button" onClick={() => { void signOut(); setOpen(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 14px", fontSize: 17, fontWeight: 450, letterSpacing: "-0.015em", color: INK, background: "none", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: "inherit" }}>
                    Sign out
                  </button>
                </>
              ) : (
                <motion.a href={LINKS.login} onClick={() => setOpen(false)} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * NAV.length, duration: 0.28, ease: EASE }}
                  style={{ display: "block", padding: "12px 14px", fontSize: 17, fontWeight: 450, letterSpacing: "-0.015em", color: INK, textDecoration: "none", borderRadius: 14 }}>
                  Log in
                </motion.a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
