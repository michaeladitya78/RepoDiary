import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "theRepoDiary — Your GitHub story, written daily.",
    template: "%s | theRepoDiary",
  },
  description:
    "Post a 2-line log every day. Build a GitHub history that actually shows you're working. The build journal for engineering students.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://repodiary.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-icon-dark.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/logo-icon-dark.png", sizes: "180x180", type: "image/png" },
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "theRepoDiary",
    description: "Your GitHub story, written daily.",
    images: ["/logo-dark.png"],
    siteName: "theRepoDiary",
  },
  twitter: {
    card: "summary_large_image",
    title: "theRepoDiary",
    description: "Your GitHub story, written daily.",
    images: ["/logo-dark.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#0d1117] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
