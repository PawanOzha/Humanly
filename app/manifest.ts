import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Humanora – AI Humanizer & AI Text Detector",
    short_name: "Humanora",
    description: "Sentence-level AI detection and natural rewrites.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f4",
    theme_color: "#11120f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
