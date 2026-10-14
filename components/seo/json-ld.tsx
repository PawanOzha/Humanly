import { TIERS } from "@/lib/plans";
import { FAQS } from "@/lib/faqs";

const SITE = "https://humanora.app";

/** Structured data built only from facts in this repo (plans come from the synced app config). No ratings or reviews. */
export function JsonLd() {
  const offers = TIERS.map((t) => ({
    "@type": "Offer",
    name: t.name,
    price: t.usd ? String(t.usd.month) : "0",
    priceCurrency: "USD",
    description: t.features.join(", "),
    ...(t.usd ? { priceSpecification: { "@type": "UnitPriceSpecification", price: String(t.usd.month), priceCurrency: "USD", unitCode: "MON" } } : {}),
  }));
  const graph = [
    { "@type": "Organization", "@id": `${SITE}/#org`, name: "Humanora", url: SITE, logo: `${SITE}/icon.svg` },
    { "@type": "WebSite", "@id": `${SITE}/#website`, name: "Humanora", url: SITE, publisher: { "@id": `${SITE}/#org` }, inLanguage: "en" },
    {
      "@type": "SoftwareApplication",
      name: "Humanora",
      url: SITE,
      applicationCategory: "WritingApplication",
      operatingSystem: "Web",
      description: "Scores each sentence of a draft for AI-like writing patterns, highlights them, and rewrites them in a Balanced, Academic or Casual tone. Includes a REST API.",
      publisher: { "@id": `${SITE}/#org` },
      offers,
    },
    { "@type": "FAQPage", mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
