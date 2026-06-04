/* eslint-disable */
import Link from "next/link";
import Image from "next/image"; // kept for avatar images in feed
import { createClient } from "@/lib/supabase/server";
import { Entry } from "@/types";
import ProductHuntEmbed from "@/components/ProductHuntEmbed";

const FAKE_ENTRIES = [
  {
    username: "aditya",
    avatar: "https://avatars.githubusercontent.com/u/9919",
    name: "Aditya Kumar",
    date: "May 28, 2025",
    built: "A REST API for my college fest project using Node.js and Express. Added JWT auth and rate limiting.",
    learned: "How middleware chains work in Express and why order matters. Spent 2 hours debugging a 401 that was actually a missing cookie flag.",
    next: "Deploy it on Railway and wire up the React frontend tomorrow.",
    tags: ["nodejs", "express", "jwt"],
  },
  {
    username: "priya",
    avatar: "https://avatars.githubusercontent.com/u/1234567",
    name: "Priya Sharma",
    date: "May 27, 2025",
    built: "My first Supabase integration — real-time chat with row-level security. Users can only read their own messages.",
    learned: "RLS policies in Postgres. Took me forever but now I actually understand auth.uid() and how it maps to the JWT.",
    next: "Add typing indicators and file uploads.",
    tags: ["supabase", "realtime", "postgres"],
  },
  {
    username: "rahul",
    avatar: "https://avatars.githubusercontent.com/u/987654",
    name: "Rahul Verma",
    date: "May 26, 2025",
    built: "A CLI tool in Python that auto-generates README files from your project's directory structure using the OpenAI API.",
    learned: "How to use Click for CLI arg parsing and how to stream OpenAI responses to the terminal so it feels snappy.",
    next: "Publish it to PyPI and write a blog post about it.",
    tags: ["python", "openai", "cli"],
  },
];

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

