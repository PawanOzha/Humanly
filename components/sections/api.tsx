"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Ico } from "@/components/icons";
import { Btn } from "@/components/ui/btn";
import { Rise } from "@/components/ui/rise";
import { LINKS } from "@/lib/links";
import { API_LIMITS } from "@/lib/plans";
import { EASE, h2, INK, LINE, MUTED } from "@/lib/tokens";

const CURL = `curl https://app.humanora.app/api/v1/humanize \\
  -H "Authorization: Bearer hum_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Paste at least fifty characters of your draft here.", "tone": "standard"}'`;

const r = API_LIMITS.ratePerMin;
const FEATURES = [
  ["Personal API keys", "Create keys in Settings. Each one is shown once and stored only as a hash."],
  ["Rotation & expiry", "Rotate with a grace period so deploys never break. Revoke or set expiry anytime."],
  ["Scopes", "Limit a key to humanize, detect, or both."],
  ["One word allowance", "API calls draw from the same words as the app. No separate billing."],
  ["Rate limits by plan", `${r.free} requests/min on Free, ${r.plus} on Plus, ${r.pro} on Pro.`],
] as const;

export function Api() {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(CURL); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {} };
  return (
    <section id="api" style={{ padding: "60px 20px 120px", maxWidth: 1080, margin: "0 auto" }}>
      <Rise style={{ textAlign: "center", marginBottom: 48 }}>
        <div className="hm-mono" style={{ fontSize: 12, color: MUTED, letterSpacing: ".08em" }}>FOR DEVELOPERS</div>
        <h2 style={{ ...h2, marginTop: 12 }}>Humanora, <span className="hm-serif">by API.</span></h2>
        <p style={{ margin: "18px auto 0", color: MUTED, fontSize: 18, maxWidth: 560, lineHeight: 1.55 }}>Humanize and check text from your own product with a simple REST API. Same engine, same quality, one key.</p>
      </Rise>
      <div className="hm-api">
        <Rise>
          <div style={{ display: "grid", gap: 4 }}>
            {FEATURES.map(([t, d]) => (
              <div key={t} style={{ display: "flex", gap: 14, padding: "14px 4px", borderBottom: `1px solid ${LINE}` }}>
                <span style={{ color: "#2f9e5b", marginTop: 2 }}>{Ico.check}</span>
                <div><div style={{ fontSize: 16, fontWeight: 500, color: INK }}>{t}</div><div style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.55, marginTop: 3 }}>{d}</div></div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
            <Btn href={LINKS.docs}>Read the docs {Ico.arrow}</Btn>
            <Btn variant="ghost" href={LINKS.apiKeys}>Get an API key</Btn>
          </div>
        </Rise>
        <Rise delay={0.1}>
          <div style={{ borderRadius: 20, background: INK, color: "#e9eae4", boxShadow: "0 40px 80px -30px rgba(0,0,0,.45)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
              <span className="hm-mono" style={{ fontSize: 12, opacity: 0.6 }}>POST /api/v1/humanize</span>
              <motion.button type="button" onClick={copy} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: EASE }} aria-label="Copy curl example"
                style={{ minWidth: 64, fontFamily: "inherit", fontSize: 12, color: "#fff", background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>{copied ? "Copied" : "Copy"}</motion.button>
            </div>
            <pre className="hm-mono" style={{ margin: 0, padding: "20px 18px", fontSize: 12.5, lineHeight: 1.7, overflowX: "auto", whiteSpace: "pre" }}><code>{CURL}</code></pre>
            <div className="hm-mono" style={{ padding: "12px 18px 18px", fontSize: 12, lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,.08)", color: "rgba(233,234,228,.65)" }}>
              → 200 {"{"} &quot;object&quot;: &quot;humanization&quot;, &quot;output&quot;: &quot;…&quot;, &quot;words_charged&quot;: 9, &quot;credits&quot;: {"{"} … {"}"} {"}"}
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}
