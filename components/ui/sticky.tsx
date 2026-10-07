"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { EASE } from "@/lib/tokens";

export function Sticky({ color = "#ffe566", rotate = 0, w = 220, children, style, delay = 0 }: { color?: string; rotate?: number; w?: number; children: ReactNode; style?: CSSProperties; delay?: number }) {
  return (
    <motion.div className="hm-sticky hm-hand" initial={{ opacity: 0, y: -50, rotate: rotate - 10 }} whileInView={{ opacity: 1, y: 0, rotate }} viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 180, damping: 24, delay }} whileHover={{ rotate: 0, y: -6, scale: 1.02, transition: { type: "tween", duration: 0.28, ease: EASE } }} style={{ width: w, background: color, ...style }}>
      {children}
    </motion.div>
  );
}
