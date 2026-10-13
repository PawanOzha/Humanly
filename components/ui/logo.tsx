"use client";

import Link from "next/link";
import { scrollToY } from "@/lib/smooth-scroll";
import { BRAND, INK } from "@/lib/tokens";

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link href="/" aria-label={`${BRAND} home`}
      onClick={(e) => { if (location.pathname === "/") { e.preventDefault(); scrollToY(0); } }}
      style={{ display: "flex", alignItems: "center", gap: 10, color: light ? "#fff" : INK, textDecoration: "none" }}>
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="#d4f26a" /><g stroke={INK} strokeWidth="2.6" strokeLinecap="round"><path d="M15 7.5v15" /><path d="M8.5 11.2l13 7.6" /><path d="M21.5 11.2l-13 7.6" /></g></svg>
      <span style={{ fontSize: 21, fontWeight: 500, letterSpacing: "-0.02em" }}>{BRAND}</span>
    </Link>
  );
}
