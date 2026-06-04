import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import LogEntryCard from "@/components/LogEntryCard";
import ShareCard from "@/components/ShareCard";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Entry, Profile } from "@/types";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, username, id")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) return { title: "Profile not found" };

  const displayName = profile.full_name || profile.username;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://repodiary.com";

  // Get latest entry id for OG image
  const { data: latestEntry } = await supabase
    .from("entries")
    .select("id")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const ogImage = latestEntry
    ? `${appUrl}/api/share-card/${latestEntry.id}`
    : undefined;

  return {
    title: `${displayName} — theRepoDiary`,
    description: profile.bio || `${displayName}'s repo diary on theRepoDiary. Follow their engineering journey.`,
    openGraph: {
      title: `${displayName} — theRepoDiary`,
      description: profile.bio || `${displayName}'s public repo diary.`,
      url: `${appUrl}/${username}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      images: ogImage ? [ogImage] : [],
    },
  };
}

function calculateStreakStats(entries: Entry[]) {
  const totalLogs = entries.length;
  if (totalLogs === 0) {
    return { currentStreak: 0, longestStreak: 0, totalLogs: 0 };
  }

  // Get unique local dates in IST (Asia/Kolkata)
  const getLocalDateInIST = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
  };

  const datesSet = new Set<string>();
  entries.forEach((e) => {
    datesSet.add(getLocalDateInIST(e.created_at));
  });

  const sortedDates = Array.from(datesSet).sort();

  // Helper to parse date string back to local timestamp in IST to avoid time gaps
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Calculate longest streak
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = parseLocalDate(sortedDates[i]);
    if (prevDate === null) {
      currentRun = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, currentRun);
        currentRun = 1;
      }
    }
    prevDate = currentDate;
  }
  longestStreak = Math.max(longestStreak, currentRun);

  // Calculate current streak
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const today = parseLocalDate(todayStr);

  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  let currentStreak = 0;
  const hasToday = datesSet.has(todayStr);
  const hasYesterday = datesSet.has(yesterdayStr);

  if (hasToday || hasYesterday) {
    let checkDate = hasToday ? today : parseLocalDate(yesterdayStr);
    currentStreak = 0;
    while (true) {
      const checkStr = checkDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      if (datesSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak, totalLogs };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch profile (fully public — no auth needed)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single<Profile>();

  if (!profile) notFound();

  // Fetch all entries
  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const allEntries: Entry[] = (entries || []).map((entry: any) => {
    if (entry.repo_is_private) {
      const { repo_url, ...rest } = entry;
      return rest;
    }
    return entry;
  });
  const { currentStreak, longestStreak, totalLogs } = calculateStreakStats(allEntries);

  return (
    <main className="min-h-screen bg-[#0d1117]">
        {/* Nav */}
        <nav className="border-b border-slate-800/60 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/">
              <img
                src="/logo-dark.png"
                alt="theRepoDiary"
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <Link
              href="/login"
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Start your log →
            </Link>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Profile header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start gap-5">
            <div className="shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                  width={72}
                  height={72}
                  className="rounded-2xl border-2 border-slate-700"
                />
              ) : (
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-green-500 to-sky-500 flex items-center justify-center text-2xl font-bold text-white">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">
                {profile.full_name || profile.username}
              </h1>
              {profile.institution && (
                <p className="text-slate-400 text-xs mt-0.5 font-medium tracking-wide flex items-center gap-1">
                  <span>🏫</span>
                  <span>{profile.institution}</span>
                </p>
              )}
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mt-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  @{profile.github_username}
                </a>
              )}
              {profile.bio && (
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{profile.bio}</p>
              )}

              <div className="mt-4 flex items-center text-xs sm:text-sm text-slate-300 font-medium bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-2 w-fit opacity-0 animate-fade-up stagger-1">
                {currentStreak > 0 && <span className="mr-1">🔥</span>}
                <span>{currentStreak} day streak</span>
                <span className="mx-2 text-slate-600">•</span>
                <span>{totalLogs} {totalLogs === 1 ? "log" : "logs"}</span>
                <span className="mx-2 text-slate-600">•</span>
                <span className="text-slate-400">longest: {longestStreak} {longestStreak === 1 ? "day" : "days"}</span>
              </div>
            </div>
          </div>

          {/* Entries */}
          {allEntries.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🪵</div>
              <p className="text-slate-500">No logs yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allEntries.map((entry, index) => {
                const staggerClass = `stagger-${(index % 7) + 2}`; // stagger-2, 3, 4, 5, 6, 7, 8
                return (
                  <div key={entry.id} className={`opacity-0 animate-fade-up ${staggerClass}`}>
                    <LogEntryCard entry={entry} />
                    {/* Share buttons on first entry */}
                    {index === 0 && (
                      <div className="mt-2 px-1">
                        <ShareCard
                          entry={entry}
                          username={profile.username}
                          entryNumber={allEntries.length}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
  );
}
