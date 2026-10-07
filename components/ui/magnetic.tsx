"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

const SPRING = { stiffness: 170, damping: 26, mass: 0.4, restDelta: 0.01 };

export function Magnetic({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const origin = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });

  if (reduce) return <div style={{ display: "inline-block" }}>{children}</div>;

  const settle = () => {
    frame.current = 0;
    const o = origin.current;
    const dx = Math.round(Math.max(-6, Math.min(6, (point.current.x - (o.left + o.width / 2)) * 0.16)) * 10) / 10;
    const dy = Math.round(Math.max(-4, Math.min(4, (point.current.y - (o.top + o.height / 2)) * 0.16)) * 10) / 10;
    x.set(dx);
    y.set(dy);
  };

  const capture = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    origin.current = {
      left: box.left - x.get(),
      top: box.top - y.get(),
      width: box.width,
      height: box.height,
    };
    point.current = { x: event.clientX, y: event.clientY };
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: "inline-block", willChange: "transform" }}
      onPointerEnter={capture}
      onPointerMove={(event) => {
        if (!origin.current.width) capture(event);
        point.current = { x: event.clientX, y: event.clientY };
        if (frame.current) return;
        frame.current = requestAnimationFrame(settle);
      }}
      onPointerLeave={() => {
        if (frame.current) cancelAnimationFrame(frame.current);
        frame.current = 0;
        origin.current.width = 0;
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
