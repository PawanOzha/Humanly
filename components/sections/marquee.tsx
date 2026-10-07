import { MUTED } from "@/lib/tokens";

export function Marquee() {
  const items = ["Essays", "Cover letters", "Blog posts", "Emails", "Reports", "Newsletters", "Product copy", "LinkedIn posts", "Thesis chapters"];
  return (
    <section style={{ padding: "56px 0 24px", textAlign: "center" }}>
      <div className="hm-mono" style={{ fontSize: 12, color: MUTED, marginBottom: 26 }}>Works on everything you write</div>
      <div style={{ overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)" }}>
        <div className="hm-marq">
          {[...items, ...items].map((t, i) => <span key={i} style={{ fontSize: 26, letterSpacing: "-0.02em", color: "#b4b7ae", whiteSpace: "nowrap" }}>{t}</span>)}
        </div>
      </div>
    </section>
  );
}
