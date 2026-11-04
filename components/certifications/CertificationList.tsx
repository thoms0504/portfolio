import Image from 'next/image'
import type { Certification } from '@/types'
import { ISSUER_LOGOS } from '@/lib/issuers'

interface CertificationListProps {
  items: Certification[]
}

/** True when a "Mon YYYY" date (end of that month) is already in the past. */
function hasExpired(date: string): boolean {
  const parsed = new Date(`1 ${date} UTC`)
  if (Number.isNaN(parsed.getTime())) return false
  const endOfMonth = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 1)
  return endOfMonth <= Date.now()
}

function IssuerMark({ issuer }: { issuer: string }) {
  const logo = ISSUER_LOGOS[issuer]
  const tile =
    'grid h-11 w-11 flex-shrink-0 place-items-center overflow-hidden rounded-lg border border-line'

  if (!logo) {
    return (
      <span
        className={`${tile} bg-surface-2 text-small font-semibold text-muted`}
        aria-hidden="true"
      >
        {issuer.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  if (logo.image) {
    return (
      <span className={tile} style={{ background: logo.bg }} aria-hidden="true">
        <Image src={logo.image} alt="" width={44} height={44} className="h-full w-full object-cover" />
      </span>
    )
  }

  return (
    <span className={tile} style={{ background: logo.bg }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={24} height={24} fill={logo.fg} focusable="false">
        <path d={logo.path} />
      </svg>
    </span>
  )
}

export function CertificationList({ items }: CertificationListProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((cert) => (
        <li
          key={`${cert.issuer}-${cert.name}`}
          className="flex break-inside-avoid items-start gap-4 rounded-media border border-line bg-surface p-5"
        >
          <IssuerMark issuer={cert.issuer} />
          <div className="min-w-0">
            <p className="text-body font-medium text-text">{cert.name}</p>
            <p className="text-small text-muted">{cert.issuer}</p>
            <p className="mt-2 text-small tabular-nums text-muted">
              Issued {cert.issued}
              {cert.expires ? ` · ${hasExpired(cert.expires) ? 'Expired' : 'Expires'} ${cert.expires}` : ''}
            </p>
            {cert.credentialId && (
              <p
                className="mt-1 break-all text-xs text-muted"
                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
              >
                Credential ID: {cert.credentialId}
              </p>
            )}
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="no-print mt-3 inline-block text-small text-accent hover:text-accent-strong"
              >
                Show credential
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
