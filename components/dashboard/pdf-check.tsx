"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/dashboard/marks";
import { Notice, Ring, ScorePill } from "@/components/dashboard/ui";
import { scanDraft, type JobSource } from "@/lib/draft-job";
import type { Sentence } from "@/lib/engine";
import { pdfFailure, readPdf, type PdfPage } from "@/lib/read-pdf";
import { useBillingView } from "@/lib/stores/billing";
import { saveDraft } from "@/lib/stores/documents";
import { countWords } from "@/lib/tokens";
import { formatWords, levelOf, queueCompose, runLimit, titleFrom } from "@/lib/workspace";

const MAX = 12000;
const MAX_BYTES = 15 * 1024 * 1024;

function describe(err: unknown) {
  const message = err instanceof Error ? err.message : "";
  if (!message || message === "Failed to fetch") return "Humanora can't be reached right now. Try again in a moment.";
  return message;
}

export function PdfCheck() {
  const router = useRouter();
  const billing = useBillingView();
  const input = useRef<HTMLInputElement>(null);
  const job = useRef(0);
  const [over, setOver] = useState(false);
  const [name, setName] = useState("");
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [text, setText] = useState("");
  const [reading, setReading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [fault, setFault] = useState("");
  const [note, setNote] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [source, setSource] = useState<JobSource | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);

  const words = countWords(text);
  const busy = reading || checking;

  useEffect(() => {
    return () => {
      job.current += 1;
    };
  }, []);

  const reset = () => {
    job.current += 1;
    setPages([]);
    setText("");
    setName("");
    setFault("");
    setNote("");
    setScore(null);
    setLabel("");
    setSource(null);
    setSentences([]);
    setChecking(false);
  };

  const loadBuffer = async (fileName: string, data: ArrayBuffer) => {
    const mine = ++job.current;
    setReading(true);
    setFault("");
    setNote("");
    setScore(null);
    setSentences([]);
    setLabel("");
    setSource(null);
    try {
      const nextPages = await readPdf(data);
      if (job.current !== mine) return;
      const joined = nextPages.map((page) => page.text).filter(Boolean).join("\n\n");
      if (!joined.trim()) {
        setPages([]);
        setText("");
        setName(fileName);
        setFault("This PDF has no text layer, so there is nothing to score. Scanned pages need OCR first, or paste the text into Humanize.");
        return;
      }
      setName(fileName);
      setPages(nextPages);
      setText(joined.slice(0, MAX));
      if (joined.length > MAX) setNote(`Humanora reads the first ${formatWords(MAX)} characters of a document.`);
    } catch (error) {
      if (job.current !== mine) return;
      setPages([]);
      setText("");
      setName("");
      setFault(pdfFailure(error));
    } finally {
      if (job.current === mine) setReading(false);
    }
  };

  const onFile = async (file: File | null) => {
    if (!file || busy) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFault("Choose a PDF file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFault("That PDF is over 15 MB. Split it or export a smaller copy.");
      return;
    }
    await loadBuffer(file.name, await file.arrayBuffer());
  };

  const loadSample = async () => {
    if (busy) return;
    try {
      const response = await fetch("/sample-draft.pdf");
      if (!response.ok) throw new Error("missing");
      await loadBuffer("Sample draft.pdf", await response.arrayBuffer());
    } catch {
      setFault("The sample PDF didn't load.");
    }
  };

  const check = async () => {
    if (!text.trim() || busy) return;
    const limit = runLimit(billing, words);
    if (limit) {
      setFault(limit);
      return;
    }
    const mine = ++job.current;
    setChecking(true);
    setFault("");
    try {
      const result = await scanDraft(text, "Balanced");
      if (job.current !== mine) return;
      setSentences(result.sentences);
      setScore(result.score);
      setLabel(result.label);
      setSource(result.source);
      saveDraft({ title: titleFrom(name.replace(/\.pdf$/i, "") || text), text, kind: "pdf", words, score: result.score });
    } catch (err) {
      if (job.current !== mine) return;
      setFault(describe(err));
    } finally {
      if (job.current === mine) setChecking(false);
    }
  };

  const openWrite = () => {
    if (!text.trim()) return;
    router.push(`/dashboard/write?compose=${queueCompose(text)}`);
  };

  const loaded = pages.length > 0;

  return (
    <div className="db-page db-fit">
      <div className="db-work">
        <section
          className="db-card db-doc"
          data-over={over}
          aria-label="PDF"
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setOver(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setOver(false);
            void onFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <div className="db-doc-bar">
            <span className="db-doc-title">{name || "No file yet"}</span>
            <div className="db-doc-meta">
              {loaded ? <button type="button" className="db-quiet" disabled={busy} onClick={reset}>Remove</button> : null}
              <span className="db-count">{loaded ? `${pages.length} ${pages.length === 1 ? "page" : "pages"} · ${formatWords(words)} words` : "—"}</span>
            </div>
          </div>

          <div className="db-doc-body" data-busy={busy}>
            {!loaded ? (
              <button type="button" className="db-drop" disabled={busy} onClick={() => input.current?.click()}>
                <span className="db-drop-icon"><Mark name="upload" size={22} /></span>
                <strong>{reading ? "Reading your PDF…" : "Drop a PDF here, or browse"}</strong>
                <span>Humanora reads the text layer and scores it the way it scores a draft. Up to 15 MB.</span>
              </button>
            ) : sentences.length > 0 ? (
              <p className="db-prose">
                {sentences.map((sentence, index) => (
                  <span key={index} className="db-mark" data-level={levelOf(sentence.score)} title={sentence.flagged && sentence.note ? sentence.note : undefined}>
                    {sentence.text}
                  </span>
                ))}
              </p>
            ) : (
              <div className="db-pages">
                {pages.map((page) => (
                  <div key={page.number} className="db-page-row">
                    <span>{String(page.number).padStart(2, "0")}</span>
                    <p>{page.text || "No text on this page."}</p>
                  </div>
                ))}
              </div>
            )}
            {checking ? <span className="db-scanline" aria-hidden /> : null}
          </div>

          <div className="db-doc-foot">
            <input
              ref={input}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(event) => {
                void onFile(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
            {!loaded ? (
              <>
                <span className="db-foot-label">No PDF handy?</span>
                <button type="button" className="db-chip" disabled={busy} onClick={() => void loadSample()}>Try a sample</button>
              </>
            ) : (
              <span className="db-foot-hint">Your file is read in this browser. Only the extracted text is sent for scoring.</span>
            )}
          </div>
        </section>

        <aside className="db-inspector" aria-label="PDF score">
          <div className="db-card db-result">
            <Ring score={score} busy={checking} caption={checking ? "Scoring" : label || "AI score"} />
            <div className="db-result-copy">
              <p className="db-result-label">{checking ? "Scoring each sentence" : label || (loaded ? "Ready to score" : "Waiting for a PDF")}</p>
              <p className="db-result-sub">
                {source === "device" ? "Estimated on this device." : score != null ? `${sentences.filter((s) => s.flagged).length} of ${sentences.length} sentences flagged.` : "Add a PDF, then run the check."}
              </p>
            </div>
          </div>

          <div className="db-card db-controls">
            <div className="db-actions">
              <button type="button" className="db-btn db-btn-ghost" disabled={busy} onClick={() => input.current?.click()}>
                <Mark name="upload" size={15} />
                <span>{loaded ? "Choose another PDF" : "Choose PDF"}</span>
              </button>
              <button type="button" className="db-btn db-btn-ink" data-busy={checking} disabled={busy || !text.trim()} onClick={() => void check()}>
                <span>{checking ? "Checking…" : "Check AI score"}</span>
              </button>
              <button type="button" className="db-btn db-btn-ghost" disabled={busy || !text.trim()} onClick={openWrite}>
                <Mark name="humanize" size={15} />
                <span>Open in Humanize</span>
              </button>
            </div>
            <Notice>{fault}</Notice>
            <Notice tone="info">{note}</Notice>
            <p className="db-fine">Checks are free and never use your monthly words.</p>
          </div>

          {sentences.some((s) => s.flagged) ? (
            <div className="db-card db-findings">
              <p className="db-label">Needs attention</p>
              <ul>
                {sentences
                  .filter((s) => s.flagged)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((sentence, index) => (
                    <li key={index}>
                      <div>
                        <ScorePill score={sentence.score} />
                        <span>
                          <q>{sentence.text.trim().slice(0, 90)}{sentence.text.trim().length > 90 ? "…" : ""}</q>
                          {sentence.note ? <small>{sentence.note}</small> : null}
                        </span>
                      </div>
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
