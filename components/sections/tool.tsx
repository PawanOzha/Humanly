"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Ico } from "@/components/icons";
import { Annotated } from "@/components/sections/annotated";
import { Btn } from "@/components/ui/btn";
import { Metric } from "@/components/ui/metric";
import { ScoreRing } from "@/components/ui/score-ring";
import { Segmented } from "@/components/ui/segmented";
import { Spinner } from "@/components/ui/spinner";
import { GuestNote } from "@/components/guest/notice";
import { SAMPLES, type Sentence } from "@/lib/engine";
import { LiveError, liveJob, warmLive } from "@/lib/live";
import { useSession } from "@/lib/session";
import { useAuth } from "@/lib/stores/auth";
import { useBilling } from "@/lib/stores/billing";
import { firstWords, GUEST_WORDS, useGuest } from "@/lib/stores/guest";
import { useWide } from "@/hooks/use-wide";
import {
  AMBER, clamp, countWords, EASE, GREEN, INK, LINE, MODES, MUTED, RED,
  type Mode, type Phase,
} from "@/lib/tokens";

export function Tool() {
  const reduce = !!useReducedMotion();
  const wide = useWide(960);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("Balanced");
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [before, setBefore] = useState<number | null>(null);
  const [origView, setOrigView] = useState<Sentence[]>([]);
  const [outView, setOutView] = useState<Sentence[]>([]);
  const [output, setOutput] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fault, setFault] = useState("");
  const [docLabel, setDocLabel] = useState("");
  const [beforeLabel, setBeforeLabel] = useState("");
  const typer = useRef<number | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const job = useRef(0);
  const overSeen = useRef(false);
  const session = useSession();
  const authReady = useAuth((state) => state.status === "ready");
  const guestLeft = useGuest((state) => state.left);
  const guestLoaded = useGuest((state) => state.loaded);
  const perRun = useBilling((state) => state.perRun);
  const cap = session ? perRun : GUEST_WORDS;
  useEffect(() => {
    warmLive();
    return () => { if (typer.current) clearInterval(typer.current); };
  }, []);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text, phase, showOriginal]);

  useEffect(() => {
    if (phase !== "scanning" && phase !== "humanizing") return;
    const el = draftRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [phase, output, origView.length]);

  const busy = phase === "scanning" || phase === "humanizing";
  const words = countWords(text);
  const consent = useGuest((state) => state.choice) === "accepted";

  useEffect(() => {
    if (!authReady || session) {
      if (session) useGuest.getState().close();
      overSeen.current = false;
      return;
    }
    const over = words > GUEST_WORDS;
    if (over && !overSeen.current) useGuest.getState().open("words");
    overSeen.current = over;
  }, [words, session, authReady]);

  const noteGuest = (guest?: { used: number; allowance: number; left: number; signedIn?: boolean }) => {
    if (guest && !guest.signedIn) useGuest.getState().apply(guest);
  };
  const gateFor = (err: unknown) => {
    if (!(err instanceof LiveError) || (err.code !== "guest" && err.code !== "words")) return false;
    noteGuest(err.guest);
    useGuest.getState().open(err.code === "words" ? "words" : "login");
    return true;
  };
  const allowed = () => {
    if (session) {
      if (words > perRun) {
        setFault(`Your plan takes ${perRun.toLocaleString("en-US")} words at a time. This draft is ${words.toLocaleString("en-US")}.`);
        return false;
      }
      return true;
    }
    if (!authReady) return true;
    if (words > GUEST_WORDS) {
      useGuest.getState().open("words");
      return false;
    }
    if (guestLoaded && guestLeft < 1) {
      useGuest.getState().open("login");
      return false;
    }
    return true;
  };
  const annotated = phase === "scanned" || phase === "done" || (phase === "scanning" && origView.length > 0);
  const streaming = phase === "humanizing";
  const markup = !streaming && (phase === "scanned" || phase === "done" || (phase === "scanning" && origView.length > 0));
  const view = phase === "done" && !showOriginal ? outView : origView;

  const typeIn = (full: string) => {
    if (typer.current) clearInterval(typer.current);
    job.current += 1; setFault(""); setPhase("idle"); setOutput(""); setBefore(null); setScore(0); setDocLabel(""); setBeforeLabel(""); setOrigView([]); setOutView([]);
    if (reduce) { setText(full); return; }
    let i = 0; setText("");
    typer.current = window.setInterval(() => {
      i = Math.min(full.length, i + 7); setText(full.slice(0, i));
      if (i >= full.length && typer.current) { clearInterval(typer.current); typer.current = null; }
    }, 14);
  };
  const pasteClip = async () => { try { typeIn(await navigator.clipboard.readText()); } catch { /* denied */ } };

  const scan = async () => {
    if (!text.trim() || busy || !allowed()) return;
    const mine = ++job.current;
    setFault(""); setOutput(""); setShowOriginal(false); setOrigView([]); setScore(0); setDocLabel(""); setPhase("scanning");
    try {
      await liveJob("scan", text, mode, (ev) => {
        if (job.current !== mine) return;
        noteGuest(ev.guest);
        if (ev.op === "progress" && ev.sentence) {
          setOrigView((prev) => [...prev, ev.sentence as Sentence]);
          if (typeof ev.score === "number") { setScore(ev.score); setBefore(ev.score); }
        }
        if (ev.op === "result") {
          setOrigView(ev.sentences ?? []);
          setScore(ev.score ?? 0);
          setBefore(ev.score ?? 0);
          setDocLabel(ev.label ?? "");
          setBeforeLabel(ev.label ?? "");
          setPhase("scanned");
        }
      }, consent);
    } catch (err) {
      if (job.current !== mine) return;
      setPhase("idle"); setOrigView([]); setScore(0); setBefore(null); setDocLabel(""); setBeforeLabel("");
      if (!gateFor(err)) setFault(err instanceof Error ? err.message : "Humanly is offline");
    }
  };
  const humanize = async () => {
    if (!text.trim() || busy || !allowed()) return;
    const mine = ++job.current;
    setFault(""); setOutput(""); setOutView([]); setShowOriginal(false); setPhase("humanizing");
    try {
      await liveJob("humanize", text, mode, (ev) => {
        if (job.current !== mine) return;
        noteGuest(ev.guest);
        if (ev.op === "chunk") setOutput(ev.output ?? "");
        if (ev.op === "result") {
          setOutput(ev.output ?? "");
          setOutView(ev.sentences ?? []);
          setOrigView(ev.original ?? []);
          setScore(ev.score ?? 0);
          setBefore(ev.before ?? null);
          setDocLabel(ev.label ?? "");
          setBeforeLabel(ev.beforeLabel ?? "");
          setPhase("done");
        }
      }, consent);
    } catch (err) {
      if (job.current !== mine) return;
      setPhase(origView.length ? "scanned" : "idle");
      if (!gateFor(err)) setFault(err instanceof Error ? err.message : "Humanly is offline");
    }
  };
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const reset = () => { job.current += 1; setFault(""); setText(""); setOutput(""); setOrigView([]); setOutView([]); setBefore(null); setScore(0); setDocLabel(""); setBeforeLabel(""); setPhase("idle"); setShowOriginal(false); };

  const m = useMemo(() => {
    if (!annotated) return null;
    const n = view.length;
    const ai = view.filter((s) => s.label === "AI-generated").length;
    const human = view.filter((s) => s.label === "Human-written").length;
    const mixed = view.filter((s) => s.label === "Inconclusive").length;
    return { n, ai, human, mixed };
  }, [annotated, view]);

  const viewingOriginal = phase === "done" && showOriginal;
  const ringScore = viewingOriginal && before !== null ? before : score;
  const ringLabel = viewingOriginal ? beforeLabel : docLabel;
  const verdict = phase === "idle" ? "Waiting for text"
    : phase === "scanning" ? "Analyzing patterns"
    : phase === "humanizing" ? "Rewriting for natural rhythm"
    : ringLabel === "AI-generated" ? "AI-generated"
    : ringLabel === "Human-written" ? "Human-written"
    : ringLabel === "Inconclusive" ? "Inconclusive"
    : "Scored";
  const sub = phase === "idle" ? "Paste a draft or start from a sample."
    : phase === "scanning" ? "Scoring each sentence."
    : phase === "humanizing" ? "Rewriting, then scoring it again."
    : m ? `${m.ai} AI · ${m.human} human · ${m.mixed} inconclusive` : "";
  const status = fault && phase === "idle"
    ? { t: fault, c: RED }
    : { idle: { t: text.trim() ? "Ready" : "Waiting for text", c: "#b7bab0" }, scanning: { t: "Scanning…", c: AMBER }, scanned: { t: "Scan complete", c: GREEN },
      humanizing: { t: "Rewriting…", c: AMBER }, done: { t: "Verified", c: GREEN } }[phase];
  const areaKey = streaming ? "stream" : markup ? `${phase}-${showOriginal ? "o" : "h"}` : "ta";

  return (
    <section id="tool" style={{ position: "relative", padding: "0 20px 40px" }}>
      <div style={{ position: "absolute", left: "50%", top: "12%", width: "62%", height: "70%", transform: "translateX(-50%)", background: "radial-gradient(closest-side, rgba(212,242,106,.38), transparent)", filter: "blur(50px)", pointerEvents: "none" }} />
      <motion.div className="hm-win" initial={{ opacity: 0, y: 80, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE }}
        style={{ position: "relative", maxWidth: 1080, margin: "0 auto" }}>
        {/* top bar */}
        <div className="hm-top">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", gap: 6 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#e6e6e2" }} />)}</div>
            <span style={{ fontSize: 15, fontWeight: 500 }}>Humanizer</span>
            <span className="hm-mono hm-hide-s" style={{ fontSize: 11.5, color: MUTED }}>Untitled draft</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="hm-mono hm-hide-s" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: MUTED }}>
              <motion.span animate={{ backgroundColor: status.c, opacity: busy ? [1, 0.3, 1] : 1 }} transition={{ duration: 1, repeat: busy ? Infinity : 0 }} style={{ width: 7, height: 7, borderRadius: "50%" }} />{status.t}
            </div>
            <Segmented items={MODES} value={mode} onChange={setMode} id="hm-mode" />
          </div>
        </div>

        <div className="hm-grid">
          {/* editor */}
          <div className="hm-edit">
            <div className="hm-edit-meta">
              <span className="hm-mono" style={{ fontSize: 11.5, color: MUTED, letterSpacing: ".05em" }}>{phase === "done" ? (showOriginal ? "ORIGINAL — MARKED UP" : "HUMANIZED") : annotated ? "YOUR TEXT — MARKED UP" : "YOUR TEXT"}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 64, height: 3, borderRadius: 3, background: "#eeeeea", overflow: "hidden" }}>
                  <motion.div animate={{ width: `${clamp((words / cap) * 100, 0, 100)}%` }} transition={{ duration: 0.4, ease: EASE }} style={{ height: "100%", background: !session && words > cap ? RED : INK }} />
                </div>
                <span className="hm-mono" style={{ fontSize: 11.5, color: !session && words > cap ? RED : "#9a9d95" }}>{words} / {cap.toLocaleString()}{!session && guestLoaded ? ` · ${guestLeft} free` : ""}</span>
              </div>
            </div>

            <div className="hm-draft-wrap">
              <div className="hm-draft" ref={draftRef} data-lenis-prevent>
                {streaming ? (
                  <p className="hm-body">{output}<span className="hm-caret" /></p>
                ) : (
                  <AnimatePresence mode="wait" initial={false}>
                    {areaKey === "ta" ? (
                      <motion.div key="ta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className={wide ? "hm-annot" : undefined}>
                        <textarea ref={areaRef} className="hm-text hm-body" value={text} disabled={busy} onChange={(e) => setText(e.target.value.slice(0, 12000))}
                          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") humanize(); }}
                          placeholder="Paste your AI-generated text here…" rows={4} />
                        {wide && <div className="hm-hand" style={{ fontSize: 20, color: "#b9bcb3", transform: "rotate(-2deg)", paddingTop: 4 }}>scan it and I’ll mark the robotic bits here ✎</div>}
                      </motion.div>
                    ) : (
                      <motion.div key={areaKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                        <Annotated sentences={view} wide={wide} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
              <AnimatePresence initial={false}>
                {phase === "idle" && !text && (
                  <motion.div key="samples" className="hm-samples-block" initial={wide ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={wide ? { opacity: 1 } : { opacity: 1, height: "auto" }} exit={wide ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={{ duration: 0.28, ease: EASE }} style={wide ? undefined : { overflow: "hidden" }}>
                    <div className="hm-samples-head">
                      <span className="hm-mono" style={{ fontSize: 11, letterSpacing: ".06em", color: MUTED }}>OR START WITH A SAMPLE</span>
                      <button onClick={pasteClip} className="hm-mono hm-paste" style={{ fontSize: 11.5, color: INK }}>{Ico.paste} Paste from clipboard</button>
                    </div>
                    <div className="hm-samples">
                      {SAMPLES.map((s, i) => (
                        <motion.button key={s.id} onClick={() => typeIn(s.text)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}
                          transition={{ opacity: { delay: 0.06 + i * 0.04, duration: 0.35, ease: EASE }, y: { duration: 0.2, ease: EASE }, scale: { duration: 0.12, ease: EASE } }}
                          className="hm-sample">
                          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 500 }}>
                            <span style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 8, background: "#fff", boxShadow: "0 0 0 1px rgba(17,18,15,.07)" }}>{Ico[s.icon as "pen" | "mail" | "doc"]}</span>{s.title}
                          </span>
                          <span className="hm-clamp">{s.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {busy && (
                <motion.div className="hm-scan" animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{ background: `linear-gradient(90deg, transparent, ${INK}, transparent)`, boxShadow: "0 0 26px 6px rgba(0,0,0,.1)" }} />
              )}
            </div>

            <GuestNote onTrim={() => setText((current) => firstWords(current, GUEST_WORDS))} />
            <AnimatePresence initial={false}>
              {fault && (
                <motion.p key="fault" role="alert" className="hm-fault" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: EASE }}>
                  {fault}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="hm-edit-bar">
              <div className="hm-mono hm-edit-hint" style={{ fontSize: 11.5, color: MUTED }}>
                {phase === "done" ? (
                  <Segmented items={["Humanized", "Original"] as const} value={showOriginal ? "Original" : "Humanized"} onChange={(v) => setShowOriginal(v === "Original")} id="hm-view" />
                ) : annotated ? (
                  <span style={{ display: "flex", gap: 16 }}>
                    <span><span style={{ color: RED }}>●</span> AI</span><span><span style={{ color: AMBER }}>●</span> Inconclusive</span><span><span style={{ color: GREEN }}>●</span> Human</span>
                  </span>
                ) : (<span><kbd className="hm-kbd">⌘</kbd> <kbd className="hm-kbd">↵</kbd> to humanize</span>)}
              </div>
              {phase !== "done" && (
                <div className="hm-edit-actions">
                  {(text || phase === "scanned") && <Btn variant="ghost" disabled={busy} onClick={phase === "scanned" ? () => setPhase("idle") : reset}>{phase === "scanned" ? "Edit" : "Clear"}</Btn>}
                  {phase !== "scanned" && <Btn variant="ghost" disabled={!text.trim() || busy} onClick={scan}>{phase === "scanning" ? <><Spinner size={13} /> Checking…</> : "Check AI score"}</Btn>}
                  <Btn disabled={!text.trim() || busy} onClick={humanize}>{phase === "humanizing" ? <><Spinner color="#fff" size={13} /> Humanizing…</> : "Humanize"}</Btn>
                </div>
              )}
            </div>
          </div>

          {/* insights */}
          <aside className="hm-side">
            <ScoreRing score={ringScore} phase={phase} />
            <div style={{ textAlign: "center", minHeight: 44 }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={verdict} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 500 }}>{verdict}</div>
                  <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>{sub}</div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div style={{ minHeight: 28 }}>
              <AnimatePresence>
                {phase === "done" && before !== null && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.5 }}
                    className="hm-mono" style={{ fontSize: 12, color: score < before ? GREEN : AMBER, background: score < before ? "rgba(47,158,91,.1)" : "rgba(232,163,23,.12)", padding: "6px 13px", borderRadius: 999 }}>{before}% → {score}% AI</motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, padding: "20px 0", borderTop: `1px solid ${LINE}` }}>
              <Metric label="AI-generated" value={m ? `${m.ai}/${m.n}` : "—"} pct={m && m.n ? (m.ai / m.n) * 100 : 0} color={RED} />
              <Metric label="Inconclusive" value={m ? `${m.mixed}/${m.n}` : "—"} pct={m && m.n ? (m.mixed / m.n) * 100 : 0} color={AMBER} />
              <Metric label="Human-written" value={m ? `${m.human}/${m.n}` : "—"} pct={m && m.n ? (m.human / m.n) * 100 : 0} color={GREEN} />
            </div>
            <div style={{ width: "100%", marginTop: "auto", minHeight: 96 }}>
              <AnimatePresence>
                {phase === "done" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.3 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Btn full onClick={copy}>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={copied ? "c" : "n"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          {copied ? <>{Ico.check} Copied</> : "Copy humanized text"}
                        </motion.span>
                      </AnimatePresence>
                    </Btn>
                    <Btn full variant="ghost" onClick={reset}>Start over</Btn>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>
        </div>
      </motion.div>
    </section>
  );
}
