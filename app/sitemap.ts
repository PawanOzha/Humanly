import type { MetadataRoute } from "next";

/** Only real, indexable public URLs. Add new public pages here when they ship. */
const PAGES: [string, MetadataRoute.Sitemap[number]["changeFrequency"], number][] = [
  ["/", "weekly", 1],
  ["/about", "monthly", 0.6],
  ["/security", "monthly", 0.5],
  ["/contact", "yearly", 0.4],
  ["/privacy", "yearly", 0.3],
  ["/terms", "yearly", 0.3],
  ["/cookies", "yearly", 0.2],
  ["/refund", "yearly", 0.3],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(([path, changeFrequency, priority]) => ({ url: `https://humanora.app${path}`, changeFrequency, priority }));
}
