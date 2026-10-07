"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { EASE } from "@/lib/tokens";

export function Rise({ children, delay = 0, y = 40, style }: { children: ReactNode; delay?: number; y?: number; style?: CSSProperties }) {
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, ease: EASE, delay }} style={style}>{children}</motion.div>;
}
