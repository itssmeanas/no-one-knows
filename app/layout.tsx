// app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

const appName = "No One Knows";
const appDescription =
  "A quiet place for anonymous truths. Leave an anonymous confession, read what strangers are carrying, and react only if you felt it too.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: `${appName} — A quiet place for anonymous truths.`,
    template: `%s — ${appName}`
  },
  description: appDescription,
  applicationName: appName,
  authors: [{ name: appName }],
  creator: appName,
  publisher: appName,
  openGraph: {
    type: "website",
    siteName: appName,
    title: `${appName} — A quiet place for anonymous truths.`,
    description: appDescription,
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "A glowing keyhole in a dark room for No One Knows"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — A quiet place for anonymous truths.`,
    description: appDescription,
    images: ["/og/default.png"]
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
  themeColor: "#050308"
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} min-h-screen bg-ink-950 font-sans text-zinc-100 antialiased`}
      >
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_34rem),linear-gradient(180deg,#050308_0%,#0a0610_48%,#050308_100%)]">
          {children}
        </div>
      </body>
    </html>
  );
}