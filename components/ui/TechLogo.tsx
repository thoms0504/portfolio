import { getTechVisual } from '@/lib/tech'

interface TechLogoProps {
  name: string
  size?: number
  /**
   * `brand`    - coloured logo for neutral backgrounds (skill tiles, marquee).
   * `on-brand` - monochrome logo for use on top of the brand colour (badge left segment).
   */
  mode?: 'brand' | 'on-brand'
  className?: string
}

/**
 * Renders the real brand logo (simple-icons, CC0) for a technology. Brands without
 * a published logo fall back to a monogram in the brand colour.
 */
export function TechLogo({ name, size = 20, mode = 'brand', className }: TechLogoProps) {
  const v = getTechVisual(name)

  const onBrandFill = v.isLight ? '#0b0d10' : '#ffffff'
  const fill = mode === 'on-brand' ? onBrandFill : v.isDark ? 'var(--text)' : v.color

  if (!v.path) {
    return (
      <span
        className={className}
        aria-hidden="true"
        style={{
          display: 'inline-block',
          minWidth: size,
          textAlign: 'center',
          fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
          fontWeight: 700,
          fontSize: Math.max(9, Math.round(size * (v.def.mono && v.def.mono.length > 2 ? 0.5 : 0.62))),
          lineHeight: 1,
          color: fill,
        }}
      >
        {v.def.mono}
      </span>
    )
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <path d={v.path} />
    </svg>
  )
}
