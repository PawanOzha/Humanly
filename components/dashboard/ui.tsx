"use client";

import type { ReactNode } from "react";
import { levelOf, LEVEL_LABEL } from "@/lib/workspace";

export function PageIntro({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="db-intro">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="db-intro-actions">{actions}</div> : null}
    </header>
  );
}

/** A thin horizontal gauge. `value` and `max` are in the same unit. */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const tone = pct >= 90 ? "high" : pct >= 70 ? "mid" : "low";
  return (
    <div
      className="db-meter"
      data-tone={tone}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ScorePill({ score }: { score: number | null | undefined }) {
  const level = levelOf(score);
  return (
    <span className="db-pill" data-level={level} title={LEVEL_LABEL[level]}>
      {score == null ? "—" : `${Math.round(score)}%`}
    </span>
  );
}

/** Circular gauge for an AI score. Empty while there is nothing to show. */
export function Ring({ score, busy, caption }: { score: number | null; busy?: boolean; caption: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const value = score == null ? 0 : Math.max(2, Math.min(100, score));
  const level = levelOf(score);
  return (
    <div className="db-ring" data-level={level} data-busy={busy ? "true" : "false"}>
      <svg viewBox="0 0 132 132" aria-hidden focusable="false">
        <circle className="db-ring-track" cx="66" cy="66" r={radius} />
        <circle
          className="db-ring-value"
          cx="66"
          cy="66"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (busy ? 0 : value) / 100)}
        />
        {busy ? <circle className="db-ring-spin" cx="66" cy="66" r={radius} strokeDasharray={`${circumference * 0.18} ${circumference}`} /> : null}
      </svg>
      <div className="db-ring-copy">
        <strong>{score == null || busy ? "—" : Math.round(score)}</strong>
        {score != null && !busy ? <span>%</span> : null}
        <small>{caption}</small>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="db-empty">
      <div className="db-empty-art" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="db-notice" data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
