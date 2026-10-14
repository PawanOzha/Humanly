import type { MetadataRoute } from "next";

/** Public marketing pages are crawlable; the in-browser dashboard, auth screens and API proxy are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/", "/login", "/signup"] }],
    sitemap: "https://humanora.app/sitemap.xml",
    host: "https://humanora.app",
  };
}
