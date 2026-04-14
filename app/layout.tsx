import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://howmanyobjects.vercel.app"
  ),
  title: "How Many Objects Are Orbiting Earth Right Now? | HowManyObjects.space",
  description:
    "A live counter and orbital visualization showing every human-made object currently orbiting Earth — from active satellites to space debris. Updated in near real-time from CelesTrak / 18th Space Defense Squadron data.",
  keywords: [
    "space debris",
    "satellites",
    "orbital objects",
    "space visualization",
    "LEO",
    "GEO",
    "live counter",
    "space junk",
    "CelesTrak",
  ],
  authors: [{ name: "HowManyObjects.space" }],
  openGraph: {
    title: "How Many Objects Are Orbiting Earth Right Now?",
    description:
      "See every human-made object in orbit — live count, interactive visualization, and deep exploration.",
    url: "https://howmanyobjects.space",
    siteName: "HowManyObjects.space",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "How Many Objects Are Orbiting Earth Right Now?",
    description:
      "A cinematic live counter of every human-made object in orbit around Earth.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#060a14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
