import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Opinions and articles by Thomson Sibuea on data science, AI and building software. Coming soon.',
}

export default function ArticlesPage() {
  return (
    <div className="mx-auto max-w-content page-px pb-24 pt-28">
      <p className="eyebrow mb-4">Writing</p>
      <h1 className="text-h1 mb-3">Opinions &amp; Articles</h1>
      <p className="mb-10 max-w-prose text-body text-muted">
        Thoughts on data science, AI and building software.
      </p>

      <div
        className="callout flex-col items-start gap-4 sm:flex-row sm:items-center"
        style={{ padding: '2rem' }}
      >
        <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-line bg-surface-2">
          <FileText size={22} className="text-accent" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="mb-1 flex items-center gap-2 text-body font-medium text-text">
            Coming soon
            <span
              className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs font-normal text-muted"
              style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              In development
            </span>
          </p>
          <p className="max-w-prose text-small text-muted">
            This section is still being built. Opinion pieces and articles will be published here once
            they are ready.
          </p>
        </div>
        <Link href="/projects" className="btn btn-secondary btn-sm flex-shrink-0">
          Browse projects
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
