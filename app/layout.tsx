import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Repo Diary — Build in public. Get placed.",
    template: "%s | Repo Diary",
  },
  description:
    "Post a 2-line log every day. Build a GitHub history that actually shows you're working. The build journal for engineering students.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://repodiary.com"),
  openGraph: {
    title: "Repo Diary — Build in public. Get placed.",
    description: "Post a 2-line log every day. Build a GitHub history that actually shows you're working.",
    siteName: "Repo Diary",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repo Diary — Build in public. Get placed.",
    description: "Post a 2-line log every day. Build a GitHub history that actually shows you're working.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
