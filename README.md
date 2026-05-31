Repo Diary

[![Live Demo](https://img.shields.io/badge/Live_Demo-repo--diary.vercel.app-blue?style=for-the-badge)](https://repo-diary.vercel.app/)

> Every repo has a story. Tell yours.

Repo Diary is a public build journal designed for engineering students and developers to document their daily progress, track their streaks, and build a continuous, verifiable GitHub history. 

Instead of building in isolation, Repo Diary commits your daily updates directly into your project repositories, creating a contributable and easily verifiable proof of work.

---

The Problem & Solution

The Problem: Junior developers and engineering students often struggle to build a continuous GitHub history that includes real context. Commits alone do not tell the story of what was learned, why decisions were made, or what is coming next. 

The Solution: Repo Diary acts as a bridge between a personal journal and a developer portfolio. By logging your daily progress, the application automatically generates and commits a standardized markdown file (devlog/YYYY-MM-DD.md) directly into the repository you are working on.

Key Features

- Seamless GitHub Integration: Login with GitHub via OAuth and fetch your repository list, sorted by recently updated.
- Direct-to-Repo Commits: Automatically generates a clean Markdown entry and commits it to your selected repo using the GitHub Contents API. Appends to the same file if multiple logs are made in a single day.
- Smart Repo Visibility:
    - Public Repos: Rendered as clickable links on the global explore feed, allowing visitors to view the code and contribute natively via GitHub PRs.
    - Private Repos: Displayed with a lock badge and plain text. The contribution is verified, but the repo_url is never exposed to the client-side, ensuring absolute security.
- Explore Feed & Streaks: Discover what other developers are building globally. Track your daily logging streak to build a consistent shipping habit.

---

How It Works

1. Authentication: Users authenticate via GitHub OAuth, granting repo access. The github_access_token is securely stored.
2. Repo Selection: The app fetches the user's repos (GET /user/repos?affiliation=owner) and displays them in a searchable dropdown, handling pagination and filtering.
3. The Commit Engine: Upon submission, the backend checks for existing files at devlog/YYYY-MM-DD.md. 
    - If no file exists: It creates a new file via PUT.
    - If a file exists: It fetches the sha, decodes the base64 content, appends the new entry below a divider, and updates the file.
4. Database: Entries, streaks, and GitHub commit URLs are stored in Supabase to power the frontend Explore feed and user profiles.

---

Tech Stack

- Frontend: Next.js (React), Tailwind CSS
- Backend: Next.js API Routes / Server Actions
- Database & Auth: Supabase (PostgreSQL)
- External APIs: GitHub REST API (Contents API, User API)
- Deployment: Vercel

---

Local Development Setup

To run Repo Diary locally, follow these steps:

1. Clone the repository
```bash
git clone [https://github.com/yourusername/repo-diary.git](https://github.com/yourusername/repo-diary.git)
cd repo-diary
Install dependencies

Bash
npm install
Configure Environment Variables
Create a .env.local file in the root directory and add the following keys:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
Run the development server

Bash
npm run dev
Open http://localhost:3000 in your browser to view the application.

Contributing

Contributions, issues, and feature requests are welcome. 

Designed and built to make continuous shipping a habit.
