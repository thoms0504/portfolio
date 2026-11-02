import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Project, ProjectFrontmatter } from '@/types'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects')
const MEDIA_DIR = path.join(process.cwd(), 'public', 'projects')

const IMAGE_RE = /\.(png|jpe?g|webp|gif|avif)$/i
const VIDEO_RE = /\.(mp4|webm|mov)$/i

/**
 * Documentation is discovered from the filesystem: drop screenshots / videos into
 * public/projects/<slug>/ and they show up in the project's "Dokumentasi" tab.
 */
function discoverMedia(slug: string): { images: string[]; videos: string[] } {
  const dir = path.join(MEDIA_DIR, slug)
  if (!fs.existsSync(dir)) return { images: [], videos: [] }

  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  const toUrl = (f: string) => `/projects/${slug}/${encodeURIComponent(f)}`

  return {
    images: files.filter((f) => IMAGE_RE.test(f)).map(toUrl),
    videos: files.filter((f) => VIDEO_RE.test(f)).map(toUrl),
  }
}

function listMdxSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

function listMediaFolders(): string[] {
  if (!fs.existsSync(MEDIA_DIR)) return []
  return fs
    .readdirSync(MEDIA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

/** Every MDX file plus every folder in public/projects becomes a project. */
export function getProjectSlugs(): string[] {
  return Array.from(new Set([...listMdxSlugs(), ...listMediaFolders()]))
}

function titleFromSlug(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getProjectBySlug(slug: string): Project | null {
  const media = discoverMedia(slug)
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    // A folder without an MDX file still shows up, flagged as not yet described.
    if (!fs.existsSync(path.join(MEDIA_DIR, slug))) return null
    return {
      title: titleFromSlug(slug),
      slug,
      summary: '',
      category: 'Other',
      featured: false,
      period: { start: '', end: '' },
      stack: [],
      content: '',
      images: media.images,
      videos: media.videos,
      cover: media.images[0] ?? '',
    }
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const fm = data as ProjectFrontmatter

  return {
    ...fm,
    slug,
    period: fm.period ?? { start: '', end: '' },
    stack: fm.stack ?? [],
    content: content.trim(),
    images: media.images,
    videos: media.videos,
    cover: media.images[0] ?? '',
  }
}

export function getAllProjects(): Project[] {
  return getProjectSlugs()
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is Project => p !== null)
    .sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) ||
        (b.period.start || '').localeCompare(a.period.start || '')
    )
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured)
}
