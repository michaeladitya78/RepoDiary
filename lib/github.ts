import { Octokit } from '@octokit/rest'
import { Entry } from '@/types'

function formatMarkdown(entry: Entry, date: string): string {
  return `theRepoDiary — ${date}

 🔨 What I built
${entry.built}

💡 What I learned
${entry.learned}

🚀 What's next
${entry.next}

---
*Logged via [theRepoDiary](https://repodiary.com)*
`
}

export async function commitEntryToGitHub(
  token: string,
  githubUsername: string,
  entry: Entry
): Promise<{ commitUrl: string }> {
  if (!entry.repo_name) {
    throw new Error('No repository selected for this entry.')
  }

  const octokit = new Octokit({ auth: token })
  
  let owner = githubUsername
  let repo = entry.repo_name
  if (repo.includes('/')) {
    const parts = repo.split('/')
    owner = parts[0]
    repo = parts[1]
  }

  const date = new Date(entry.created_at).toISOString().split('T')[0]
  const filePath = `devlog/${date}.md`

  let existingSha: string | undefined = undefined
  let existingContent = ''

  // --- 1. Get existing file if it exists ---
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    })
    if (!Array.isArray(data) && data.type === 'file') {
      existingSha = data.sha
      existingContent = Buffer.from(data.content, 'base64').toString('utf8')
    }
  } catch (err: any) {
    const status = err.status || (err.response && err.response.status)
    if (status === 401) {
      throw new Error('Bad credentials')
    }
    const message = err.message || ''
    if (status === 409 || message.toLowerCase().includes('empty')) {
      throw new Error('This repo has no commits yet. Push at least one commit to it first, then try again.')
    }
    // 404 is expected if the file doesn't exist, but if we don't have access, the subsequent write will fail.
  }

  // --- 2. Format content ---
  const newEntryContent = formatMarkdown(entry, date)
  const finalContent = existingContent
    ? `${existingContent.trim()}\n\n---\n\n${newEntryContent}`
    : newEntryContent

  const contentBase64 = Buffer.from(finalContent).toString('base64')

  // --- 3. Create or update file ---
  try {
    const { data: commitData } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `📝 theRepoDiary ${date}`,
      content: contentBase64,
      sha: existingSha,
    })
    const commitUrl = commitData.commit.html_url!
    return { commitUrl }
  } catch (err: any) {
    const status = err.status || (err.response && err.response.status)
    const message = err.message || ''
    
    if (status === 409 || message.toLowerCase().includes('empty')) {
      throw new Error('This repo has no commits yet. Push at least one commit to it first, then try again.')
    }
    if (status === 403 || status === 404 || message.toLowerCase().includes('permission') || message.toLowerCase().includes('write')) {
      throw new Error("You don't have write access to this repo. Choose a repo you own.")
    }
    throw err
  }
}
