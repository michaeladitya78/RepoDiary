"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo user:email",
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    // No need to setLoading(false) — page will navigate away
  }

  return (
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4">
      {/* Back */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 text-sm transition-colors flex items-center gap-1.5"
      >
        ← Back
      </Link>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <img
            src="/logo-dark.png"
            alt="theRepoDiary"
            style={{ height: '40px', width: 'auto', objectFit: 'contain', marginBottom: '0' }}
          />
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-bold text-white text-center mb-2">
            Start your repo diary
          </h1>
          <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
            Sign in with GitHub to post entries and auto-commit to your GitHub profile.
          </p>

          <button
            id="btn-github-login"
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connecting…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </>
            )}
          </button>

          <p className="text-slate-600 text-xs text-center mt-5 leading-relaxed">
            We request <code className="text-slate-400">repo</code> scope to auto-commit your logs to GitHub.
            You can revoke access anytime.
          </p>
        </div>
      </div>
    </main>
  );
}
