"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Closing } from "@/components/sections/closing";
import { Letter } from "@/components/sections/letter";

export function FooterReveal() {
  const sheet = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sheet,
    offset: ["start end", "start start"],
  });
  const shade = useTransform(scrollYProgress, [0, 0.45, 1], [0, 0.05, 0.4]);

  return (
    <div className="hm-reveal">
      <div className="hm-reveal-pin">
        <Letter />
        {!reduce && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              background: "#02110b",
              opacity: shade,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
      <div ref={sheet} className="hm-reveal-sheet">
        <Closing />
      </div>
    </div>
  );
}
