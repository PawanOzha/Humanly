"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ico } from "@/components/icons";
import { Btn } from "@/components/ui/btn";
import { Magnetic } from "@/components/ui/magnetic";
import { Rise } from "@/components/ui/rise";
import { Segmented } from "@/components/ui/segmented";
import { EASE, h2, MODES, MUTED, type Mode } from "@/lib/tokens";

function SpotCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div ref={ref} className="hm-spot" whileHover={{ y: -4 }} transition={{ type: "tween", duration: 0.28, ease: EASE }}
      onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`); ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`); }}>
      <div style={{ position: "relative", zIndex: 1, padding: 22, height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
    </motion.div>
  );
}

function MiniTones() {
  const [v, setV] = useState<Mode>("Balanced");
  const out = { Balanced: "Teams need tools that work.", Academic: "Teams require dependable tools.", Casual: "Teams just need stuff that works." }[v];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Segmented items={MODES} value={v} onChange={setV} id="hm-feat-mode" />
      <AnimatePresence mode="wait"><motion.div key={v} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} style={{ fontSize: 15, padding: 12, background: "#f7f7f4", borderRadius: 12 }}>{out}</motion.div></AnimatePresence>
    </div>
  );
}

function MiniToggle() {
  const [o, setO] = useState(false);
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Segmented items={["Humanized", "Original"] as const} value={o ? "Original" : "Humanized"} onChange={(x) => setO(x === "Original")} id="hm-feat-view" />
      <AnimatePresence mode="wait"><motion.div key={String(o)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        style={{ fontSize: 15, padding: 12, background: o ? "rgba(229,72,77,.08)" : "rgba(47,158,91,.12)", borderRadius: 12 }}>
        {o ? "It is important to note that we must leverage this." : "We should use this."}</motion.div></AnimatePresence>
    </div>
  );
}

export function Features() {
  const rows: [string, number][] = [["rgba(229,72,77,.16)", 92], ["rgba(47,158,91,.2)", 12], ["rgba(229,72,77,.16)", 78]];
  const cards = [
    { t: "See what sounds AI", d: "Sentence-level scoring, marked up in the margin.", ui: (
      <div style={{ display: "grid", gap: 9 }}>{rows.map(([c, s], i) => (
        <motion.div key={i} initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 + i * 0.15, ease: EASE }} style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: c, borderRadius: 8, padding: "9px 12px", fontSize: 12.5, whiteSpace: "nowrap" }}><span>Sentence {i + 1}</span><span className="hm-mono">{s}%</span></div>
        </motion.div>))}</div>) },
    { t: "Pick your voice", d: "Balanced, academic or casual — switch in one click.", ui: <MiniTones /> },
    { t: "Meaning stays put", d: "Filler goes. Your facts and ideas stay.", ui: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{[["leverage", "use"], ["crucial", "key"], ["Moreover,", "Plus,"], ["cannot", "can't"]].map(([a, b]) => (
        <span key={a} className="hm-mono" style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, background: "#f7f7f4" }}><s style={{ opacity: 0.45 }}>{a}</s> → {b}</span>))}</div>) },
    { t: "Compare any time", d: "Flip between your original and the rewrite.", ui: <MiniToggle /> },
  ];
  return (
    <section style={{ padding: "60px 20px 120px", maxWidth: 1180, margin: "0 auto" }}>
      <Rise style={{ textAlign: "center", marginBottom: 56 }}>
        <h2 style={{ ...h2, maxWidth: 720, margin: "0 auto" }}>What makes the most natural humanizer?</h2>
        <p style={{ color: MUTED, fontSize: 18, marginTop: 16 }}>We’re so glad you asked.</p>
      </Rise>
      <div className="hm-feat">{cards.map((c, i) => (
        <Rise key={c.t} delay={i * 0.08} style={{ height: "100%" }}><SpotCard>
          <div style={{ minHeight: 132, marginBottom: 22 }}>{c.ui}</div>
          <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em" }}>{c.t}</div>
          <div style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.5, marginTop: 6 }}>{c.d}</div>
        </SpotCard></Rise>))}</div>
      <div style={{ textAlign: "center", marginTop: 48 }}><Magnetic><Btn href="#tool">Get started {Ico.arrow}</Btn></Magnetic></div>
    </section>
  );
}
