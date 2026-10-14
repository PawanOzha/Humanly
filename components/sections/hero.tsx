"use client";

import { motion } from "motion/react";
import { EASE, INK, MUTED } from "@/lib/tokens";

const HEADLINE: { w: string; serif?: boolean }[][] = [[{ w: "Write" }, { w: "with" }, { w: "AI." }], [{ w: "Sound" }, { w: "human.", serif: true }]];

export function Hero() {
  return (
    <section style={{ padding: "160px 24px 56px", textAlign: "center" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="hm-mono"
        style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 14px 7px 8px", borderRadius: 999, background: "#fff", fontSize: 12, color: "#3d4039", boxShadow: "0 0 0 1px rgba(17,18,15,.06), 0 4px 14px -6px rgba(0,0,0,.12)" }}>
        <span style={{ background: "#d4f26a", color: INK, padding: "3px 8px", borderRadius: 999, fontWeight: 500 }}>New</span>
        <h1 style={{ margin: 0, font: "inherit", color: "inherit" }}>Humanora: AI humanizer &amp; sentence-level AI text detector</h1>
      </motion.div>
      <div role="img" aria-label="Write with AI. Sound human." style={{ margin: "28px auto 0", fontWeight: 400, letterSpacing: "-0.035em", fontSize: "clamp(46px, 7.2vw, 96px)", lineHeight: 1.02 }}>
        {HEADLINE.map((line, li) => (
          <div key={li}>
            {line.map((t, wi) => (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0.04em 0.06em 0.14em", marginRight: "0.12em" }}>
                <motion.span className={t.serif ? "hm-serif" : undefined} style={{ display: "inline-block", fontSize: t.serif ? "1.06em" : undefined }}
                  initial={{ y: "115%", rotate: 4 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 1, ease: EASE, delay: (li * 3 + wi) * 0.08 }}>{t.w}</motion.span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
        style={{ maxWidth: 540, margin: "26px auto 0", fontSize: 19, lineHeight: 1.55, color: MUTED }}>
        Paste a draft. We mark exactly which sentences read as AI, then rewrite them in a natural voice, meaning intact.
      </motion.p>
    </section>
  );
}
