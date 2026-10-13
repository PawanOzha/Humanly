"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Ico } from "@/components/icons";
import { Btn } from "@/components/ui/btn";
import { Rise } from "@/components/ui/rise";
import { Segmented } from "@/components/ui/segmented";
import { LINKS } from "@/lib/links";
import { fmt, TIERS, TRIAL_WORDS } from "@/lib/plans";
import { EASE, GREEN, h2, INK, LINE, MUTED } from "@/lib/tokens";

const INTERVALS = ["Monthly", "Yearly"] as const;
type Billing = (typeof INTERVALS)[number];

/** Yearly saving vs. twelve monthly payments, from the real prices (same for every paid plan today). */
const saving = (() => {
  const paid = TIERS.find((t) => t.usd);
  return paid?.usd ? Math.round((1 - paid.usd.year / (paid.usd.month * 12)) * 100) : 0;
})();

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("Monthly");
  const yearly = billing === "Yearly";
  return (
    <section id="pricing" style={{ padding: "40px 20px 120px", maxWidth: 1080, margin: "0 auto" }}>
      <Rise style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={h2}>Simple pricing.</h2>
        <p style={{ margin: "16px auto 0", color: MUTED, fontSize: 18, maxWidth: 520 }}>Start free every day. Try any paid plan free for 7 days.</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 28 }}>
          <div role="group" aria-label="Billing period" data-testid="billing-toggle"><Segmented items={INTERVALS} value={billing} onChange={setBilling} id="hm-billing" /></div>
          <span className="hm-mono" style={{ fontSize: 12, color: GREEN, opacity: yearly ? 1 : 0.55, transition: "opacity .25s" }}>Save {saving}% yearly</span>
        </div>
      </Rise>
      <div className="hm-price">{TIERS.map((t, i) => {
        const dark = t.highlight;
        const price = t.usd ? (yearly ? t.usd.year : t.usd.month) : 0;
        return (
          <Rise key={t.id} delay={i * 0.1}>
            <motion.div data-testid={`plan-${t.id}`} whileHover={{ y: -6 }} transition={{ type: "tween", duration: 0.28, ease: EASE }}
              style={{ position: "relative", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", padding: 28, borderRadius: 24, background: dark ? INK : "#fff", color: dark ? "#fff" : INK, border: `1px solid ${dark ? INK : LINE}`, boxShadow: dark ? "0 40px 80px -30px rgba(0,0,0,.5)" : "0 20px 50px -30px rgba(0,0,0,.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 24 }}>
                <div style={{ fontSize: 15, opacity: 0.7 }}>{t.name}</div>
                {t.badge && <span className="hm-mono" style={{ fontSize: 11, fontWeight: 500, padding: "4px 9px", borderRadius: 999, background: "#d4f26a", color: INK }}>{t.badge}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "10px 0 2px" }}>
                <span data-testid={`price-${t.id}`} style={{ fontSize: 52, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>${fmt(price)}</span>
                <span style={{ fontSize: 15, opacity: 0.6 }}>{t.usd ? (yearly ? "/ year" : "/ month") : "forever"}</span>
              </div>
              <div className="hm-mono" style={{ fontSize: 12, opacity: 0.6, minHeight: 18 }}>
                {t.usd ? (yearly ? `$${fmt(Math.round(t.usd.year / 12))}/mo billed yearly` : "billed monthly") : t.tagline}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, margin: "18px 0 0" }}>{fmt(t.words)} words <span style={{ opacity: 0.6, fontWeight: 400 }}>/ {t.period}</span></div>
              <div style={{ minHeight: 30, marginTop: 8 }}>
                {t.trialDays ? <span className="hm-mono" style={{ display: "inline-block", fontSize: 11.5, padding: "4px 9px", borderRadius: 999, background: dark ? "rgba(255,255,255,.1)" : "#f1f1ee" }}>{t.trialDays}-day free trial · {fmt(TRIAL_WORDS)} words</span> : null}
              </div>
              <div style={{ display: "grid", gap: 12, margin: "18px 0 28px", flex: 1, alignContent: "start" }}>{t.features.map((x) => <div key={x} style={{ display: "flex", gap: 10, fontSize: 14.5 }}><span style={{ color: dark ? "#d4f26a" : GREEN }}>{Ico.check}</span>{x}</div>)}</div>
              <Btn full variant={dark ? "light" : "ghost"} href={LINKS.pricingSignup}>{t.usd ? `Start ${t.trialDays}-day trial` : "Start free"}</Btn>
            </motion.div>
          </Rise>
        );
      })}</div>
      <p style={{ textAlign: "center", color: MUTED, fontSize: 13.5, marginTop: 28 }}>Prices in USD for reference. Your local price and any taxes are shown at checkout. Cancel anytime.</p>
    </section>
  );
}
