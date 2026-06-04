import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Entry } from "@/types";
import ExploreClient from "./ExploreClient";

export const revalidate = 0; // refresh on each page load

export default async function ExplorePage() {
  const supabase = await createClient();

  // Get current user for header
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url, full_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  // Fetch 50 most recent entries with profiles
  const { data: entriesData } = await supabase
    .from("entries")
    .select("*, profiles(username, full_name, avatar_url, institution)")
    .order("created_at", { ascending: false })
    .limit(50);

  const entries: Entry[] = (entriesData || []).map((entry: any) => {
    if (entry.repo_is_private) {
      const { repo_url, ...rest } = entry;
      return rest;
    }
    return entry;
  });

  // Collect all unique tags for the filter bar
  const allTags = Array.from(
    new Set(entries.flatMap((e) => e.tags || []))
  ).sort();

  return (
    <main className="min-h-screen bg-[#0d1117]">
      {/* Nav */}
      <nav className="border-b border-slate-800/60 px-4 py-4 sticky top-0 bg-[#0d1117]/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <img
                src="/logo-dark.png"
                alt="theRepoDiary"
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <Link href="/explore" className="text-sm font-semibold text-green-400">
              Explore
            </Link>
          </div>
          <div>
            {user && profile ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold bg-green-500 hover:bg-green-400 text-black px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link href={`/${profile.username}`}>
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username}
                      width={28}
                      height={28}
                      className="rounded-full border border-slate-700 hover:border-slate-500 transition-colors"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white">
                      {profile.username[0].toUpperCase()}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Sign in →
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Explore Builders
          </h1>
          <p className="text-slate-400 text-sm">
            See what engineering students across India are building in public
            right now.
          </p>
        </div>

        <ExploreClient entries={entries} allTags={allTags} />
      </div>
    </main>
  );
}
