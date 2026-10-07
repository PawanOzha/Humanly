"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { EASE } from "@/lib/tokens";

export function CountOnView({ from = 0, to }: { from?: number; to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(from);
  const r = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration: 1.6, ease: EASE, delay: 0.4 });
    return () => c.stop();
  }, [inView, to, mv]);
  return <span ref={ref}><motion.span>{r}</motion.span></span>;
}
