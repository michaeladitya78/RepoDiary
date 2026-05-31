"use client";

import { useState } from "react";
import { Entry } from "@/types";

interface ShareCardProps {
  entry: Entry;
  username: string;
  entryNumber?: number;
}

export default function ShareCard({ entry, username, entryNumber }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const profileUrl = `${window?.location?.origin || "https://repodiary.com"}/${username}`;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadCard() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/share-card/${entry.id}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `repodiary-${username}-${entry.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download card. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShareTwitter() {
    const builtSnippet = entry.built.slice(0, 100);
    const dayText = entryNumber ? `Day ${entryNumber}` : "Today";
    const text = encodeURIComponent(
      `${dayText} of building in public 🔨\n\nBuilt: ${builtSnippet}\n\nFollow my journey → ${profileUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        id="btn-copy-link"
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy link
          </>
        )}
      </button>

      <button
        id="btn-download-card"
        onClick={handleDownloadCard}
        disabled={downloading}
        className="flex items-center gap-1.5 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {downloading ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Downloading…
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download card
          </>
        )}
      </button>

      <button
        id="btn-share-twitter"
        onClick={handleShareTwitter}
        className="flex items-center gap-1.5 text-xs bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </button>
    </div>
  );
}
