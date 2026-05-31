"use client";

import { useState, useEffect } from "react";
import { Entry } from "@/types";
import Link from "next/link";

interface LogEntryCardProps {
  entry: Entry;
  isOwner?: boolean;
  onUpdate?: (updatedEntry: Entry) => void;
  onDelete?: (entryId: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function LogEntryCard({
  entry,
  isOwner = false,
  onUpdate,
  onDelete,
}: LogEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [built, setBuilt] = useState(entry.built);
  const [learned, setLearned] = useState(entry.learned);
  const [next, setNext] = useState(entry.next);
  const [tags, setTags] = useState(entry.tags ? entry.tags.join(", ") : "");

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBuilt(entry.built);
    setLearned(entry.learned);
    setNext(entry.next);
    setTags(entry.tags ? entry.tags.join(", ") : "");
  }, [entry]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!built.trim() || !learned.trim() || !next.trim()) {
      setError("All three fields are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, built, learned, next, tags }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update entry");
      }
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(data.entry);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete entry");
      }
      setIsDeleting(false);
      if (onDelete) {
        onDelete(entry.id);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting");
    } finally {
      setDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <article className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 sm:p-6 transition-all duration-200">
        <h3 className="text-sm font-semibold text-white mb-4">✏️ Edit Log Entry</h3>
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">🔨 Built</label>
            <textarea
              value={built}
              onChange={(e) => setBuilt(e.target.value)}
              rows={2}
              maxLength={280}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">💡 Learned</label>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              rows={2}
              maxLength={280}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">🚀 Next</label>
            <textarea
              value={next}
              onChange={(e) => setNext(e.target.value)}
              rows={2}
              maxLength={280}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">🏷️ Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setIsEditing(false);
                setError(null);
                setBuilt(entry.built);
                setLearned(entry.learned);
                setNext(entry.next);
                setTags(entry.tags ? entry.tags.join(", ") : "");
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs text-black font-semibold bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </article>
    );
  }

  if (isDeleting) {
    return (
      <article className="bg-red-950/10 border border-red-500/20 rounded-2xl p-5 sm:p-6 transition-all duration-200">
        <p className="text-sm font-medium text-red-200">⚠️ Are you sure? This cannot be undone.</p>
        {entry.github_committed && (
          <p className="text-xs text-slate-400 mt-1.5">
            Note: the GitHub file for this entry will not be deleted automatically.
          </p>
        )}
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              setIsDeleting(false);
              setError(null);
            }}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="text-xs text-white font-semibold bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      </article>
    );
  }

  const showLink = entry.repo_url && (!entry.repo_is_private || isOwner);
  const showCommitLink = entry.github_commit_url && (!entry.repo_is_private || isOwner);

  return (
    <article className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 sm:p-6 hover:border-slate-600/60 hover:-translate-y-0.5 transition-all duration-150 group">
      {/* Date & GitHub badge & Edit/Delete actions */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <time className="text-slate-500 text-xs font-medium">
          {formatDate(entry.created_at)}
        </time>
        <div className="flex items-center gap-2">
          {entry.github_committed && (
            showCommitLink ? (
              <Link
                href={entry.github_commit_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-0.5"
                title="View commit on GitHub"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                committed
              </Link>
            ) : (
              <span
                className="flex items-center gap-1 text-xs text-slate-500 bg-slate-500/10 border border-slate-500/20 rounded-full px-2.5 py-0.5 cursor-help"
                title="Private repository — contribution verified, not publicly accessible"
              >
                <svg className="w-3 h-3 text-slate-500 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                committed
              </span>
            )
          )}
          {isOwner && (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/50 rounded-full px-2.5 py-0.5">
              <button
                onClick={() => setIsEditing(true)}
                className="text-[10px] text-slate-400 hover:text-green-400 transition-colors cursor-pointer"
                title="Edit entry"
              >
                Edit
              </button>
              <span className="text-slate-700 text-[10px]">•</span>
              <button
                onClick={() => setIsDeleting(true)}
                className="text-[10px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Delete entry"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Entry fields */}
      <div className="space-y-3">
        <div>
          <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">
            🔨 Built
          </span>
          <p className="text-slate-200 text-sm mt-1 leading-relaxed">{entry.built}</p>
        </div>
        <div>
          <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
            💡 Learned
          </span>
          <p className="text-slate-200 text-sm mt-1 leading-relaxed">{entry.learned}</p>
        </div>
        <div>
          <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
            🚀 Next
          </span>
          <p className="text-slate-200 text-sm mt-1 leading-relaxed">{entry.next}</p>
        </div>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-700/60 text-slate-300 px-2.5 py-0.5 rounded-full hover:bg-slate-700 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Repository details */}
      {entry.repo_name && (
        <div className="mt-4 pt-3 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-slate-500 font-medium">Repository:</span>
            {showLink ? (
              <a
                href={entry.repo_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 font-mono font-semibold transition-colors"
              >
                {entry.repo_name}
              </a>
            ) : (
              <span className="text-slate-300 font-mono font-semibold">
                {entry.repo_name}
              </span>
            )}

            {entry.repo_is_private ? (
              <span className="inline-flex items-center gap-1 bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                <span title="Private repository — contribution verified, not publicly accessible" className="cursor-help flex items-center">
                  <svg className="w-3 h-3 text-slate-400 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  🔒
                </span>
                private
              </span>
            ) : (
              <span className="inline-flex items-center bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                public
              </span>
            )}
          </div>

          {entry.github_committed && showCommitLink && (
            <a
              href={entry.github_commit_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 font-mono text-[10px] transition-colors"
            >
              commit ↗
            </a>
          )}
        </div>
      )}
    </article>
  );
}
