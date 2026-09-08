import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next"

const googleSans = localFont({
  src: [
    {
      path: "../public/fonts/GoogleSans-VariableFont.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/GoogleSans-Italic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-google-sans",
});

export const metadata: Metadata = {
  title: "CT Drive — Premier Kenya Transport & Safari Platform",
  description: "Instant quotes for car rentals, private transfers and safari tours across Kenya. Reliable, seamless, and asset-light logistics orchestration.",
  keywords: ["car rental Kenya", "private transfer Mombasa Nairobi", "safari transport Kenya", "CT Drive", "Diani taxi", "Nairobi airport transfer", "car hire Mombasa"],
  metadataBase: new URL("https://www.ctdrive.co.ke"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CT Drive — Premier Kenya Transport & Safari Platform",
    description: "Instant quotes for car rentals, private transfers and safari tours across Kenya. Reliable, seamless, and asset-light logistics orchestration.",
    url: "https://www.ctdrive.co.ke",
    siteName: "CT Drive",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CT Drive",
    description: "Instant quotes for car rentals, private transfers and safari tours across Kenya.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${googleSans.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            }
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}