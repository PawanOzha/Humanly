"use client";

import { LINKS } from "@/lib/links";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Btn } from "@/components/ui/btn";
import { Clip } from "@/components/ui/clip";
import { Rise } from "@/components/ui/rise";
import { Sticky } from "@/components/ui/sticky";
import { FOUNDER, h2, INK } from "@/lib/tokens";

export function Letter() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rot = useTransform(scrollYProgress, [0, 0.5, 1], [-5, -1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, -60]);
  return (
    <section ref={ref} className="hm-letter-sec" style={{ background: "linear-gradient(180deg,#0a2a6c 0%,#123c93 55%,#0d2f7a 100%)", color: "#fff", textAlign: "center", position: "relative", overflow: "hidden", width: "100%" }}>
      <motion.div className="hm-letter" style={{ rotate: rot, y }}>
        <Clip style={{ top: -26, left: "50%" }} rotate={6} />
        <div style={{ textAlign: "left", color: INK, fontSize: 18, lineHeight: "32px" }}>
          <p style={{ margin: "0 0 22px" }}>Dear writer,</p>
          <p style={{ margin: "0 0 18px" }}>Drafting with AI isn’t cheating — it’s just faster. But when every sentence sounds the same, readers stop trusting it, and detectors flag it.</p>
          <p style={{ margin: "0 0 18px" }}>So we built a humanizer that shows its work: every robotic sentence marked, every fix visible. No black box.</p>
          <p style={{ margin: "0 0 4px" }}>Write human.</p>
          <div className="hm-hand" style={{ fontSize: 34, marginTop: 6 }}>{FOUNDER}</div>
        </div>
        <Sticky w={170} rotate={7} color="#ffe566" delay={0.4} style={{ position: "absolute", right: -50, bottom: 40, color: INK, fontSize: 26 }}>sounds like me ✓</Sticky>
      </motion.div>
      <Rise style={{ marginTop: 28 }}>
        <p style={{ ...h2, fontSize: "clamp(24px, 2.6vw, 36px)", maxWidth: 720, margin: "0 auto" }}>When your words sound like you, people actually read them — and the more gets done, faster.</p>
        <div style={{ marginTop: 32 }}><Btn variant="light" href={LINKS.signup}>Get started free</Btn></div>
      </Rise>
    </section>
  );
}
