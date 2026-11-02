import { Mail } from 'lucide-react'
import { SIMPLE_ICONS } from '@/lib/tech-icons'

export type BrandId = 'github' | 'instagram' | 'whatsapp' | 'linkedin' | 'email'

interface BrandIconProps {
  id: BrandId
  size?: number
  className?: string
}

/** Contact-channel logos. LinkedIn is no longer published by simple-icons, so it gets a monogram tile. */
export function BrandIcon({ id, size = 18, className }: BrandIconProps) {
  if (id === 'email') return <Mail size={size} strokeWidth={1.75} aria-hidden="true" className={className} />

  if (id === 'linkedin') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
        <text
          x="12"
          y="17.2"
          textAnchor="middle"
          fontSize="13.5"
          fontWeight="700"
          fill="#fff"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          in
        </text>
      </svg>
    )
  }

  const icon = SIMPLE_ICONS[id]
  if (!icon) return null
  // GitHub's own colour is near-black, which disappears on the dark theme.
  const fill = id === 'github' ? 'var(--text)' : `#${icon.hex}`

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={icon.path} />
    </svg>
  )
}
