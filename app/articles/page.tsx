import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { Tx } from '@/components/i18n/Tx'

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Opinions and articles by Thomson Sibuea on data science, AI and building software. Coming soon.',
}

export default function ArticlesPage() {
  return (
    <div className="mx-auto max-w-content page-px pb-24 pt-28">
      <p className="eyebrow mb-4">
        <Tx en="Writing" id="Tulisan" />
      </p>
      <h1 className="text-h1 mb-3">
        <Tx en="Opinions & Articles" id="Opini & Artikel" />
      </h1>
      <p className="mb-10 max-w-prose text-body text-muted">
        <Tx
          en="Thoughts on data science, AI and building software."
          id="Pemikiran tentang data science, AI, dan pengembangan perangkat lunak."
        />
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
            <Tx en="Coming soon" id="Segera hadir" />
            <span
              className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs font-normal text-muted"
              style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              <Tx en="In development" id="Dalam pengembangan" />
            </span>
          </p>
          <p className="max-w-prose text-small text-muted">
            <Tx
              en="This section is still being built. Opinion pieces and articles will be published here once they are ready."
              id="Bagian ini masih dalam pengembangan. Tulisan opini dan artikel akan dipublikasikan di sini setelah siap."
            />
          </p>
        </div>
        <Link href="/projects" className="btn btn-secondary btn-sm flex-shrink-0">
          <Tx en="Browse projects" id="Lihat proyek" />
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
