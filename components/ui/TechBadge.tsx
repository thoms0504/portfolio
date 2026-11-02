import { cn } from '@/lib/cn'
import { getTechVisual } from '@/lib/tech'
import { TechLogo } from './TechLogo'

interface TechBadgeProps {
  tech: string
  size?: 'sm' | 'lg'
  className?: string
}

/**
 * Two-segment badge in the style of a shields.io badge: the real logo on the
 * brand colour, then the technology name.
 */
export function TechBadge({ tech, size = 'sm', className }: TechBadgeProps) {
  const v = getTechVisual(tech)

  return (
    <span
      className={cn('tech-badge', size === 'lg' && 'tech-badge-lg', className)}
      title={v.def.name === tech ? tech : `${tech} (${v.def.name})`}
    >
      <span className="tech-badge-logo" style={{ backgroundColor: v.color }}>
        <TechLogo name={tech} size={size === 'lg' ? 16 : 13} mode="on-brand" />
      </span>
      <span className="tech-badge-name">{tech}</span>
    </span>
  )
}
