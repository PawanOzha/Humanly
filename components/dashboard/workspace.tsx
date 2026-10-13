"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mark } from "@/components/dashboard/marks";
import { Notice, Ring, ScorePill } from "@/components/dashboard/ui";
import { rewriteDraft, scanDraft, type JobSource } from "@/lib/draft-job";
import { SAMPLES, type Sentence } from "@/lib/engine";
import { useSession } from "@/lib/session";
import { useBillingView } from "@/lib/stores/billing";
import { saveDraft, useDocuments } from "@/lib/stores/documents";
import { countWords, MODES, type Mode } from "@/lib/tokens";
import {
  formatWords, levelOf, PLANS, rewriteLimit, runLimit, takeCompose, titleFrom, wordsLeft,
} from "@/lib/workspace";

type Phase = "idle" | "scanning" | "scanned" | "humanizing" | "done";
type View = "human" | "original";

const MAX = 12000;

function describe(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : "";
  if (!message || message === "Failed to fetch") return fallback;
  return message;
}

export function Workspace({ intent = "write" }: { intent?: "detect" | "write" }) {
  const params = useSearchParams();
  const billing = useBillingView();
  const plan = PLANS[billing.plan];
  const userId = useSession()?.id ?? "";
  const drafts = useDocuments((state) => state.drafts);

  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [original, setOriginal] = useState<Sentence[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [before, setBefore] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [view, setView] = useState<View>("human");
  const [mode, setMode] = useState<Mode>("Balanced");
  const [fault, setFault] = useState("");
  const [source, setSource] = useState<JobSource | null>(null);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(-1);

  const job = useRef(0);
  const seen = useRef("");
  const account = useRef(userId);
  const copyTimer = useRef(0);
  const flashTimer = useRef(0);
  const area = useRef<HTMLTextAreaElement>(null);

  const compose = params.get("compose");
  const draftId = params.get("draft");
  const token = compose || draftId || "";

  const words = countWords(text);
  const perRun = billing.perRun || plan.perRun;
  const left = wordsLeft(billing);
  const busy = phase === "scanning" || phase === "humanizing";
  const toneLocked = billing.plan === "free";
  const scored = phase === "scanned" || phase === "done";
  const showingOriginal = phase === "done" && view === "original";
  const lines = showingOriginal ? (original.length ? original : sentences) : sentences;
  const marks = (phase === "scanning" || phase === "scanned" || phase === "done") && lines.length > 0;
  const shownScore = showingOriginal && before != null ? before : score;
  const over = words > perRun;

  const clear = () => {
    job.current += 1;
    window.clearTimeout(copyTimer.current);
    setOutput("");
    setSentences([]);
    setOriginal([]);
    setScore(null);
    setBefore(null);
    setLabel("");
    setPhase("idle");
    setView("human");
    setFault("");
    setSource(null);
    setCopied(false);
    setFlash(-1);
  };

  // Another account must never see the last account's draft.
  useEffect(() => {
    if (account.current && userId && account.current !== userId) {
      seen.current = "";
      clear();
      setText("");
    }
    account.current = userId;
  }, [userId]);

  // Open a saved document or text handed over from the PDF page.
  useEffect(() => {
    if (!token || seen.current === token) return;
    const next = compose ? takeCompose(compose) : drafts.find((draft) => draft.id === draftId)?.text;
    if (compose) seen.current = token;
    if (!next) return;
    seen.current = token;
    // Adopting a document handed over by another page is a one-off sync from outside React.
    /* eslint-disable react-hooks/set-state-in-effect */
    clear();
    setText(next.slice(0, MAX));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [token, compose, draftId, drafts]);

  // A job that outlives the page has nowhere to report to.
  useEffect(() => {
    return () => {
      job.current += 1;
      window.clearTimeout(copyTimer.current);
      window.clearTimeout(flashTimer.current);
    };
  }, []);

  const check = async () => {
    if (!text.trim() || busy) return;
    const limit = runLimit(billing, words);
    if (limit) {
      setFault(limit);
      return;
    }
    const mine = ++job.current;
    const body = text.slice(0, MAX);
    setFault("");
    setCopied(false);
    setOutput("");
    setOriginal([]);
    setBefore(null);
    setSentences([]);
    setScore(null);
    setView("human");
    setPhase("scanning");
    try {
      const result = await scanDraft(body, mode, (partial, partialScore) => {
        if (job.current !== mine) return;
        setSentences(partial);
        setScore(partialScore);
      });
      if (job.current !== mine) return;
      setSentences(result.sentences);
      setScore(result.score);
      setBefore(result.score);
      setLabel(result.label);
      setSource(result.source);
      setPhase("scanned");
      saveDraft({ title: titleFrom(body), text: body, kind: "write", words: countWords(body), score: result.score });
    } catch (err) {
      if (job.current !== mine) return;
      setPhase("idle");
      setSentences([]);
      setScore(null);
      setFault(describe(err, "Humanora can't be reached right now. Try again in a moment."));
    }
  };

  const humanize = async () => {
    if (!text.trim() || busy) return;
    if (toneLocked && mode !== "Balanced") {
      setFault("Academic and Casual are on Pro.");
      return;
    }
    const limit = rewriteLimit(billing, words);
    if (limit) {
      setFault(limit);
      return;
    }
    const mine = ++job.current;
    const body = text.slice(0, MAX);
    setFault("");
    setCopied(false);
    setOutput("");
    setSentences([]);
    setOriginal([]);
    setScore(null);
    setBefore(null);
    setView("human");
    setPhase("humanizing");
    try {
      const result = await rewriteDraft(body, mode, (chunk) => {
        if (job.current !== mine) return;
        setOutput(chunk);
      });
      if (job.current !== mine) return;
      setOutput(result.output);
      setSentences(result.sentences);
      setOriginal(result.original);
      setScore(result.score);
      setBefore(result.before);
      setLabel(result.label);
      setSource(result.source);
      setPhase("done");
      saveDraft({ title: titleFrom(result.output), text: result.output.slice(0, MAX), kind: "write", words: countWords(result.output), score: result.score });
    } catch (err) {
      if (job.current !== mine) return;
      setPhase("idle");
      setOutput("");
      setFault(describe(err, "Humanora can't be reached right now. Try again in a moment."));
    }
  };

  const copy = async () => {
    const value = phase === "done" && view === "human" && output ? output : text;
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFault("");
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFault("This browser blocked the clipboard. Select the text and copy it by hand.");
    }
  };

  const paste = async () => {
    try {
      const value = await navigator.clipboard.readText();
      if (!value.trim()) return;
      clear();
      setText(value.slice(0, MAX));
      area.current?.focus();
    } catch {
      setFault("This browser blocked the clipboard. Paste with Ctrl or ⌘ + V instead.");
    }
  };

  const focusLine = (index: number) => {
    const el = document.getElementById(`db-s-${index}`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setFlash(index);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(-1), 1600);
  };

  const findings = useMemo(
    () =>
      lines
        .map((sentence, index) => ({ sentence, index }))
        .filter((item) => item.sentence.flagged)
        .sort((a, b) => b.sentence.score - a.sentence.score)
        .slice(0, 5),
    [lines],
  );

  const counts = useMemo(() => {
    const ai = lines.filter((s) => s.score >= 50).length;
    const mid = lines.filter((s) => s.score >= 25 && s.score < 50).length;
    return { ai, mid, human: lines.length - ai - mid };
  }, [lines]);

  const detect = intent === "detect";
  const streaming = phase === "humanizing";
  const caption = busy ? (streaming ? "Rewriting" : "Scoring") : label || "AI score";
  const ringCaption = phase === "done" && before != null && score != null && !showingOriginal ? `${before}% → ${score}%` : caption;
  const primary = detect ? check : humanize;

  return (
    <div className="db-page db-fit">
      <div className="db-work">
        <section className="db-card db-doc" aria-label="Draft">
          <div className="db-doc-bar">
            {phase === "done" ? (
              <div className="db-doc-tabs" role="group" aria-label="Version">
                {(["human", "original"] as const).map((item) => (
                  <button key={item} type="button" data-on={view === item} aria-pressed={view === item} onClick={() => setView(item)}>
                    {item === "human" ? "Humanized" : "Original"}
                  </button>
                ))}
              </div>
            ) : (
              <h1 className="db-doc-title">{marks ? "Marked up" : "Your draft"}</h1>
            )}
            <div className="db-doc-meta">
              {scored || marks ? (
                <button type="button" className="db-quiet" disabled={busy} onClick={clear}>Edit text</button>
              ) : null}
              <span className="db-count" data-over={over}>
                {formatWords(words)} <i>/ {formatWords(perRun)}</i>
              </span>
            </div>
          </div>

          <div className="db-doc-body" data-busy={busy}>
            {streaming ? (
              <p className="db-prose">{output}<span className="db-caret" aria-hidden /></p>
            ) : marks ? (
              <p className="db-prose">
                {lines.map((sentence, index) => (
                  <span
                    key={index}
                    id={`db-s-${index}`}
                    className="db-mark"
                    data-level={levelOf(sentence.score)}
                    data-flash={flash === index}
                    title={sentence.flagged && sentence.note ? sentence.note : undefined}
                  >
                    {sentence.text}
                  </span>
                ))}
              </p>
            ) : (
              <textarea
                ref={area}
                className="db-textarea"
                value={text}
                readOnly={busy}
                maxLength={MAX}
                spellCheck
                aria-label="Draft text"
                placeholder={detect ? "Paste or type a draft to check…" : "Paste an AI-written draft to humanize…"}
                onChange={(event) => {
                  setText(event.target.value.slice(0, MAX));
                  if (fault) setFault("");
                }}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    void primary();
                  }
                }}
              />
            )}
            {busy ? <span className="db-scanline" aria-hidden /> : null}
          </div>

          <div className="db-doc-foot">
            {!text && phase === "idle" ? (
              <>
                <span className="db-foot-label">Try a sample</span>
                {SAMPLES.map((sample) => (
                  <button key={sample.id} type="button" className="db-chip" onClick={() => { clear(); setText(sample.text); }}>
                    {sample.title}
                  </button>
                ))}
                <button type="button" className="db-chip db-chip-end" onClick={() => void paste()}>
                  <Mark name="copy" size={14} />
                  Paste from clipboard
                </button>
              </>
            ) : (
              <span className="db-foot-hint">
                {phase === "done" ? "Compare the versions above, then copy the result." : <><kbd>⌘</kbd> <kbd>↵</kbd> to {detect ? "check" : "humanize"}</>}
              </span>
            )}
          </div>
        </section>

        <aside className="db-inspector" aria-label="Result">
          <div className="db-card db-result">
            <Ring score={shownScore} busy={busy} caption={ringCaption} />
            <div className="db-result-copy">
              <p className="db-result-label">
                {busy ? (streaming ? "Rewriting your draft" : "Scoring each sentence") : label || "Waiting for a draft"}
              </p>
              <p className="db-result-sub">
                {phase === "done" && before != null && score != null
                  ? score < before ? `Down ${before - score} points from the original.` : "The score did not move. Try another tone."
                  : source === "device" ? "Estimated on this device." : scored ? `${counts.ai} AI · ${counts.mid} mixed · ${counts.human} human` : "Paste text and run a check."}
              </p>
            </div>

            {scored ? (
              <div className="db-split" aria-label="Sentence breakdown">
                <div><i data-level="ai" /> <span>{counts.ai}</span> AI</div>
                <div><i data-level="mid" /> <span>{counts.mid}</span> Mixed</div>
                <div><i data-level="ok" /> <span>{counts.human}</span> Human</div>
              </div>
            ) : null}
          </div>

          <div className="db-card db-controls">
            <p className="db-label">Tone</p>
            <div className="db-tones" role="radiogroup" aria-label="Tone">
              {MODES.map((item) => {
                const locked = toneLocked && item !== "Balanced";
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={mode === item}
                    data-on={mode === item}
                    disabled={locked || busy}
                    onClick={() => setMode(item)}
                    title={locked ? "Available on Pro" : undefined}
                  >
                    {locked ? <Mark name="lock" size={12} /> : null}
                    {item}
                  </button>
                );
              })}
            </div>
            {toneLocked ? <p className="db-hint">Academic and Casual are on <Link href="/dashboard/plans">Pro</Link>.</p> : null}

            <div className="db-actions">
              <button type="button" className={`db-btn ${detect ? "db-btn-ink" : "db-btn-ghost"}`} data-busy={phase === "scanning"} disabled={!text.trim() || busy} onClick={() => void check()}>
                <span>{phase === "scanning" ? "Checking…" : "Check AI score"}</span>
              </button>
              <button type="button" className={`db-btn ${detect ? "db-btn-ghost" : "db-btn-ink"}`} data-busy={phase === "humanizing"} disabled={!text.trim() || busy} onClick={() => void humanize()}>
                <span>{phase === "humanizing" ? "Humanizing…" : "Humanize"}</span>
              </button>
              <button type="button" className="db-btn db-btn-ghost" disabled={!text.trim() || busy} onClick={() => void copy()}>
                <Mark name={copied ? "check" : "copy"} size={15} />
                <span>{copied ? "Copied" : phase === "done" && view === "human" ? "Copy humanized text" : "Copy text"}</span>
              </button>
            </div>

            <Notice>{fault}</Notice>
            <p className="db-fine">
              {detect ? "Checks are free." : `Humanize uses ${formatWords(words)} ${words === 1 ? "word" : "words"}.`} {formatWords(left)} left this month.
            </p>
          </div>

          {findings.length > 0 ? (
            <div className="db-card db-findings">
              <p className="db-label">Needs attention</p>
              <ul>
                {findings.map(({ sentence, index }) => (
                  <li key={index}>
                    <button type="button" onClick={() => focusLine(index)}>
                      <ScorePill score={sentence.score} />
                      <span>
                        <q>{sentence.text.trim().slice(0, 90)}{sentence.text.trim().length > 90 ? "…" : ""}</q>
                        {sentence.note ? <small>{sentence.note}</small> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
