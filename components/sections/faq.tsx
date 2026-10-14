"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FAQS } from "@/lib/faqs";
import { Rise } from "@/components/ui/rise";
import { EASE, h2, INK, LINE, MUTED } from "@/lib/tokens";


function FaqItem({ q, a }: { q: string; a: string }) {
  const [o, setO] = useState(false);
  const id = `faq-${q.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button onClick={() => setO(!o)} aria-expanded={o} aria-controls={id} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, padding: "24px 4px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 20, letterSpacing: "-0.01em", textAlign: "left", color: INK }}>
        {q}<motion.span animate={{ rotate: o ? 45 : 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}>+</motion.span>
      </button>
      {/* Answer stays in the server-rendered HTML (crawlers and no-JS readers see it); only its height animates. */}
      <motion.div id={id} role="region" initial={false} animate={{ height: o ? "auto" : 0, opacity: o ? 1 : 0 }} transition={{ duration: 0.4, ease: EASE }} style={{ overflow: "hidden" }} aria-hidden={!o}>
        <p style={{ margin: 0, padding: "0 4px 24px", color: MUTED, fontSize: 16.5, lineHeight: 1.65, maxWidth: 640 }}>{a}</p>
      </motion.div>
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
