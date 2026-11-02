/**
 * fetch-github.mjs
 * Fetches public repositories from GitHub for user thoms0504 and writes
 * a structured inventory to content/_inventory/github.json.
 *
 * Usage: node scripts/fetch-github.mjs
 * Requires: GITHUB_TOKEN in .env.local (read-only, public repos only)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUTPUT = path.join(ROOT, 'content', '_inventory', 'github.json')
const GITHUB_USER = 'thoms0504'

// Load .env.local manually (no dotenv dependency)
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
    }
  }
}

async function fetchAllRepos(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const repos = []
  let page = 1

  while (true) {
    const url = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&page=${page}&sort=updated`
    const res = await fetch(url, { headers })

    if (!res.ok) {
      const msg = await res.text()
      throw new Error(`GitHub API error ${res.status}: ${msg}`)
    }

    const batch = await res.json()
    if (!batch.length) break
    repos.push(...batch)
    if (batch.length < 100) break
    page++
  }

  return repos
}

function mapRepo(repo) {
  return {
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? '',
    language: repo.language ?? null,
    topics: repo.topics ?? [],
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    htmlUrl: repo.html_url,
    homepage: repo.homepage ?? null,
    isArchived: repo.archived,
    isFork: repo.fork,
    isPrivate: repo.private,
  }
}

async function main() {
  loadEnv()
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    console.warn('[fetch-github] No GITHUB_TOKEN found in .env.local — using unauthenticated requests (60 req/hr limit)')
  }

  console.log(`[fetch-github] Fetching repos for ${GITHUB_USER}...`)

  let repos
  try {
    repos = await fetchAllRepos(token)
  } catch (err) {
    console.error('[fetch-github] Failed:', err.message)
    process.exit(1)
  }

  // Filter out forks, keep only originals
  const originals = repos.filter((r) => !r.fork)
  const mapped = originals.map(mapRepo)

  const output = {
    fetchedAt: new Date().toISOString(),
    user: GITHUB_USER,
    count: mapped.length,
    repos: mapped,
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8')
  console.log(`[fetch-github] Wrote ${mapped.length} repos to ${path.relative(ROOT, OUTPUT)}`)
}

main()
