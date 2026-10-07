"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { BLUE, EASE, h2 } from "@/lib/tokens";

function Word({ w, p, a, b, mark }: { w: string; p: MotionValue<number>; a: number; b: number; mark: boolean }) {
  const o = useTransform(p, [a, b], [0.16, 1]);
  return (
    <motion.span style={{ opacity: o, position: "relative", display: "inline-block", marginRight: "0.26em" }}>
      {w}
      {mark && (
        <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: "-0.12em", width: "100%", height: "0.3em", overflow: "visible" }}>
          <motion.path d="M2 8 C 25 2, 60 12, 98 4" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.6, ease: EASE }} />
        </svg>
      )}
    </motion.span>
  );
}

export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const words = ["Essays,", "emails,", "blogs,", "reports…", "we", "humanize", "it", "all", "and", "we", "do", "it", "fast."];
  const marks = new Set([7, 12]);
  return (
    <section ref={ref} style={{ padding: "60px 24px 140px", textAlign: "center" }}>
      <h2 style={{ ...h2, maxWidth: 940, margin: "0 auto", fontSize: "clamp(36px, 5.6vw, 76px)" }}>
        {words.map((w, i) => { const a = (i / words.length) * 0.8; return <Word key={i} w={w} p={scrollYProgress} a={a} b={a + 0.2} mark={marks.has(i)} />; })}
      </h2>
    </section>
  );
}
