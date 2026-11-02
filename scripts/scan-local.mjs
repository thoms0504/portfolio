/**
 * scan-local.mjs
 * Scans local project directories, detects tech stack from manifest files,
 * and writes a structured inventory to content/_inventory/local.json.
 *
 * Usage: node scripts/scan-local.mjs
 * Scans: C:/Users/asus/python, C:/Users/asus/next, C:/xamppnew/htdocs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUTPUT = path.join(ROOT, 'content', '_inventory', 'local.json')

const SCAN_DIRS = [
  'C:/Users/asus/python',
  'C:/Users/asus/next',
  'C:/xamppnew/htdocs',
]

// Directories and files to skip entirely
const SKIP_DIRS = new Set([
  'node_modules', '.venv', 'venv', 'env', '.env',
  'vendor', '.git', '.next', '__pycache__', 'dist',
  'build', '.cache', 'coverage', '.turbo',
])

// Files that must never be read (security)
const SKIP_FILE_PATTERNS = [
  /\.env(\.|$)/i,
  /secrets?\./i,
  /credentials?\./i,
  /password/i,
  /\.key$/i,
  /\.pem$/i,
]

function isSensitiveFile(filename) {
  return SKIP_FILE_PATTERNS.some((re) => re.test(filename))
}

function safeReadFile(filePath) {
  try {
    if (isSensitiveFile(path.basename(filePath))) return null
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

function detectStack(projectDir) {
  const stack = []
  const files = new Set()

  try {
    const entries = fs.readdirSync(projectDir)
    entries.forEach((f) => files.add(f))
  } catch {
    return stack
  }

  // package.json — Node/JS project
  if (files.has('package.json')) {
    const raw = safeReadFile(path.join(projectDir, 'package.json'))
    if (raw) {
      try {
        const pkg = JSON.parse(raw)
        const deps = {
          ...((pkg.dependencies) || {}),
          ...((pkg.devDependencies) || {}),
        }
        const depNames = Object.keys(deps)
        if (depNames.includes('next')) stack.push('Next.js')
        else if (depNames.includes('react')) stack.push('React')
        if (depNames.includes('express')) stack.push('Express')
        if (depNames.includes('typescript') || files.has('tsconfig.json')) stack.push('TypeScript')
        if (depNames.includes('tailwindcss')) stack.push('Tailwind CSS')
        if (depNames.includes('prisma') || depNames.includes('@prisma/client')) stack.push('Prisma')
        if (!stack.length) stack.push('Node.js')
      } catch {
        stack.push('Node.js')
      }
    }
  }

  // requirements.txt — Python project
  if (files.has('requirements.txt')) {
    const raw = safeReadFile(path.join(projectDir, 'requirements.txt'))
    if (raw) {
      const lines = raw.toLowerCase()
      if (lines.includes('django')) stack.push('Django')
      else if (lines.includes('flask')) stack.push('Flask')
      else if (lines.includes('fastapi')) stack.push('FastAPI')
      if (lines.includes('pandas')) stack.push('Pandas')
      if (lines.includes('sqlalchemy')) stack.push('SQLAlchemy')
      if (!stack.length) stack.push('Python')
      else if (!stack.some((s) => ['Django', 'Flask', 'FastAPI'].includes(s))) stack.unshift('Python')
    }
  }

  // composer.json — PHP project
  if (files.has('composer.json')) {
    const raw = safeReadFile(path.join(projectDir, 'composer.json'))
    if (raw) {
      try {
        const comp = JSON.parse(raw)
        const require = comp.require || {}
        if (require['laravel/framework']) stack.push('Laravel')
        else if (require['codeigniter4/framework'] || require['codeigniter/framework']) stack.push('CodeIgniter')
        if (!stack.length) stack.push('PHP')
        else stack.unshift('PHP')
      } catch {
        stack.push('PHP')
      }
    }
  }

  // artisan → Laravel
  if (files.has('artisan') && !stack.includes('Laravel')) stack.push('Laravel')

  // pyproject.toml → Python
  if (files.has('pyproject.toml') && !stack.includes('Python')) stack.push('Python')

  // Dockerfile
  if (files.has('Dockerfile') || files.has('docker-compose.yml')) stack.push('Docker')

  return [...new Set(stack)]
}

function getDescription(projectDir) {
  // Try README.md first, then README.txt
  for (const name of ['README.md', 'readme.md', 'README.txt']) {
    const raw = safeReadFile(path.join(projectDir, name))
    if (raw) {
      // Take first non-heading, non-empty line as description
      const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
      for (const line of lines) {
        if (!line.startsWith('#') && line.length > 10) {
          return line.slice(0, 160)
        }
      }
    }
  }
  return ''
}

function scanDir(baseDir) {
  const projects = []

  if (!fs.existsSync(baseDir)) {
    console.warn(`[scan-local] Directory not found, skipping: ${baseDir}`)
    return projects
  }

  let entries
  try {
    entries = fs.readdirSync(baseDir, { withFileTypes: true })
  } catch (err) {
    console.warn(`[scan-local] Cannot read ${baseDir}: ${err.message}`)
    return projects
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (SKIP_DIRS.has(entry.name)) continue
    if (entry.name.startsWith('.')) continue

    const projectDir = path.join(baseDir, entry.name)
    const stack = detectStack(projectDir)
    const description = getDescription(projectDir)

    // Try to get last modified date
    let lastModified = null
    try {
      const stat = fs.statSync(projectDir)
      lastModified = stat.mtime.toISOString()
    } catch {
      // ignore
    }

    projects.push({
      name: entry.name,
      path: projectDir.replace(/\\/g, '/'),
      sourceDir: baseDir.replace(/\\/g, '/'),
      description,
      stack,
      lastModified,
    })
  }

  return projects
}

function main() {
  console.log('[scan-local] Scanning local project directories...')

  const allProjects = []
  for (const dir of SCAN_DIRS) {
    const found = scanDir(dir)
    console.log(`[scan-local]   ${dir}: ${found.length} projects`)
    allProjects.push(...found)
  }

  // Deduplicate by name (prefer later scan dirs)
  const seen = new Map()
  for (const p of allProjects) {
    const key = p.name.toLowerCase()
    if (!seen.has(key)) seen.set(key, p)
    else {
      // Merge stack
      const existing = seen.get(key)
      existing.stack = [...new Set([...existing.stack, ...p.stack])]
    }
  }

  const unique = [...seen.values()]

  const output = {
    scannedAt: new Date().toISOString(),
    scannedDirs: SCAN_DIRS,
    count: unique.length,
    projects: unique,
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8')
  console.log(`[scan-local] Wrote ${unique.length} unique projects to ${path.relative(ROOT, OUTPUT)}`)
  console.log('[scan-local] Review the inventory and select 6–9 projects to feature.')
}

main()
