import { ImageResponse } from "next/og";

export const alt = "Humanora — Write with AI. Sound human.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#f7f7f4", color: "#11120f" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 30 30"><circle cx="15" cy="15" r="15" fill="#d4f26a" /><g stroke="#11120f" strokeWidth="2.6" strokeLinecap="round"><path d="M15 7.5v15" /><path d="M8.5 11.2l13 7.6" /><path d="M21.5 11.2l-13 7.6" /></g></svg>
          <div style={{ fontSize: 40, letterSpacing: "-0.02em" }}>Humanora</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, lineHeight: 1.02, letterSpacing: "-0.04em" }}>
          <div>Write with AI.</div>
          <div style={{ fontStyle: "italic" }}>Sound human.</div>
        </div>
        <div style={{ fontSize: 30, color: "#6f726b" }}>Sentence-level AI detection and natural rewrites · humanora.app</div>
      </div>
    ),
    size,
  );
}
