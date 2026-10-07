"use client";

import { detect, humanizeText, type Sentence } from "@/lib/engine";
import { LiveError, liveJob } from "@/lib/live";
import { useAuth } from "@/lib/stores/auth";
import { useBilling } from "@/lib/stores/billing";
import { countWords, type Mode } from "@/lib/tokens";

export type JobSource = "live" | "device";

export type ScanResult = {
  sentences: Sentence[];
  score: number;
  label: string;
  source: JobSource;
};

export type RewriteResult = ScanResult & {
  output: string;
  original: Sentence[];
  before: number;
  beforeLabel: string;
};

function labelFor(score: number) {
  if (score >= 50) return "AI-generated";
  if (score >= 25) return "Inconclusive";
  return "Human-written";
}

export async function scanDraft(
  text: string,
  mode: Mode,
  onPartial?: (sentences: Sentence[], score: number) => void,
): Promise<ScanResult> {
  try {
    let sentences: Sentence[] = [];
    let score = 0;
    let label = "";
    await liveJob("scan", text, mode, (event) => {
      if (event.op === "progress" && event.sentence) {
        sentences = [...sentences, event.sentence];
        if (typeof event.score === "number") score = event.score;
        onPartial?.(sentences, score);
      }
      if (event.op === "result") {
        sentences = event.sentences ?? sentences;
        score = event.score ?? score;
        label = event.label ?? "";
      }
    });
    return { sentences, score, label: label || labelFor(score), source: "live" };
  } catch (err) {
    // With accounts on, a score must come from the real engine. A stand-in
    // number would look like a result and is not one.
    if (useAuth.getState().configured) throw err;
    const local = detect(text);
    onPartial?.(local.sentences, local.score);
    return { ...local, label: labelFor(local.score), source: "device" };
  }
}

export async function rewriteDraft(
  text: string,
  mode: Mode,
  onChunk?: (output: string) => void,
): Promise<RewriteResult> {
  try {
    let output = "";
    let sentences: Sentence[] = [];
    let original: Sentence[] = [];
    let score = 0;
    let before = 0;
    let label = "";
    let beforeLabel = "";
    await liveJob("humanize", text, mode, (event) => {
      if (event.op === "chunk") {
        output = event.output ?? output;
        onChunk?.(output);
      }
      if (event.op === "result") {
        output = event.output ?? output;
        sentences = event.sentences ?? [];
        original = event.original ?? [];
        score = event.score ?? 0;
        before = event.before ?? before;
        label = event.label ?? "";
        beforeLabel = event.beforeLabel ?? "";
      }
    });
    return {
      output,
      sentences,
      original,
      score,
      before,
      label: label || labelFor(score),
      beforeLabel: beforeLabel || labelFor(before),
      source: "live",
    };
  } catch (err) {
    if (useAuth.getState().configured) throw err;
    if (err instanceof LiveError && (err.code === "quota" || err.code === "run" || err.code === "tone" || err.code === "auth")) throw err;
    const output = await humanizeText(text, mode);
    useBilling.getState().spendLocal(countWords(text));
    onChunk?.(output);
    const after = detect(output);
    const prior = detect(text);
    return {
      output,
      sentences: after.sentences,
      original: prior.sentences,
      score: after.score,
      before: prior.score,
      label: labelFor(after.score),
      beforeLabel: labelFor(prior.score),
      source: "device",
    };
  }
}
