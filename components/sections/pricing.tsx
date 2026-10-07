"use client";

import { motion } from "motion/react";
import { Ico } from "@/components/icons";
import { Btn } from "@/components/ui/btn";
import { Rise } from "@/components/ui/rise";
import { EASE, GREEN, h2, INK, LINE } from "@/lib/tokens";

const PLANS = [
  { n: "Free", p: "$0", d: "Try it out", f: ["500 words per run", "AI score + markup", "Balanced tone"], dark: false },
  { n: "Pro", p: "$12", d: "per month", f: ["15,000 words / month", "All three tones", "Original vs. humanized", "Priority speed"], dark: true },
  { n: "Team", p: "$29", d: "per seat / month", f: ["Shared workspace", "Higher limits", "Usage dashboard"], dark: false },
];

export function Pricing() {
  return (
    <section id="pricing" style={{ padding: "40px 20px 120px", maxWidth: 1080, margin: "0 auto" }}>
      <Rise style={{ textAlign: "center", marginBottom: 56 }}><h2 style={h2}>Simple pricing.</h2></Rise>
      <div className="hm-price">{PLANS.map((p, i) => (
        <Rise key={p.n} delay={i * 0.1}>
          <motion.div whileHover={{ y: -6 }} transition={{ type: "tween", duration: 0.28, ease: EASE }}
            style={{ padding: 28, borderRadius: 24, background: p.dark ? INK : "#fff", color: p.dark ? "#fff" : INK, border: `1px solid ${p.dark ? INK : LINE}`, boxShadow: p.dark ? "0 40px 80px -30px rgba(0,0,0,.5)" : "0 20px 50px -30px rgba(0,0,0,.2)" }}>
            <div style={{ fontSize: 15, opacity: 0.7 }}>{p.n}</div>
            <div style={{ fontSize: 52, letterSpacing: "-0.04em", margin: "10px 0 2px" }}>{p.p}</div>
            <div className="hm-mono" style={{ fontSize: 12, opacity: 0.6, marginBottom: 24 }}>{p.d}</div>
            <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>{p.f.map((x) => <div key={x} style={{ display: "flex", gap: 10, fontSize: 14.5 }}><span style={{ color: p.dark ? "#d4f26a" : GREEN }}>{Ico.check}</span>{x}</div>)}</div>
            <Btn full variant={p.dark ? "light" : "ghost"} href={p.n === "Free" ? "/signup" : "#tool"}>{p.n === "Free" ? "Start free" : `Choose ${p.n}`}</Btn>
          </motion.div>
        </Rise>))}</div>
    </section>
  );
}
