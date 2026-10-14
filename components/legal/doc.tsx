import type { Metadata } from "next";
import type { ReactNode } from "react";
import { COMPANY } from "@/lib/company";

const SITE = "https://humanora.app";

/** Page metadata for a trust/legal page: own title, description, canonical and Open Graph URL. */
export function docMeta(path: string, title: string, description: string): Metadata {
  const full = `${title} – Humanora`;
  return {
    title: full,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: `${SITE}${path}`, siteName: "Humanora", title: full, description, locale: "en_US", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Humanora — Write with AI. Sound human." }] },
    twitter: { card: "summary_large_image", title: full, description, images: ["/twitter-image"] },
  };
}

export function Doc({ kicker, title, intro, children, updated = true }: { kicker: string; title: string; intro?: ReactNode; children: ReactNode; updated?: boolean }) {
  return (
    <article className="hm-doc">
      <p className="hm-mono hm-doc-kicker">{kicker}</p>
      <h1 className="hm-doc-title">{title}</h1>
      {updated && <p className="hm-doc-updated">Last updated: {COMPANY.updated}</p>}
      {intro && <div className="hm-doc-intro">{intro}</div>}
      <div className="hm-doc-body">{children}</div>
    </article>
  );
}

/** Renders a placeholder value; "[TODO: ...]" strings are highlighted so they are impossible to miss. */
export function T({ v }: { v: string }) {
  return v.startsWith("[TODO") ? <mark className="hm-todo">{v}</mark> : <>{v}</>;
}

export function Mail({ v }: { v: string }) {
  return v.startsWith("[TODO") ? <T v={v} /> : <a href={`mailto:${v}`}>{v}</a>;
}
