"use client";

import { motion } from "motion/react";
import { Ico } from "@/components/icons";
import { Btn } from "@/components/ui/btn";
import { Logo } from "@/components/ui/logo";
import { Magnetic } from "@/components/ui/magnetic";
import { Rise } from "@/components/ui/rise";
import { Sticky } from "@/components/ui/sticky";
import { LINKS } from "@/lib/links";
import { scrollToY } from "@/lib/smooth-scroll";
import { BRAND, EASE, h2, INK, RED } from "@/lib/tokens";

function NameTag() {
  return (
    <motion.div animate={{ y: [0, -9, 0], rotate: [-6, -3, -6] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 150, borderRadius: 10, overflow: "hidden", boxShadow: "0 18px 40px -12px rgba(0,0,0,.5)", background: "#fff" }}>
      <div style={{ background: RED, color: "#fff", textAlign: "center", fontWeight: 700, letterSpacing: ".18em", fontSize: 16, padding: "9px 0 3px" }}>HELLO</div>
      <div style={{ background: RED, color: "#fff", textAlign: "center", fontSize: 10, paddingBottom: 7 }}>my draft is</div>
      <div className="hm-hand" style={{ textAlign: "center", fontSize: 32, padding: "6px 0 12px", color: INK }}>human ✓</div>
    </motion.div>
  );
}

export function Closing() {
  const cols = [
    ["Product", [["How it works", "#how"], ["Examples", "#examples"], ["Pricing", "#pricing"], ["FAQ", "#faq"]]],
    ["Developers", [["API", "#api"], ["API docs", LINKS.docs], ["API keys", LINKS.apiKeys]]],
    ["Account", [["Get started", LINKS.signup], ["Log in", LINKS.login], ["Plans", LINKS.plans]]],
  ] as const;
  return (
    <section className="hm-green" style={{ position: "relative", color: "#fff", overflow: "hidden", padding: "150px 20px 40px" }}>
      <div style={{ position: "absolute", left: 40, top: 70 }} className="hm-hide-s"><NameTag /></div>
      <div style={{ position: "absolute", right: 50, bottom: 260 }} className="hm-hide-s">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}><Sticky w={190} rotate={6} style={{ color: INK, fontSize: 25 }}><div style={{ textDecoration: "line-through", opacity: 0.5 }}>ping: sounds robotic</div>nvm, human!</Sticky></motion.div>
      </div>
      <Rise style={{ textAlign: "center", position: "relative" }}>
        <h2 style={{ ...h2, fontSize: "clamp(44px, 7vw, 96px)" }}>Love it? <span className="hm-serif">Write on.</span></h2>
        <p style={{ color: "rgba(255,255,255,.7)", fontSize: 19, margin: "22px auto 0", maxWidth: 440 }}>Paste a draft and see the difference in seconds.</p>
        <div style={{ marginTop: 34 }}><Magnetic><Btn variant="light" href="#tool">Try it free {Ico.arrow}</Btn></Magnetic></div>
      </Rise>

      <footer style={{ position: "relative", maxWidth: 1100, margin: "180px auto 0" }}>
        <div className="hm-foot">
          <div><Logo light /><p style={{ color: "rgba(255,255,255,.55)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 280, marginTop: 16 }}>AI detection and humanizing that shows its work.</p></div>
          {cols.map(([t, ls]) => (
            <div key={t}><div className="hm-mono" style={{ fontSize: 11.5, letterSpacing: ".08em", color: "rgba(255,255,255,.45)", marginBottom: 16 }}>{t.toUpperCase()}</div>
              <div style={{ display: "grid", gap: 11 }}>{ls.map(([l, h]) => <motion.a key={l} href={h} whileHover={{ x: 3 }} transition={{ type: "tween", duration: 0.2, ease: EASE }} style={{ color: "#fff", textDecoration: "none", fontSize: 15 }}>{l}</motion.a>)}</div></div>))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 70, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.12)", fontSize: 13, color: "rgba(255,255,255,.5)", flexWrap: "wrap", gap: 12 }}>
          <span>© {new Date().getFullYear()} {BRAND}. All rights reserved.</span>
          <button onClick={() => scrollToY(0)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Back to top ↑</button>
        </div>
        <div aria-hidden style={{ fontSize: "clamp(64px, 19vw, 240px)", lineHeight: 0.8, letterSpacing: "-0.06em", textAlign: "center", marginTop: 50, color: "rgba(255,255,255,.07)", userSelect: "none", whiteSpace: "nowrap", overflow: "hidden" }}>{BRAND}</div>
      </footer>
    </section>
  );
}
