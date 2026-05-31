"use client";

import { useState, useRef, useEffect } from "react";
import { Entry } from "@/types";

const MAX_CHARS = 280;

interface PostEntryFormProps {
  username: string;
  onEntryPosted: (entry: Entry) => void;
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  emoji: string;
  accentClass: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function TextAreaField({
  id,
  label,
  emoji,
  accentClass,
  placeholder,
  value,
  onChange,
  error,
}: TextAreaFieldProps) {
  const remaining = MAX_CHARS - value.length;
  const isNearLimit = remaining <= 40;
  const isOverLimit = remaining < 0;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
        <span className="mr-1.5">{emoji}</span>
        {label}
      </label>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={MAX_CHARS + 10} // soft limit; we validate server-side too
          className={`w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-600 resize-none transition-colors focus:outline-none focus:ring-1 ${
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
              : isOverLimit
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
              : "border-slate-700/60 focus:border-green-500/60 focus:ring-green-500/20"
          }`}
        />
        <span
          className={`absolute bottom-2.5 right-3 text-xs tabular-nums ${
            isOverLimit
              ? "text-red-400"
              : isNearLimit
              ? "text-amber-400"
              : "text-slate-600"
          }`}
        >
          {remaining}
        </span>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function PostEntryForm({ username, onEntryPosted }: PostEntryFormProps) {
  const [built, setBuilt] = useState("");
  const [learned, setLearned] = useState("");
  const [next, setNext] = useState("");
  const [tags, setTags] = useState("");

  // GitHub Repos states
  interface Repo {
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
  }
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [repoSearch, setRepoSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [reconnectGitHub, setReconnectGitHub] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch GitHub repos on mount
  useEffect(() => {
    async function fetchRepos() {
      try {
        setReposLoading(true);
        const res = await fetch("/api/github-repos");
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401 || data.reconnect) {
            setReconnectGitHub(true);
            setGlobalError("GitHub token expired. Please reconnect GitHub.");
          } else {
            setGlobalError(data.error || "Failed to load GitHub repositories.");
          }
          return;
        }
        setRepos(data.repos || []);
      } catch (err) {
        setGlobalError("Failed to fetch GitHub repositories.");
      } finally {
        setReposLoading(false);
      }
    }
    fetchRepos();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!built.trim()) newErrors.built = "This field is required";
    else if (built.length > MAX_CHARS) newErrors.built = `Max ${MAX_CHARS} characters`;
    if (!learned.trim()) newErrors.learned = "This field is required";
    else if (learned.length > MAX_CHARS) newErrors.learned = `Max ${MAX_CHARS} characters`;
    if (!next.trim()) newErrors.next = "This field is required";
    else if (next.length > MAX_CHARS) newErrors.next = `Max ${MAX_CHARS} characters`;
    
    if (!selectedRepo) {
      newErrors.repo = "This field is mandatory";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedRepo) return;

    setSubmitting(true);
    setGlobalError(null);
    setReconnectGitHub(false);
    setCommitUrl(null);

    try {
      // 1. Post the entry
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          built,
          learned,
          next,
          tags,
          repo_name: selectedRepo.name,
          repo_url: selectedRepo.html_url,
          repo_is_private: selectedRepo.private,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.error || "Failed to save entry");
        return;
      }

      const entry: Entry = data.entry;

      // 2. Commit to GitHub (Mandatory)
      const commitRes = await fetch("/api/github-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id }),
      });
      const commitData = await commitRes.json();

      if (!commitRes.ok) {
        if (commitData.reconnect) setReconnectGitHub(true);
        setGlobalError(commitData.error || "GitHub commit failed");
      } else {
        setCommitUrl(commitData.commitUrl);
        entry.github_committed = true;
        entry.github_commit_url = commitData.commitUrl;
      }

      onEntryPosted(entry);
      setSuccess(true);
      setBuilt("");
      setLearned("");
      setNext("");
      setTags("");
      setSelectedRepo(null);

