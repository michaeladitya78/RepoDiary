"use client";

import { useState, useMemo } from "react";
import { Entry } from "@/types";
import Image from "next/image";
import Link from "next/link";

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ExploreClientProps {
  entries: Entry[];
  allTags: string[];
}

export default function ExploreClient({ entries, allTags }: ExploreClientProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = entries;

    if (selectedTag) {
      result = result.filter(
        (e) => e.tags && e.tags.includes(selectedTag)
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) => {
        const entryProfile = Array.isArray(e.profiles)
          ? e.profiles[0]
          : e.profiles;
        const name = (
          entryProfile?.full_name ||
          entryProfile?.username ||
          ""
        ).toLowerCase();
        return (
          e.built.toLowerCase().includes(q) ||
          e.learned.toLowerCase().includes(q) ||
          e.next.toLowerCase().includes(q) ||
          name.includes(q) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [entries, search, selectedTag]);

  return (
    <>
      {/* Search + tag filter bar */}
      <div className="mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="explore-search"
            type="text"
            placeholder="Search by name, skill, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tag filter pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-3 py-1 rounded-full transition-colors font-medium ${
                selectedTag === null
                  ? "bg-green-500 text-black"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              All
            </button>
            {allTags.slice(0, 20).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`text-xs px-3 py-1 rounded-full transition-colors font-medium ${
                  selectedTag === tag
                    ? "bg-green-500 text-black"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        {(search || selectedTag) && (
          <p className="text-slate-500 text-xs">
            {filtered.length === 0
              ? "No entries found"
              : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"} found`}
          </p>
        )}
      </div>

      {/* Entry list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/20 border border-slate-800 rounded-2xl">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-500 text-sm">
            {entries.length === 0
              ? "No logs found. Be the first to start logging!"
              : "No entries match your search."}
          </p>
          {(search || selectedTag) && (
            <button
              onClick={() => { setSearch(""); setSelectedTag(null); }}
              className="mt-4 text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              Clear filters →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry, index) => {
            const entryProfile = Array.isArray(entry.profiles)
              ? entry.profiles[0]
              : entry.profiles;
            const displayName =
              entryProfile?.full_name || entryProfile?.username || "Builder";
            const username = entryProfile?.username || "";
            const staggerClass = `stagger-${(index % 8) + 1}`;

            return (
              <div
                key={entry.id}
                className={`bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/60 rounded-2xl p-5 sm:p-6 transition-all duration-150 hover:-translate-y-0.5 opacity-0 animate-fade-up ${staggerClass}`}
              >
                <div className="flex items-start gap-4">
                  <Link href={`/${username}`} className="shrink-0">
                    {entryProfile?.avatar_url ? (
                      <Image
                        src={entryProfile.avatar_url}
                        alt={displayName}
                        width={44}
                        height={44}
                        className="rounded-xl border border-slate-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-sky-500 flex items-center justify-center font-bold text-white text-lg">
                        {username ? username[0].toUpperCase() : "B"}
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <Link
                          href={`/${username}`}
                          className="font-semibold text-white text-sm sm:text-base hover:text-green-400 transition-colors"
                        >
                          {displayName}
                        </Link>
                        <span className="text-slate-500 text-xs sm:text-sm ml-1.5">
                          @{username}
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs shrink-0">
                        {formatTimeAgo(entry.created_at)}
                      </span>
                    </div>

                    {entryProfile?.institution && (
                      <p className="text-slate-400 text-xs mt-0.5 font-medium tracking-wide flex items-center gap-1">
                        <span>🏫</span>
                        <span>{entryProfile.institution}</span>
                      </p>
                    )}

                    <div className="mt-3">
                      <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">
                        🔨 Built
                      </span>
                      <p className="text-slate-200 text-sm mt-1 leading-relaxed break-words">
                        {entry.built}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/40">
                      {entry.tags && entry.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() =>
                                setSelectedTag(selectedTag === tag ? null : tag)
                              }
                              className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                                selectedTag === tag
                                  ? "bg-green-500 text-black font-semibold"
                                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                              }`}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div />
                      )}
                      <Link
                        href={`/${username}`}
                        className="text-xs text-green-400 hover:text-green-300 font-medium transition-colors shrink-0"
                      >
                        View full log →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
