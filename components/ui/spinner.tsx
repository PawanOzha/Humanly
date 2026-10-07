"use client";

import { motion } from "motion/react";
import { INK } from "@/lib/tokens";

export function Spinner({ size = 14, color = INK }: { size?: number; color?: string }) {
  return (
    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      style={{ width: size, height: size, borderRadius: "50%", display: "inline-block", flexShrink: 0, border: `1.6px solid ${color}33`, borderTopColor: color }} />
  );
}
