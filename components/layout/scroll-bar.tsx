"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import { scrollToY } from "@/lib/smooth-scroll";

const EDGE = 10;
const MIN_THUMB = 56;

type Metrics = { track: number; thumb: number; max: number };

function measure(): Metrics {
  const view = window.innerHeight;
  const max = Math.max(0, document.documentElement.scrollHeight - view);
  const track = Math.max(0, view - EDGE * 2);
  const thumb = max <= 0 ? track : Math.min(track, Math.max(MIN_THUMB, (view / (view + max)) * track));
  return { track, thumb, max };
}

export function ScrollBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<Metrics>({ track: 0, thumb: MIN_THUMB, max: 0 });
  const y = useMotionValue(0);
  const { scrollYProgress } = useScroll();
  const [thumbH, setThumbH] = useState(MIN_THUMB);
  const [active, setActive] = useState(false);

  const paint = useCallback(
    (p: number) => {
      const m = metricsRef.current;
      y.set(Math.round(p * Math.max(0, m.track - m.thumb)));
      trackRef.current?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    },
    [y],
  );

  useMotionValueEvent(scrollYProgress, "change", paint);

  useEffect(() => {
    const update = () => {
      const m = measure();
      metricsRef.current = m;
      setThumbH(m.thumb);
      setActive(m.max > 1);
      paint(scrollYProgress.get());
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    ro.observe(document.body);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [paint, scrollYProgress]);

  useEffect(() => {
    if (active) paint(scrollYProgress.get());
  }, [active, thumbH, paint, scrollYProgress]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const track = trackRef.current;
    const m = metricsRef.current;
    if (!track || m.max <= 0) return;
    e.preventDefault();
    track.setPointerCapture(e.pointerId);

    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, m.track - m.thumb);
    const thumbTop = scrollYProgress.get() * travel;
    const local = e.clientY - rect.top;
    const onThumb = local >= thumbTop && local <= thumbTop + m.thumb;
    const grab = onThumb ? local - thumbTop : m.thumb / 2;

    const moveTo = (clientY: number) => {
      const next = clientY - rect.top - grab;
      const p = Math.min(1, Math.max(0, next / travel));
      scrollToY(p * m.max, true);
    };

    moveTo(e.clientY);
    const onMove = (ev: PointerEvent) => moveTo(ev.clientY);
    const onUp = () => {
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
    };
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const view = window.innerHeight;
    const current = window.scrollY;
    const max = metricsRef.current.max;
    const steps: Record<string, number> = {
      ArrowDown: current + 80,
      ArrowUp: current - 80,
      PageDown: current + view * 0.86,
      PageUp: current - view * 0.86,
      Home: 0,
      End: max,
    };
    if (!(e.key in steps)) return;
    e.preventDefault();
    scrollToY(steps[e.key], false);
  };

  if (!active) return null;

  return (
    <div
      ref={trackRef}
      className="hm-scroll"
      role="scrollbar"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-label="Page position"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      <motion.div className="hm-scroll-thumb" style={{ height: thumbH, y }} />
    </div>
  );
}
