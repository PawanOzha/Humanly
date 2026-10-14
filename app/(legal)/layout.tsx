import Link from "next/link";
import { LINKS } from "@/lib/links";
import { COMPANY, LEGAL_PAGES } from "@/lib/company";

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="#d4f26a" /><g stroke="#11120f" strokeWidth="2.6" strokeLinecap="round"><path d="M15 7.5v15" /><path d="M8.5 11.2l13 7.6" /><path d="M21.5 11.2l-13 7.6" /></g></svg>
  );
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hm-legal">
      <header className="hm-legal-top">
        <Link href="/" className="hm-legal-brand" aria-label="Humanora home"><Mark /><span>Humanora</span></Link>
        <nav className="hm-legal-nav">
          <Link href="/#pricing">Pricing</Link>
          <a href={LINKS.login}>Log in</a>
          <a href={LINKS.signup} className="hm-legal-cta">Get started</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="hm-legal-foot">
        <nav aria-label="Company and legal">
          {LEGAL_PAGES.map(([l, h]) => <Link key={h} href={h}>{l}</Link>)}
        </nav>
        <p>© {new Date().getFullYear()} {COMPANY.brand}. All rights reserved.</p>
      </footer>
    </div>
  );
}
