"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { EASE } from "@/lib/tokens";

export function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const r = useTransform(mv, (v) => Math.round(v));
  useEffect(() => { const c = animate(mv, value, { duration: 1.2, ease: EASE }); return () => c.stop(); }, [value, mv]);
  return <motion.span>{r}</motion.span>;
}
