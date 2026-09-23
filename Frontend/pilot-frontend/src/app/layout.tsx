import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import AgentationDev from "@/components/AgentationDev";

export const metadata: Metadata = {
  title: "Pilot — AI Interview Prep",
  description:
    "Pilot generates a personalized, editable, practice-ready interview prep kit from your job description in minutes.",
  metadataBase: new URL("https://app.usepilot.lat"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Pilot — AI Interview Prep",
    description:
      "Paste your JD, get a personalized prep kit. Research, questions, flashcards and a study schedule — all generated in one click.",
    url: "https://app.usepilot.lat",
    siteName: "Pilot",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Google Fonts — loaded via <link> to avoid CSS @import ordering issues with Tailwind v4 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full antialiased">
        <AuthProvider>
          {children}
          <AgentationDev />
        </AuthProvider>
      </body>
    </html>
  );
}