export default async function LandingPage() {
  const supabase = await createClient();

  // Query 5 most recent entries with profiles
  const { data: recentEntries } = await supabase
    .from("entries")
    .select("*, profiles(username, full_name, avatar_url, institution)")
    .order("created_at", { ascending: false })
    .limit(5);

  const entries: Entry[] = (recentEntries || []).map((entry: any) => {
    if (entry.repo_is_private) {
      const { repo_url, ...rest } = entry;
      return rest;
    }
    return entry;
  });

  return (
    <main className="min-h-screen bg-[#0d1117]">
      {/* Nav */}
      <nav className="border-b border-slate-800/60 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <img
                src="/logo-dark.png"
                alt="theRepoDiary"
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <Link
              href="/explore"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Explore
            </Link>
          </div>
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </nav>

      {/* Hero with Navy-to-Slate Gradient background */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center bg-gradient-to-b from-[#0d1117] to-[#161b22]/30 rounded-3xl mb-12 border border-slate-800/20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Built for engineering students in India</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6 opacity-0 animate-fade-up delay-100">
          Your build journey.{" "}
          <span className="bg-gradient-to-r from-green-400 to-sky-400 bg-clip-text text-transparent">
            Public. Searchable.
          </span>
          <br />
          Shareable.
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-up delay-200">
          Post a 2-line log every day. Build a GitHub history that actually shows
          you&apos;re working — not just a graveyard of half-finished repos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 opacity-0 animate-fade-up delay-300">
          <Link
            href="/login"
            id="cta-start-logging"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95 text-base cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Start logging with GitHub →
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center mb-8 opacity-0 animate-fade-up delay-500">
          <p className="text-sm text-slate-500 mt-4">Featured on</p>
          <div className="mt-2">
            <a 
              href="https://www.producthunt.com/products/repo-diary?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-repo-diary" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                alt="Repo Diary - Your GitHub story, written daily | Product Hunt" 
                width="250" 
                height="54" 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1162889&theme=dark&t=1780531238121"
              />
            </a>
          </div>
        </div>

        {/* Profile URL preview */}
        <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm opacity-0 animate-fade-up delay-500">
          <span className="text-slate-500">Your public profile:</span>
          <span className="text-green-400 font-mono font-medium">repodiary.com/yourname</span>
        </div>
      </section>

      {/* Live Feed Preview Section */}
      <section className="max-w-3xl mx-auto px-4 pb-16 opacity-0 animate-fade-up delay-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shrink-0" />
              <span>Live Builders Feed</span>
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Real-time updates from creators</p>
          </div>
          <Link
            href="/explore"
            className="text-xs text-green-400 hover:text-green-300 transition-colors font-medium"
          >
            See all builders →
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/20 border border-slate-800/40 rounded-2xl">
            <p className="text-slate-500 text-sm">No builders have logged yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const entryProfile = Array.isArray(entry.profiles)
                ? entry.profiles[0]
                : entry.profiles;
              const displayName = entryProfile?.full_name || entryProfile?.username || "Builder";
              const username = entryProfile?.username || "";
              const staggerClass = `stagger-${index + 1}`;

              return (
                <div
                  key={entry.id}
                  className={`bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/60 rounded-xl p-4 sm:p-5 transition-all duration-150 hover:-translate-y-0.5 opacity-0 animate-fade-up ${staggerClass}`}
                >
                  <div className="flex items-start gap-3">
                    <Link href={`/${username}`} className="shrink-0">
                      {entryProfile?.avatar_url ? (
                        <Image
                          src={entryProfile.avatar_url}
                          alt={displayName}
                          width={36}
                          height={36}
                          className="rounded-lg border border-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-sky-500 flex items-center justify-center font-bold text-white text-sm">
                          {username ? username[0].toUpperCase() : "B"}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <Link
                            href={`/${username}`}
                            className="font-semibold text-white text-xs sm:text-sm hover:text-green-400 transition-colors"
                          >
                            {displayName}
                          </Link>
                          {entryProfile?.institution && (
                            <span className="text-slate-500 text-[10px] sm:text-xs ml-1.5 font-medium">
                              🏫 {entryProfile.institution}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0">
                          {formatTimeAgo(entry.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed break-words line-clamp-2">
                        {entry.built}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { icon: "🔨", title: "Build something", desc: "Every day, week, or whenever. Big or small. It all counts." },
            { icon: "📝", title: "Log it in 30 seconds", desc: "What you built, what you learned, what's next. Three fields, done." },
            { icon: "🚀", title: "Share your profile", desc: "One link shows everything. Send it to recruiters, peers, anyone." },
          ].map((step) => (
            <div key={step.title} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5">
              <div className="text-2xl mb-3">{step.icon}</div>
              <h3 className="font-semibold text-white mb-1 text-sm">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example entries */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            What a repo diary looks like
          </h2>
          <p className="text-slate-400 text-sm">Real examples from students building in public</p>
        </div>

        <div className="space-y-4">
          {FAKE_ENTRIES.map((entry) => (
            <div
              key={entry.username}
              className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 hover:border-slate-600/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-sky-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {entry.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{entry.name}</p>
                    <p className="text-slate-500 text-xs">@{entry.username}</p>
                  </div>
                </div>
                <span className="text-slate-500 text-xs shrink-0">{entry.date}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">🔨 Built</span>
                  <p className="text-slate-200 text-sm mt-1 leading-relaxed">{entry.built}</p>
                </div>
                <div>
                  <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">💡 Learned</span>
                  <p className="text-slate-200 text-sm mt-1 leading-relaxed">{entry.learned}</p>
                </div>
                <div>
                  <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">🚀 Next</span>
                  <p className="text-slate-200 text-sm mt-1 leading-relaxed">{entry.next}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-700/60 text-slate-300 px-2.5 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95"
          >
            Start your repo diary →
          </Link>
          <p className="text-slate-500 text-sm mt-3">Free. No email required. Sign in with GitHub.</p>
        </div>
      </section>

      <ProductHuntEmbed />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-4 text-slate-500 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <img
              src="/logo-dark.png"
              alt="theRepoDiary"
              style={{ height: '24px', width: 'auto', objectFit: 'contain', opacity: 0.6 }}
            />
            <p className="mt-1">Built For Lazy Developers</p>
          </div>
          <div>
            <a 
              href="https://www.producthunt.com/products/repo-diary?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-repo-diary" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                alt="Repo Diary - Your GitHub story, written daily | Product Hunt" 
                width="250" 
                height="54" 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1162889&theme=dark&t=1780531238121"
              />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
