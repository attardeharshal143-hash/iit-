import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

// Mono — JetBrains Mono for HUD / code elements
const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LexDrive AI",
  description: "Global AI-powered legal co-pilot and automated challan calculator.",
};

import { DriveProvider } from "../context/DriveContext";
import GlobalCoPilot from "../components/GlobalCoPilot";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <DriveProvider>
            {children}
            <GlobalCoPilot />
          </DriveProvider>
        </ErrorBoundary>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>

        {/* Hidden Google Translate for full-app translation */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script id="gt-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,mr,kn,ta,te,gu,bn',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      </body>
    </html>
  );
}
