"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { EASE, GREEN, RED } from "@/lib/tokens";

const LIME = "#d4f26a";
const CYCLE = 5600;

const STEPS = [
  { t: "Detect", d: "Every sentence is scored for stock phrases, even rhythm and missing contractions." },
  { t: "Rewrite", d: "Filler is cut, contractions added and rhythm varied, in the tone you pick." },
  { t: "Verify", d: "The result is re-scanned so you can compare it with your original." },
];

const hl = (c: string): CSSProperties => ({
  backgroundImage: `linear-gradient(${c},${c})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0 0",
  borderRadius: 4,
  padding: "2px 2px",
  WebkitBoxDecorationBreak: "clone",
  boxDecorationBreak: "clone",
});

function AnimatedNumber({ from = 0, to, delay = 0 }: { from?: number; to: number; delay?: number }) {
  const mv = useMotionValue(from);
  const rounded = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    const controls = animate(mv, to, { duration: 1.4, ease: EASE, delay });
    return () => controls.stop();
  }, [to, delay, mv]);
  return <motion.span>{rounded}</motion.span>;
}

function Check({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.path d="M3 8.5l3.2 3L13 4.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: EASE }} />
    </svg>
  );
}

function arrowPath(sx: number, sy: number, ex: number, ey: number) {
  const dx = ex - sx;
  const c1x = sx + dx * 0.35;
  const c2x = sx + dx * 0.72;
  const tip = Math.atan2(ey - sy, ex - c2x);
  const L = 8;
  const sp = 0.55;
  return {
    body: `M${sx.toFixed(0)} ${sy.toFixed(0)} C${c1x.toFixed(0)} ${sy.toFixed(0)}, ${c2x.toFixed(0)} ${ey.toFixed(0)}, ${ex.toFixed(0)} ${ey.toFixed(0)}`,
    head: `M${(ex - L * Math.cos(tip - sp)).toFixed(0)} ${(ey - L * Math.sin(tip - sp)).toFixed(0)} L${ex.toFixed(0)} ${ey.toFixed(0)} L${(ex - L * Math.cos(tip + sp)).toFixed(0)} ${(ey - L * Math.sin(tip + sp)).toFixed(0)}`,
  };
}

function DetectView() {
  const root = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLSpanElement>(null);
  const note = useRef<HTMLDivElement>(null);
  const [stroke, setStroke] = useState<{ body: string; head: string } | null>(null);

  const measure = useCallback(() => {
    const base = root.current?.getBoundingClientRect();
    const lines = target.current?.getClientRects();
    const nr = note.current?.getBoundingClientRect();
    if (!base || !lines?.length || !nr || base.width < 8) return;
    const line = lines[lines.length - 1];
    const next = arrowPath(
      nr.left - base.left - 4,
      nr.top - base.top + 12,
      (line.left + line.right) / 2 - base.left,
      (line.top + line.bottom) / 2 - base.top,
    );
    setStroke((prev) => (prev?.body === next.body && prev.head === next.head ? prev : next));
  }, []);

  useLayoutEffect(() => {
    measure();
    document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className="au-detect" ref={root}>
      <p className="au-copy">
        <motion.span
          ref={target}
          initial={{ backgroundSize: "0% 100%" }}
          animate={{ backgroundSize: "100% 100%" }}
          transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
          style={{ ...hl("rgba(229,72,77,.1)"), textDecoration: "underline wavy rgba(229,72,77,.65)", textUnderlineOffset: 5, textDecorationThickness: 1 }}
        >
          In today&apos;s fast-paced landscape, it is important to note that teams must leverage robust tools.
        </motion.span>
      </p>
      <motion.div
        className="au-beam"
        initial={{ top: "0%", opacity: 1 }}
        animate={{ top: "100%", opacity: [1, 1, 0] }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <div className="au-mark">
        <motion.div
          ref={note}
          className="au-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.9 }}
        >
          <div className="hm-hand">stock phrases + flat rhythm</div>
          <div className="hm-mono" style={{ color: RED }}>94% AI</div>
        </motion.div>
      </div>
      <p className="au-copy au-human-line">
        <motion.span
          initial={{ backgroundSize: "0% 100%" }}
          animate={{ backgroundSize: "100% 100%" }}
          transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
          style={hl("rgba(47,158,91,.2)")}
        >
          We tried it for a week and it just worked.
        </motion.span>
      </p>
      <motion.div
        className="au-human-chip hm-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15, duration: 0.4, ease: EASE }}
      >
        Reads human · 8%
      </motion.div>
      {stroke && (
        <svg className="au-detect-svg" aria-hidden>
          <motion.path d={stroke.body} fill="none" stroke="#2d2f2a" strokeWidth="1.6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 1.05, ease: EASE }} />
          <motion.path d={stroke.head} fill="none" stroke="#2d2f2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.65, duration: 0.15 }} />
        </svg>
      )}
    </div>
  );
}

function RewriteView() {
  const swaps: [string, string][] = [
    ["In today's fast-paced landscape,", "These days,"],
    ["it is important to note that", "cut"],
    ["must leverage robust", "need solid"],
  ];
  const out = "These days, teams need solid tools.".split(" ");
  return (
    <div>
      <div className="au-swaps">
        {swaps.map(([from, to], i) => (
          <motion.div
            key={from}
            className="au-swap"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.2 + i * 0.28 }}
          >
            <span className="au-swap-from">
              {from}
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.35, delay: 0.45 + i * 0.28, ease: EASE }} />
            </span>
            <span className="au-swap-arrow" aria-hidden>→</span>
            <span className={to === "cut" ? "au-swap-to is-cut" : "au-swap-to"}>{to === "cut" ? "(cut)" : to}</span>
          </motion.div>
        ))}
      </div>
      <div className="au-rule" />
      <div className="au-kicker hm-mono">HUMANIZED</div>
      <p className="au-copy">
        <span style={hl("rgba(47,158,91,.2)")}>
          {out.map((word, i) => (
            <motion.span
              key={word}
              className="au-word"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 1.35 + i * 0.07 }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      </p>
    </div>
  );
}

function VerifyView() {
  const rows: [string, number, string, number][] = [
    ["Original", 94, RED, 0.3],
    ["Humanized", 11, GREEN, 0.8],
  ];
  const checks = ["Meaning kept", "Contractions added", "Rhythm varied"];
  return (
    <div>
      <div className="au-scorehead">
        <span className="au-score">
          <AnimatedNumber from={94} to={11} delay={0.45} />
          <span>%</span>
        </span>
        <span className="hm-mono">AI detected</span>
        <motion.span
          className="au-human-pill hm-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 1.6 }}
        >
          Reads as human
        </motion.span>
      </div>
      <div className="au-bars">
        {rows.map(([label, value, color, delay]) => (
          <div key={label}>
            <div className="au-bar-meta">
              <span>{label}</span>
              <span className="hm-mono">{value}%</span>
            </div>
            <div className="au-track">
              <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.1, ease: EASE, delay }} style={{ background: color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="au-checks">
        {checks.map((check, i) => (
          <motion.span key={check} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 + i * 0.12, duration: 0.4, ease: EASE }}>
            <span style={{ color: GREEN, display: "inline-flex" }}><Check size={13} /></span>
            {check}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

const VIEWS = [DetectView, RewriteView, VerifyView];

export function HowPanel() {
  const reduce = !!useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setTimeout(() => setStep((current) => (current + 1) % STEPS.length), CYCLE);
    return () => window.clearTimeout(timer);
  }, [step, reduce]);

  const View = VIEWS[step];

  return (
    <aside className="au-right" aria-label="How Humanora marks a draft, rewrites it, and checks the result.">
      <div className="au-glow" aria-hidden />
      <div className="au-right-in">
        <div>
          <div className="au-how hm-mono">HOW IT WORKS</div>
          <h2>
            We show our work,
            <br />
            <span className="hm-serif">sentence by sentence.</span>
          </h2>
        </div>

        <div className="au-stage">
          <div className="au-paper">
            <div className="au-paper-top">
              <span className="hm-mono">0{step + 1} / {STEPS[step].t.toUpperCase()}</span>
              <span className="au-dots" aria-hidden>
                {[0, 1, 2].map((i) => <span key={i} data-on={i === step} />)}
              </span>
            </div>
            <div className="au-paper-body">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <View />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="au-steps">
          {STEPS.map((item, i) => (
            <button key={item.t} type="button" className="au-step" data-active={i === step} onClick={() => setStep(i)}>
              <div className="au-step-track">
                {i === step ? (
                  <motion.div key={step} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: reduce ? 0 : CYCLE / 1000, ease: "linear" }} />
                ) : (
                  <div style={{ width: i < step ? "100%" : "0%" }} />
                )}
              </div>
              <div className="au-step-title">{item.t}</div>
              <div className="au-step-copy">{item.d}</div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
