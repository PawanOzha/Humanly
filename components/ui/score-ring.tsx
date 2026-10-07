"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { EASE, INK, MUTED, toneOf, type Phase } from "@/lib/tokens";

export function ScoreRing({ score, phase }: { score: number; phase: Phase }) {
  const R = 52;
  const empty = phase === "idle" || phase === "scanning" || phase === "humanizing";
  return (
    <div style={{ position: "relative", width: 132, height: 132 }}>
      <svg viewBox="0 0 132 132" width="132" height="132" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="66" cy="66" r={R} fill="none" stroke="#eeeeea" strokeWidth="9" />
        <motion.circle cx="66" cy="66" r={R} fill="none" strokeWidth="9" strokeLinecap="round" initial={{ pathLength: 0 }}
          animate={{ pathLength: empty ? 0 : Math.max(score, 2) / 100, stroke: toneOf(score) }} transition={{ duration: 1.2, ease: EASE }} />
        {(phase === "scanning" || phase === "humanizing") && (
          <motion.circle cx="66" cy="66" r={R} fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeDasharray="60 270"
            style={{ originX: 0.5, originY: 0.5 }} animate={{ rotate: 360 }} transition={{ duration: 1, ease: "linear", repeat: Infinity }} />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        {phase === "idle" ? <span style={{ fontSize: 26, color: "#cfcfca" }}>—</span>
          : phase === "scanning" || phase === "humanizing" ? <span className="hm-mono" style={{ fontSize: 11, color: MUTED }}>{phase === "humanizing" ? "rewriting" : "scanning"}</span>
          : (<div>
              <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}><AnimatedNumber value={score} /><span style={{ fontSize: 15, marginLeft: 2 }}>%</span></div>
              <div className="hm-mono" style={{ fontSize: 10.5, color: MUTED, marginTop: 6 }}>AI detected</div>
            </div>)}
      </div>
    </div>
  );
}
