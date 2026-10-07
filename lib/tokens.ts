import type React from "react";

export const BRAND = "Humanly";
export const FOUNDER = "The founder";
export const BG = "#f7f7f4";
export const INK = "#11120f";
export const MUTED = "#6f726b";
export const LINE = "rgba(17,18,15,.08)";
export const RED = "#e5484d";
export const AMBER = "#e8a317";
export const GREEN = "#2f9e5b";
export const BLUE = "#2b5bf0";
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Glass for floating menus. Mirrors --hm-glass-* in globals.css. */
export const GLASS_ON = "blur(24px) saturate(180%)";
export const GLASS_OFF = "blur(0px) saturate(100%)";
export const GLASS_BG =
  "linear-gradient(180deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 55%), rgba(255,255,255,.78)";
export const GLASS_EDGE =
  "0 0 0 .5px rgba(17,18,15,.08), inset 0 .5px 0 rgba(255,255,255,.85), 0 18px 48px -18px rgba(20,30,20,.28), 0 2px 6px rgba(20,30,20,.05)";
export const NOTE_W = 180;

export type Phase = "idle" | "scanning" | "scanned" | "humanizing" | "done";
export const MODES = ["Balanced", "Academic", "Casual"] as const;
export type Mode = (typeof MODES)[number];

export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const toneOf = (v: number) => (v >= 50 ? RED : v >= 25 ? AMBER : GREEN);
export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
export const CONTR = /\b(\w+n't|\w+'(re|ve|ll|m|d)|it's|that's|let's|here's)\b/gi;

export const h2: React.CSSProperties = {
  fontWeight: 400,
  letterSpacing: "-0.03em",
  lineHeight: 1.08,
  fontSize: "clamp(34px, 4.6vw, 60px)",
  margin: 0,
};
