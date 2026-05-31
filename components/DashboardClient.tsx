"use client";

import { useCallback, useEffect, useState } from "react";
import { Entry, Profile } from "@/types";
import PostEntryForm from "@/components/PostEntryForm";
import LogEntryCard from "@/components/LogEntryCard";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function DashboardClient({ profile }: { profile: Profile }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Settings state
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [institution, setInstitution] = useState(profile.institution || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setEntries(data || []);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function handleEntryPosted(newEntry: Entry) {
    setEntries((prev) => [newEntry, ...prev]);
  }

  function handleEntryUpdated(updatedEntry: Entry) {
    setEntries((prev) => prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
  }

  function handleEntryDeleted(deletedId: string) {
    setEntries((prev) => prev.filter((e) => e.id !== deletedId));
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
          institution: institution.trim() || null,
        })
        .eq("id", profile.id);

      if (error) throw error;
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Top bar */}
      <nav className="border-b border-slate-800/60 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">RD</span>
            </div>
            <span className="font-bold text-white tracking-tight">Repo Diary</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/${profile.username}`}
              target="_blank"
              className="text-xs text-slate-400 hover:text-green-400 transition-colors hidden sm:block"
            >
              repodiary.com/{profile.username} ↗
            </Link>
            <div className="flex items-center gap-2">
              {profile.avatar_url && (
                <Link href={`/${profile.username}`} target="_blank">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.username}
                    width={28}
                    height={28}
                    className="rounded-full border border-slate-700 hover:border-slate-500 transition-colors"
                  />
                </Link>
              )}
              <span className="hidden sm:block text-xs text-slate-400">{profile.full_name || profile.username}</span>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="ml-1 flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Post form */}
        <PostEntryForm username={profile.username} onEntryPosted={handleEntryPosted} />

        {/* Profile Settings */}
        <div className="glass rounded-2xl p-5 sm:p-6 shadow-xl animate-fade-in stagger-2 opacity-0">
          <h2 className="text-base font-semibold text-white mb-4">⚙️ Profile Settings</h2>
          
          {profileSuccess && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <p className="text-green-400 text-xs font-medium">✅ Profile updated successfully!</p>
            </div>
          )}
          
          {profileError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-xs">{profileError}</p>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="settings-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                id="settings-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="settings-institution" className="block text-xs font-medium text-slate-300 mb-1.5">
                College / Institution
              </label>
              <input
                id="settings-institution"
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="College or University"
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="settings-bio" className="block text-xs font-medium text-slate-300 mb-1.5">
                Bio
              </label>
              <textarea
                id="settings-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              {updatingProfile ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving settings…
                </>
              ) : (
                "Save Settings"
              )}
            </button>
          </form>
        </div>

        {/* Recent entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Your logs{entries.length > 0 ? ` (${entries.length})` : ""}
            </h2>
            <Link
              href={`/${profile.username}`}
              target="_blank"
              className="text-xs text-green-400 hover:underline"
            >
              View public profile →
            </Link>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-600">
              <svg className="animate-spin w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading…
            </div>
          )}

          {!loading && entries.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="text-4xl mb-4">🪵</div>
              <h3 className="text-white font-semibold mb-2">Your repo diary is empty</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Post your first entry above. It takes 30 seconds.
              </p>
            </div>
          )}

          {!loading && entries.length > 0 && (
            <div className="space-y-4">
              {entries.map((entry) => (
                <LogEntryCard
                  key={entry.id}
                  entry={entry}
                  isOwner
                  onUpdate={handleEntryUpdated}
                  onDelete={handleEntryDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
