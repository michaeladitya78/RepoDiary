# Repo Diary 🪵

> Your build journey. Public. Searchable. Shareable.

Post a 2-line daily log. Auto-commit to GitHub. Share a placement-ready profile.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Auth + DB**: Supabase (Postgres + GitHub OAuth)
- **Styling**: Tailwind CSS v4
- **GitHub API**: Octokit
- **Share cards**: Satori + @resvg/resvg-js

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd BuildLog
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Run the SQL schema in **SQL Editor**:

```sql
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  github_username text,
  github_access_token text,
  bio text,
  institution text,
  created_at timestamptz default now()
);

-- Log entries
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  built text not null,
  learned text not null,
  next text not null,
  tags text[],
  github_committed boolean default false,
  github_commit_url text,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.entries enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Public entries are viewable by everyone"
  on public.entries for select using (true);

create policy "Users can insert their own entries"
  on public.entries for insert with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.entries for update using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.entries for delete using (auth.uid() = user_id);
```

### 3. Enable GitHub OAuth in Supabase

1. **Supabase Dashboard → Authentication → Providers → GitHub**
2. Enable the provider, and copy the **Callback URL** displayed (it will look like `https://<your-project-ref>.supabase.co/auth/v1/callback`).
3. Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers):
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://<your-project-ref>.supabase.co/auth/v1/callback` (using your Supabase project ref, e.g., `https://mhtbhbugghvlcdiyscmo.supabase.co/auth/v1/callback`)
   - Required scopes: `repo`, `user:email`
4. Copy the GitHub **Client ID** and **Client Secret** into the Supabase GitHub provider settings.
5. In **Supabase Dashboard → Authentication → URL Configuration**, add `http://localhost:3000/api/auth/callback` to the **Redirect URLs** list.

### 4. Set environment variables

```bash
cp .env.local.example .env.local
```

Fill in your values from Supabase Dashboard → Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key (keep secret!)

### 5. Run dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Update Supabase GitHub OAuth callback URL to your Vercel domain:
   `https://your-app.vercel.app/api/auth/callback`
5. Update `NEXT_PUBLIC_APP_URL` to `https://your-app.vercel.app`

---

## Project Structure

```
app/
  page.tsx                     # Landing page
  login/page.tsx               # GitHub OAuth login
  dashboard/page.tsx           # Post new entries (protected)
  [username]/page.tsx          # Public profile (no auth)
  api/
    auth/callback/route.ts     # Supabase OAuth callback
    entries/route.ts           # POST new entry
    github-commit/route.ts     # Commit entry to GitHub
    share-card/[entryId]/      # Generate PNG share card
components/
  LogEntryCard.tsx             # Reusable entry display card
  PostEntryForm.tsx            # Entry submission form
  DashboardClient.tsx          # Dashboard UI (client)
  ShareCard.tsx                # Share buttons
lib/
  supabase/client.ts           # Browser Supabase client
  supabase/server.ts           # Server Supabase client
  github.ts                    # Octokit GitHub integration
types/
  index.ts                     # Profile + Entry types
middleware.ts                  # Protect /dashboard routes
proxy.ts                       # (legacy — superseded by middleware.ts)
```

---

## Week 3 Note (Share Cards)

The share card API uses `satori` + `@resvg/resvg-js`. The `@resvg/resvg-js` package includes a precompiled native binary — on Windows it should work out of the box. If you hit issues:

```bash
npm rebuild @resvg/resvg-js
```

---

## Security Notes

- `github_access_token` is stored in plain text in Supabase — protected by RLS (only service role can read it). For production, consider encrypting with `pgcrypto`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It's only used in server-side route handlers.
