import type { Metadata } from "next";
import Script from "next/script";
import { AccountProvider } from "@/components/auth/provider";
import { ConsentBanner } from "@/components/guest/notice";
import "./globals.css";

export const metadata: Metadata = {
  title: "Humanly — AI humanizer",
  description: "Paste a draft. We mark exactly which sentences read as AI, then rewrite them in a natural voice.",
};

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
