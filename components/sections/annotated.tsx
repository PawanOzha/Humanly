"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { EASE, GREEN, NOTE_W, RED, AMBER } from "@/lib/tokens";
import type { Sentence } from "@/lib/engine";

type Kind = "ai" | "human" | "lean-ai" | "lean-human";
type Mark = { i: number; ax: number; ay: number; ny: number; note: string; score: number; kind: Kind };

const NOTE_H = 46;
const PITCH = 58;
const MAX_DRIFT = 72;

function kindOf(s: Sentence): Kind | null {
  if (s.label === "AI-generated" || s.note === "Feels AI") return "ai";
  if (s.label === "Human-written" || s.note === "Reads human") return "human";
  if (s.note === "Leans AI") return "lean-ai";
  if (s.note === "Leans human") return "lean-human";
  return null;
}

function wash(kind: Kind | null) {
  if (kind === "ai") return "rgba(229,72,77,.12)";
  if (kind === "human" || kind === "lean-human") return "rgba(47,158,91,.16)";
  if (kind === "lean-ai") return "rgba(232,163,23,.16)";
  return "rgba(232,163,23,.08)";
}

function arrowPath(sx: number, sy: number, ex: number, ey: number) {
  const dx = ex - sx;
  const c1x = sx + dx * 0.4;
  const c2x = sx + dx * 0.75;
  const tip = Math.atan2(ey - sy, ex - c2x);
  const L = 9;
  const sp = 0.55;
  return {
    body: `M${sx} ${sy} C${c1x} ${sy}, ${c2x} ${ey}, ${ex} ${ey}`,
    head: `M${ex - L * Math.cos(tip - sp)} ${ey - L * Math.sin(tip - sp)} L${ex} ${ey} L${ex - L * Math.cos(tip + sp)} ${ey - L * Math.sin(tip + sp)}`,
  };
}

function spread<T>(items: T[], max: number) {
  if (items.length <= max) return items;
  const out: T[] = [];
  const step = (items.length - 1) / (max - 1);
  const seen = new Set<number>();
  for (let n = 0; n < max; n++) {
    const i = Math.round(n * step);
    if (seen.has(i)) continue;
    seen.add(i);
    out.push(items[i]);
  }
  return out;
}

export function Annotated({ sentences, wide }: { sentences: Sentence[]; wide: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [w, setW] = useState(0);

  const measure = useCallback(() => {
    const root = wrap.current;
    if (!root || !wide) { setMarks([]); return; }
    const rb = root.getBoundingClientRect();
    setW(rb.width);
    const gutter = rb.width - NOTE_W - 14;
    const found: Mark[] = [];
    sentences.forEach((s, i) => {
      const kind = kindOf(s);
      if (!kind || !s.note) return;
      const el = spans.current[i];
      const rects = el ? Array.from(el.getClientRects()) : [];
      if (!rects.length) return;
      const mid = (rects[0].top + rects[rects.length - 1].bottom) / 2;
      const ay = mid - rb.top;
      let line = rects[0];
      let best = Infinity;
      for (const r of rects) {
        const d = Math.abs((r.top + r.bottom) / 2 - (rb.top + ay));
        if (d < best) { best = d; line = r; }
      }
      let ax = line.right - rb.left + 3;
      if (ax > gutter) ax = gutter;
      found.push({ i, ax, ay, ny: ay, note: s.note, score: s.score, kind });
    });

    const strong = found.filter((m) => m.kind === "ai" || m.kind === "human");
    const pool = strong.length >= 3 ? strong : found;
    const chosen = spread(pool, 6);
    const out: Mark[] = [];
    let lastTop = -999;
    for (const m of chosen) {
      const ideal = Math.max(0, m.ay - NOTE_H / 2);
      let top = ideal;
      if (top < lastTop + PITCH) top = lastTop + PITCH;
      if (top - ideal > MAX_DRIFT) continue;
      lastTop = top;
      out.push({ ...m, ny: top + 16 });
    }
    setMarks(out);
  }, [sentences, wide]);

  useLayoutEffect(() => {
    measure();
    const t = setTimeout(measure, 480);
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [measure]);

  const noteBottom = marks.reduce((h, m) => Math.max(h, m.ny - 16 + NOTE_H + 8), 0);

  return (
    <div ref={wrap} className={wide ? "hm-annot" : undefined} style={{ position: "relative", minHeight: noteBottom || undefined }}>
      <p className="hm-body">
        {sentences.map((s, i) => {
          const kind = kindOf(s);
          const title = s.label ? `${s.label} · ${s.score}% AI` : `${s.score}% AI`;
          return (
            <motion.span key={`${i}-${s.score}`} ref={(el) => { spans.current[i] = el; }} title={title}
              initial={{ opacity: 0, backgroundSize: "0% 100%" }}
              animate={{ opacity: 1, backgroundSize: "100% 100%" }}
              transition={{ opacity: { duration: 0.35, delay: Math.min(i, 8) * 0.05 }, backgroundSize: { duration: 0.7, delay: 0.15 + Math.min(i, 8) * 0.05, ease: EASE } }}
              style={{
                borderRadius: 4, padding: "1px 1px", backgroundRepeat: "no-repeat", backgroundPosition: "0 88%",
                backgroundImage: `linear-gradient(${wash(kind)}, ${wash(kind)})`,
                WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone",
                textDecoration: kind === "ai" || kind === "lean-ai" ? "underline wavy rgba(229,72,77,.55)" : "none",
                textUnderlineOffset: 5, textDecorationThickness: 1,
              }}>
              {s.text}
            </motion.span>
          );
        })}
      </p>
      {wide && <div />}

      {wide && marks.length > 0 && (
        <>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
            <defs>
              <filter id="hm-pencil" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" />
              </filter>
            </defs>
            <g filter="url(#hm-pencil)" fill="none" stroke="#2d2f2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {marks.map((m, k) => {
                const p = arrowPath(w - NOTE_W - 2, m.ny, m.ax, m.ay);
                const d = 0.35 + k * 0.18;
                return (
                  <g key={m.i}>
                    <motion.path d={p.body} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.7, delay: d, ease: EASE }} />
                    <motion.path d={p.head} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.16, delay: d + 0.55 }} />
                  </g>
                );
              })}
            </g>
          </svg>
          {marks.map((m, k) => (
            <motion.div key={m.i} data-note={m.note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0, rotate: k % 2 ? 1.2 : -1.2 }}
              transition={{ duration: 0.35, delay: 0.45 + k * 0.16, ease: EASE }}
              style={{ position: "absolute", left: w - NOTE_W, top: m.ny - 16, width: NOTE_W - 8, paddingLeft: 8, pointerEvents: "none" }}>
              <div className="hm-hand" style={{ fontSize: 18, lineHeight: 1.05, color: "#2d2f2a" }}>{m.note}</div>
              <div className="hm-mono" style={{ fontSize: 10.5, color: m.kind === "human" || m.kind === "lean-human" ? GREEN : m.kind === "lean-ai" ? AMBER : RED, marginTop: 2 }}>{m.score}% AI</div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}
