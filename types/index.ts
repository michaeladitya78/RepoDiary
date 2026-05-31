export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  github_username: string | null;
  bio: string | null;
  institution: string | null;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  built: string;
  learned: string;
  next: string;
  tags: string[] | null;
  github_committed: boolean;
  github_commit_url: string | null;
  repo_name?: string | null;
  repo_url?: string | null;
  repo_is_private?: boolean;
  created_at: string;
  profiles?: Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'institution'>;
}
