import type { MetadataRoute } from "next";

/** Only real, indexable public URLs. Add new public pages here when they ship. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://humanora.app/", changeFrequency: "weekly", priority: 1 }];
}
