"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Rise } from "@/components/ui/rise";
import { EASE, h2, INK, LINE, MUTED } from "@/lib/tokens";

const FAQS = [
  ["How does the AI score work?", "Each sentence is scored for patterns common in AI writing — stock phrases, uniform rhythm, missing contractions — and the sentence scores roll up into one overall percentage."],
  ["Will it change my meaning?", "The rewrite targets phrasing, rhythm and tone. Review the result and flip to the original at any time to compare."],
  ["Which tones can I use?", "Balanced, Academic and Casual. Switch before you humanize."],
  ["Can I check text without rewriting it?", "Yes. “Check AI score” marks up your draft without changing a word."],
  ["Is there a free plan?", "Yes — paste a draft above and try it right now."],
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [o, setO] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button onClick={() => setO(!o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, padding: "24px 4px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 20, letterSpacing: "-0.01em", textAlign: "left", color: INK }}>
        {q}<motion.span animate={{ rotate: o ? 45 : 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {o && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} style={{ overflow: "hidden" }}>
          <p style={{ margin: 0, padding: "0 4px 24px", color: MUTED, fontSize: 16.5, lineHeight: 1.65, maxWidth: 640 }}>{a}</p></motion.div>}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" style={{ padding: "20px 20px 130px", maxWidth: 820, margin: "0 auto" }}>
      <Rise style={{ textAlign: "center", marginBottom: 48 }}><h2 style={h2}>Questions, answered.</h2></Rise>
      <Rise>{FAQS.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}</Rise>
    </section>
  );
}
