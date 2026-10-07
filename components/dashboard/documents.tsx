"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Mark } from "@/components/dashboard/marks";
import { EmptyState, Notice, PageIntro, ScorePill } from "@/components/dashboard/ui";
import { useDocuments } from "@/lib/stores/documents";
import { formatWords, relativeTime } from "@/lib/workspace";

export function Documents() {
  const drafts = useDocuments((state) => state.drafts);
  const [query, setQuery] = useState("");
  const [asking, setAsking] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [fault, setFault] = useState("");
  const busy = useRef(false);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return drafts;
    return drafts.filter((draft) => draft.title.toLowerCase().includes(needle) || draft.text.toLowerCase().includes(needle));
  }, [drafts, query]);

  const remove = (id: string) => {
    if (busy.current) return;
    busy.current = true;
    setFault("");
    setRemoving(id);
    useDocuments
      .getState()
      .remove(id)
      .catch((err: unknown) => setFault(err instanceof Error ? err.message : "Couldn't delete that document."))
      .finally(() => {
        busy.current = false;
        setRemoving(null);
        setAsking(null);
      });
  };

  return (
    <div className="db-page">
      <PageIntro title="Documents" />

      <section className="db-card db-table" aria-label="Documents">
        <div className="db-table-bar">
          <label className="db-search">
            <Mark name="search" size={16} />
            <input
              type="search"
              value={query}
              placeholder="Search documents"
              aria-label="Search documents"
              maxLength={80}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="db-table-count">{drafts.length} of 12 saved</span>
        </div>

        {drafts.length === 0 ? (
          <EmptyState
            title="No documents yet"
            body="Every check and rewrite is saved here with its score, so you can pick up where you left off."
            action={<Link href="/dashboard/write" className="db-btn db-btn-ink"><span>Start a draft</span></Link>}
          />
        ) : shown.length === 0 ? (
          <EmptyState title="Nothing matches" body={`No document contains "${query.trim()}".`} />
        ) : (
          <>
            <div className="db-list-head" aria-hidden>
              <span>Name</span>
              <span>Score</span>
              <span>Updated</span>
              <span />
            </div>
            <ul className="db-list">
              {shown.map((draft) => (
                <li key={draft.id} className="db-doc-line">
                  <Link href={`/dashboard/write?draft=${draft.id}`} className="db-doc-row" data-lite="true">
                    <span className="db-doc-icon"><Mark name={draft.kind === "pdf" ? "pdf" : "documents"} size={17} /></span>
                    <span className="db-doc-name">
                      <strong>{draft.title}</strong>
                      <small>{draft.kind === "pdf" ? "PDF" : "Draft"} · {formatWords(draft.words)} words</small>
                    </span>
                    <ScorePill score={draft.score} />
                    <span className="db-doc-when">{relativeTime(draft.at)}</span>
                  </Link>
                  <div className="db-doc-actions">
                    {asking === draft.id ? (
                      <>
                        <button type="button" className="db-mini db-mini-danger" disabled={removing !== null} onClick={() => remove(draft.id)}>
                          {removing === draft.id ? "Deleting…" : "Delete"}
                        </button>
                        <button type="button" className="db-mini" disabled={removing !== null} onClick={() => setAsking(null)}>Keep</button>
                      </>
                    ) : (
                      <button type="button" className="db-icon-btn" aria-label={`Delete ${draft.title}`} onClick={() => setAsking(draft.id)}>
                        <Mark name="trash" size={16} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <Notice>{fault}</Notice>
    </div>
  );
}