      // Hide success after 6s
      setTimeout(() => setSuccess(false), 6000);
    } catch {
      setGlobalError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <div className="glass rounded-2xl p-5 sm:p-6 shadow-xl animate-fade-in stagger-1 opacity-0">
      <h2 className="text-base font-semibold text-white mb-5">📋 New Log Entry</h2>

      {/* Success message */}
      {success && (
        <div className="mb-5 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400 text-sm font-medium mb-1">✅ Log posted!</p>
          <p className="text-slate-400 text-xs">
            Your profile:{" "}
            <a
              href={`/${username}`}
              className="text-green-400 hover:underline font-mono"
              target="_blank"
              rel="noopener noreferrer"
            >
              repodiary.com/{username}
            </a>
          </p>
          {commitUrl && (
            <p className="text-slate-400 text-xs mt-1">
              GitHub commit:{" "}
              <a
                href={commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline"
              >
                View on GitHub →
              </a>
            </p>
          )}
        </div>
      )}

      {/* Global error */}
      {globalError && (
        <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{globalError}</p>
          {reconnectGitHub && (
            <a
              href="/login"
              className="text-xs text-green-400 hover:underline mt-1 block"
            >
              Reconnect GitHub →
            </a>
          )}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <TextAreaField
          id="field-built"
          label="What did you build today?"
          emoji="🔨"
          accentClass="text-green-400"
          placeholder="Built a REST API with JWT auth and rate limiting..."
          value={built}
          onChange={setBuilt}
          error={errors.built}
        />
        <TextAreaField
          id="field-learned"
          label="What did you learn?"
          emoji="💡"
          accentClass="text-sky-400"
          placeholder="How Express middleware chains work and why order matters..."
          value={learned}
          onChange={setLearned}
          error={errors.learned}
        />
        <TextAreaField
          id="field-next"
          label="What's next?"
          emoji="🚀"
          accentClass="text-purple-400"
          placeholder="Deploy on Railway and wire up the React frontend tomorrow..."
          value={next}
          onChange={setNext}
          error={errors.next}
        />

        {/* Tags */}
        <div>
          <label htmlFor="field-tags" className="block text-sm font-medium text-slate-300 mb-1.5">
            🏷️ Tags{" "}
            <span className="text-slate-600 font-normal">(optional, comma separated)</span>
          </label>
          <input
            id="field-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="nextjs, supabase, auth"
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors"
          />
        </div>

        {/* Target Repository Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1">
            <span>📦</span> Target Repository <span className="text-red-500">*</span>
          </label>
          
          <button
            type="button"
            onClick={() => !reconnectGitHub && setDropdownOpen(!dropdownOpen)}
            disabled={reposLoading || reconnectGitHub}
            className={`w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-slate-100 text-sm flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-green-500/20 ${
              errors.repo ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-700/60 hover:border-slate-600/60 focus:border-green-500/60'
            }`}
          >
            {reposLoading ? (
              <span className="text-slate-500 flex items-center gap-2">
                <svg className="animate-spin w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading repositories...
              </span>
            ) : selectedRepo ? (
              <span className="flex items-center gap-2">
                <span>{selectedRepo.private ? "🔒" : "📂"}</span>
                <span className="font-medium text-slate-200">{selectedRepo.full_name}</span>
                {selectedRepo.private ? (
                  <span className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600/50">Private</span>
                ) : (
                  <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">Public</span>
                )}
              </span>
            ) : (
              <span className="text-slate-500">Select a repository...</span>
            )}
            
            <svg className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {errors.repo && <p className="text-red-400 text-xs mt-1">{errors.repo}</p>}

          {dropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden animate-fade-in">
              {/* Search input */}
              <div className="p-2 border-b border-slate-800/80">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-green-500/40 transition-colors"
                  />
                </div>
              </div>

              {/* Repos list */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40">
                {filteredRepos.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No repositories found</div>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.full_name}
                      type="button"
                      onClick={() => {
                        setSelectedRepo(repo);
                        setDropdownOpen(false);
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.repo;
                          return copy;
                        });
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-800/80 transition-colors flex items-center justify-between ${
                        selectedRepo?.full_name === repo.full_name ? 'bg-slate-800/45' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{repo.private ? "🔒" : "📂"}</span>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-200 truncate">{repo.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{repo.full_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {repo.private ? (
                          <span className="text-[9px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600/50">Private</span>
                        ) : (
                          <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">Public</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          id="btn-post-log"
          type="submit"
          disabled={submitting || reconnectGitHub || !selectedRepo}
          className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-[0_0_16px_rgba(34,197,94,0.35)] active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Posting…
            </>
          ) : (
            "Post Log →"
          )}
        </button>
      </form>
    </div>
  );
}
