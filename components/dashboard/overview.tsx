"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Mark, type MarkName } from "@/components/dashboard/marks";
import { EmptyState, Meter, PageIntro, ScorePill } from "@/components/dashboard/ui";
import { useSession } from "@/lib/session";
import { useBillingView } from "@/lib/stores/billing";
import { useDocuments } from "@/lib/stores/documents";
import {
  formatWords, levelOf, LEVEL_LABEL, PLANS, relativeTime, resetLabel, wordsLeft,
} from "@/lib/workspace";

const TOOLS: { href: string; title: string; copy: string; icon: MarkName; lead?: boolean }[] = [
  { href: "/dashboard/write", title: "Humanize a draft", copy: "Rewrite AI-sounding text in a natural voice and see the score drop.", icon: "humanize", lead: true },
  { href: "/dashboard/detect", title: "Check for AI", copy: "Mark the sentences that read as machine-written. Checks never spend words.", icon: "detect" },
  { href: "/dashboard/pdf", title: "Score a PDF", copy: "Drop a PDF and read the AI score of its text, page by page.", icon: "pdf" },
];

function greeting(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Overview() {
  const session = useSession();
  const billing = useBillingView();
  const drafts = useDocuments((state) => state.drafts);
  const plan = PLANS[billing.plan];
  const left = wordsLeft(billing);
  const allowance = billing.allowance || plan.monthly;

  const stats = useMemo(() => {
    const scored = drafts.filter((draft) => draft.score != null);
    const average = scored.length ? Math.round(scored.reduce((sum, draft) => sum + (draft.score ?? 0), 0) / scored.length) : null;
    return { average, latest: drafts[0] ?? null };
  }, [drafts]);

  const first = session?.name.trim().split(/\s+/)[0] ?? "";
  const hello = `${greeting(new Date().getHours())}${first ? `, ${first}` : ""}`;
  const level = levelOf(stats.average);

  return (
    <div className="db-page">
      <PageIntro title={hello} />

      <section className="db-stats" aria-label="This month">
        <article className="db-card db-stat" style={{ ["--i" as string]: 0 }}>
          <p className="db-label">Words left</p>
          <p className="db-stat-num">{formatWords(left)}</p>
          <Meter value={billing.used} max={allowance} label="Words used this month" />
          <p className="db-stat-foot">{formatWords(billing.used)} of {formatWords(allowance)} used · resets {resetLabel(billing.period)}</p>
        </article>

        <article className="db-card db-stat" style={{ ["--i" as string]: 1 }}>
          <p className="db-label">Documents</p>
          <p className="db-stat-num">{drafts.length}</p>
          <p className="db-stat-foot">
            {stats.latest ? `Last saved ${relativeTime(stats.latest.at).toLowerCase()}` : "Nothing saved yet"}
          </p>
        </article>

        <article className="db-card db-stat" style={{ ["--i" as string]: 2 }}>
          <p className="db-label">Average AI score</p>
          <p className="db-stat-num" data-level={level}>{stats.average == null ? "—" : `${stats.average}%`}</p>
          <p className="db-stat-foot">{stats.average == null ? "Scores appear after your first check" : LEVEL_LABEL[level]}</p>
        </article>

        <article className="db-card db-stat db-stat-plan" style={{ ["--i" as string]: 3 }}>
          <p className="db-label">Plan</p>
          <p className="db-stat-num">{plan.name}</p>
          <p className="db-stat-foot">{formatWords(billing.perRun || plan.perRun)} words per run</p>
          <Link href="/dashboard/plans" className="db-link">
            {billing.plan === "free" ? "See upgrades" : "Manage plan"}
            <Mark name="arrow" size={14} />
          </Link>
        </article>
      </section>

      <section aria-label="Tools">
        <h2 className="db-h2">Start something</h2>
        <div className="db-tools">
          {TOOLS.map((tool, index) => (
            <Link key={tool.href} href={tool.href} className="db-tool" data-lead={tool.lead ? "true" : "false"} style={{ ["--i" as string]: index }}>
              <span className="db-tool-icon"><Mark name={tool.icon} size={20} /></span>
              <span className="db-tool-title">{tool.title}</span>
              <span className="db-tool-copy">{tool.copy}</span>
              <span className="db-tool-go" aria-hidden><Mark name="arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Recent documents">
        <div className="db-row-head">
          <h2 className="db-h2">Recent documents</h2>
          {drafts.length > 0 ? (
            <Link href="/dashboard/documents" className="db-link">
              View all
              <Mark name="arrow" size={14} />
            </Link>
          ) : null}
        </div>
        <div className="db-card db-table">
          {drafts.length === 0 ? (
            <EmptyState
              title="No documents yet"
              body="Every check and rewrite is saved here with its score, so you can pick up where you left off."
              action={
                <Link href="/dashboard/write" className="db-btn db-btn-ink">
                  <span>Start a draft</span>
                </Link>
              }
            />
          ) : (
            <ul className="db-list">
              {drafts.slice(0, 6).map((draft) => (
                <li key={draft.id}>
                  <Link href={`/dashboard/write?draft=${draft.id}`} className="db-doc-row">
                    <span className="db-doc-icon"><Mark name={draft.kind === "pdf" ? "pdf" : "documents"} size={17} /></span>
                    <span className="db-doc-name">
                      <strong>{draft.title}</strong>
                      <small>{draft.kind === "pdf" ? "PDF" : "Draft"} · {formatWords(draft.words)} words</small>
                    </span>
                    <ScorePill score={draft.score} />
                    <span className="db-doc-when">{relativeTime(draft.at)}</span>
                    <span className="db-doc-go" aria-hidden><Mark name="chevron" size={16} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
