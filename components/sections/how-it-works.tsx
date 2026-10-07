"use client";

import { Clip } from "@/components/ui/clip";
import { Rise } from "@/components/ui/rise";
import { Sticky } from "@/components/ui/sticky";
import { h2, MUTED } from "@/lib/tokens";

const STEPS = [
  { n: "01", t: "Paste your draft", d: "Drop in anything AI wrote — essay, email, blog post.", c: "#ffe566", r: -3 },
  { n: "02", t: "We read it like a detector", d: "Every sentence is scored, so you see exactly what sounds robotic.", c: "#ffc2d4", r: 2.5 },
  { n: "03", t: "Rewrite, don't just swap", d: "Rhythm, contractions and filler get rebuilt in the tone you pick.", c: "#bfe0ff", r: -2 },
  { n: "04", t: "Check & copy", d: "Re-scan the result, flip to the original, copy it out.", c: "#c9f2a8", r: 3 },
];
const TECHS = ["Cuts filler like “it is important to note”", "Adds natural contractions", "Varies sentence length", "Keeps names, numbers and facts", "Balanced · Academic · Casual"];

export function HowItWorks() {
  return (
    <section id="how" style={{ padding: "100px 20px 120px", position: "relative" }}>
      <Rise style={{ textAlign: "center" }}>
        <h2 style={{ ...h2, maxWidth: 760, margin: "0 auto" }}>How we make AI writing sound human.</h2>
        <p style={{ margin: "18px auto 0", color: MUTED, fontSize: 18 }}>Four steps. No black box.</p>
      </Rise>
      <div className="hm-board">
        <div className="hm-steps">
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ paddingTop: i % 2 ? 44 : 0, display: "flex", justifyContent: "center" }}>
              <Sticky color={s.c} rotate={s.r} w={236} delay={i * 0.12} style={{ minHeight: 230 }}>
                <Clip style={{ top: -22, left: 18 }} rotate={-8} />
                <div className="hm-mono" style={{ fontSize: 12, opacity: 0.6, fontFamily: "'IBM Plex Mono', monospace" }}>{s.n}</div>
                <div style={{ fontSize: 30, lineHeight: 1, margin: "8px 0 10px" }}>{s.t}</div>
                <div style={{ fontSize: 20, lineHeight: 1.2, opacity: 0.8 }}>{s.d}</div>
              </Sticky>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 70 }}>
          {TECHS.map((t, i) => (
            <Sticky key={t} w={210} rotate={[-2, 1.5, -1, 2, -1.5][i]} delay={0.1 * i} color={["#fff3a8", "#ffd9e4", "#d4ebff", "#dcf7c4", "#fff3a8"][i]} style={{ padding: "16px 16px 20px", fontSize: 21 }}>{t}</Sticky>
          ))}
        </div>
      </div>
    </section>
  );
}
