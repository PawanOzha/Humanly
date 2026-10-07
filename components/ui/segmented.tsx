"use client";

import { motion } from "motion/react";
import { EASE, INK, MUTED } from "@/lib/tokens";

export function Segmented<T extends string>({ items, value, onChange, id }: { items: readonly T[]; value: T; onChange: (v: T) => void; id: string }) {
  return (
    <div style={{ display: "flex", padding: 3, background: "#f1f1ee", borderRadius: 12 }}>
      {items.map((m) => (
        <button key={m} onClick={() => onChange(m)}
          style={{ position: "relative", padding: "7px 13px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, borderRadius: 9, fontFamily: "inherit", color: value === m ? INK : MUTED, transition: "color .2s" }}>
          {value === m && <motion.span layoutId={id} transition={{ type: "tween", duration: 0.28, ease: EASE }} style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: 9, boxShadow: "0 1px 3px rgba(0,0,0,.1)" }} />}
          <span style={{ position: "relative" }}>{m}</span>
        </button>
      ))}
    </div>
  );
}
