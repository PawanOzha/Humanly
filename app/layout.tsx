import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AccountProvider } from "@/components/auth/provider";
import { ConsentBanner } from "@/components/guest/notice";
import "./globals.css";

const TITLE = "Humanora – AI Humanizer & AI Text Detector";
const DESCRIPTION = "Rewrite AI-generated text in a natural voice. Humanora scores each sentence for AI-like patterns, highlights them, and rewrites them in a Balanced, Academic or Casual tone.";
export const metadata: Metadata = {
  metadataBase: new URL("https://humanora.app"),
  title: { default: TITLE, template: "%s" },
  description: DESCRIPTION,
  applicationName: "Humanora",
  appleWebApp: { title: "Humanora", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: "https://humanora.app", siteName: "Humanora", title: TITLE, description: DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#f7f7f4" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={{ backgroundColor: "#f7f7f4", colorScheme: "light" }}>
      <body style={{ backgroundColor: "#f7f7f4", color: "#11120f", margin: 0 }}>
        <Script id="pin-top-on-reload" strategy="beforeInteractive">
          {`(function(){try{if("scrollRestoration"in history)history.scrollRestoration="manual";var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"){if(location.hash)history.replaceState(null,"",location.pathname+location.search);window.scrollTo(0,0);}}catch(e){}})();`}
        </Script>
        <AccountProvider>
          {children}
          <ConsentBanner />
        </AccountProvider>
      </body>
    </html>
  );
}
