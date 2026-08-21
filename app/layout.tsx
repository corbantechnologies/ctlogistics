import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "CT Logistics — Premier Kenya Transport & Safari Platform",
  description: "Instant quotes for car rentals, private transfers and safari tours across Kenya. Reliable, seamless, and asset-light logistics orchestration.",
  keywords: ["car rental Kenya", "private transfer Mombasa Nairobi", "safari transport Kenya", "CT Logistics", "Diani taxi", "Nairobi airport transfer", "car hire Mombasa"],
  metadataBase: new URL("https://www.ctdrive.co.ke"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CT Logistics — Premier Kenya Transport & Safari Platform",
    description: "Instant quotes for car rentals, private transfers and safari tours across Kenya. Reliable, seamless, and asset-light logistics orchestration.",
    url: "https://www.ctdrive.co.ke",
    siteName: "CT Logistics",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CT Logistics",
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
      </body>
    </html>
  );
}