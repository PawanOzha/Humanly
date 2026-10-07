"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Clip } from "@/components/ui/clip";
import { CountOnView } from "@/components/ui/count-on-view";
import { Rise } from "@/components/ui/rise";
import { Sticky } from "@/components/ui/sticky";
import { GREEN, h2, MUTED, RED } from "@/lib/tokens";

const U = (c: string): CSSProperties => ({ textDecoration: `underline wavy ${c}`, textUnderlineOffset: 4 });
const G: CSSProperties = { background: "rgba(47,158,91,.2)", borderRadius: 4, padding: "1px 3px" };

export function Compare() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yL = useTransform(scrollYProgress, [0, 1], [70, -50]);
  const yR = useTransform(scrollYProgress, [0, 1], [120, -90]);
  const rL = useTransform(scrollYProgress, [0, 1], [-5, -1]);
  const rR = useTransform(scrollYProgress, [0, 1], [5, 1.5]);
  return (
    <section id="examples" ref={ref} style={{ padding: "110px 20px 140px", textAlign: "center", position: "relative" }}>
      <Rise><h2 style={{ ...h2, maxWidth: 820, margin: "0 auto" }}>We turn robotic drafts into writing people actually finish reading.</h2></Rise>
      <Rise delay={0.1}><p style={{ maxWidth: 480, margin: "20px auto 0", color: MUTED, fontSize: 18, lineHeight: 1.55 }}>Same ideas. Same facts. A completely different voice.</p></Rise>
      <div className="hm-cmp" style={{ position: "relative", maxWidth: 940, margin: "80px auto 0" }}>
        <motion.div className="hm-paper" style={{ y: yL, rotate: rL }}>
          <Clip style={{ top: -26, right: 40 }} rotate={14} />
          <div className="hm-mono" style={{ fontSize: 11, color: MUTED, letterSpacing: ".08em" }}>FROM · AI DRAFT</div>
          <div style={{ display: "inline-flex", margin: "16px 0", padding: "6px 12px", borderRadius: 999, background: "rgba(229,72,77,.1)", color: RED, fontSize: 13, fontWeight: 500 }}><CountOnView to={94} />% AI detected</div>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.75, textAlign: "left" }}>
            <span style={U("rgba(229,72,77,.6)")}>{"In today's fast-paced landscape, it is important to note"}</span> that teams must <span style={U("rgba(229,72,77,.6)")}>leverage robust</span> tools. <span style={U("rgba(229,72,77,.6)")}>Moreover</span>, a comprehensive plan is <span style={U("rgba(229,72,77,.6)")}>crucial</span>.
          </p>
        </motion.div>
        <motion.div className="hm-paper" style={{ y: yR, rotate: rR }}>
          <Clip style={{ top: -26, left: 40 }} rotate={-12} />
          <div className="hm-mono" style={{ fontSize: 11, color: MUTED, letterSpacing: ".08em" }}>TO · HUMANIZED</div>
          <div style={{ display: "inline-flex", margin: "16px 0", padding: "6px 12px", borderRadius: 999, background: "rgba(47,158,91,.12)", color: GREEN, fontSize: 13, fontWeight: 500 }}><CountOnView from={94} to={11} />% AI detected</div>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.75, textAlign: "left" }}>
            <span style={G}>These days, teams need tools that actually work.</span> <span style={G}>And a solid plan matters more than ever.</span>
          </p>
        </motion.div>
        <Sticky w={200} rotate={-5} delay={0.3} style={{ position: "absolute", left: "50%", bottom: -40, marginLeft: -100, zIndex: 4 }}>
          <div style={{ textDecoration: "line-through", opacity: 0.55, fontSize: 21 }}>ping: sounds like a robot</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>nvm, human! ♡</div>
        </Sticky>
      </div>
    </section>
  );
}
