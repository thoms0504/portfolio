import Image from 'next/image'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import type { Certification } from '@/types'
import { ISSUER_LOGOS, getCredentialUrl } from '@/lib/issuers'

interface CertificationListProps {
  items: Certification[]
}

const mono = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } as const

/** Date at the end of a "Mon YYYY" month, or null when it cannot be parsed. */
function endOfMonth(date: string): number | null {
  const parsed = new Date(`1 ${date} UTC`)
  if (Number.isNaN(parsed.getTime())) return null
  return Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 1)
}

function hasExpired(date: string): boolean {
  const end = endOfMonth(date)
  return end !== null && end <= Date.now()
}

function IssuerMark({ issuer }: { issuer: string }) {
  const logo = ISSUER_LOGOS[issuer]
  const tile =
    'grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-xl border border-line-strong shadow-sm'

  if (!logo) {
    return (
      <span className={`${tile} bg-surface-2 text-body font-semibold text-muted`} aria-hidden="true">
        {issuer.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  if (logo.image) {
    return (
      <span className={tile} style={{ background: logo.bg }} aria-hidden="true">
        <Image src={logo.image} alt="" width={56} height={56} className="h-full w-full object-cover" />
      </span>
    )
  }

  return (
    <span className={tile} style={{ background: logo.bg }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={28} height={28} fill={logo.fg} focusable="false">
        <path d={logo.path} />
      </svg>
    </span>
  )
}

function StatusChip({ expires }: { expires?: string }) {
  if (!expires) return null
  const expired = hasExpired(expires)
  return (
    <span
      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
      style={{
        ...mono,
        color: expired ? 'var(--text-muted)' : 'var(--accent)',
        borderColor: expired ? 'var(--line-strong)' : 'var(--accent-border)',
        background: expired ? 'var(--surface-2)' : 'var(--accent-surface)',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: expired ? 'var(--text-faint)' : 'var(--accent)' }}
        aria-hidden="true"
      />
      {expired ? 'Expired' : 'Active'}
    </span>
  )
}

export function CertificationList({ items }: CertificationListProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((cert) => {
        const url = getCredentialUrl(cert)
        return (
          <li
            key={`${cert.issuer}-${cert.name}`}
            className="group flex break-inside-avoid flex-col gap-4 rounded-media border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <IssuerMark issuer={cert.issuer} />
              <div className="min-w-0 flex-1">
                <p className="text-small text-muted">{cert.issuer}</p>
                <p className="mt-0.5 text-body font-medium leading-snug text-text">{cert.name}</p>
              </div>
              <StatusChip expires={cert.expires} />
            </div>

            <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted" style={mono}>
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} aria-hidden="true" />
                <dt className="sr-only">Issued</dt>
                <dd>Issued {cert.issued}</dd>
              </div>
              {cert.expires && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={13} aria-hidden="true" />
                  <dt className="sr-only">Expiry</dt>
                  <dd>
                    {hasExpired(cert.expires) ? 'Expired' : 'Expires'} {cert.expires}
                  </dd>
                </div>
              )}
            </dl>

            {(cert.credentialId || url) && (
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                {cert.credentialId ? (
                  <p className="min-w-0 break-all text-xs text-faint" style={mono}>
                    ID: {cert.credentialId}
                  </p>
                ) : (
                  <span />
                )}
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Show credential: ${cert.name} (opens in a new tab)`}
                    className="no-print btn btn-secondary btn-sm flex-shrink-0"
                  >
                    Show credential
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
