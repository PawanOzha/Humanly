"use client";

import { motion } from "motion/react";
import { clamp, EASE, MUTED } from "@/lib/tokens";

export function Metric({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 7 }}>
        <span style={{ color: MUTED }}>{label}</span><span className="hm-mono">{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: "#eeeeea", overflow: "hidden" }}>
        <motion.div animate={{ width: `${clamp(pct, 0, 100)}%`, backgroundColor: color }} transition={{ duration: 0.9, ease: EASE }} style={{ height: "100%", borderRadius: 4 }} />
      </div>
    </div>
  );
}
