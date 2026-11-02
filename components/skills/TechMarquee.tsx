import { TechLogo } from '@/components/ui/TechLogo'

interface TechMarqueeProps {
  names: string[]
}

/** Slow, endlessly scrolling strip of technology logos. Pauses on hover. */
export function TechMarquee({ names }: TechMarqueeProps) {
  if (names.length === 0) return null
  const loop = [...names, ...names]

  return (
    <div className="marquee py-6 border-y border-line" aria-label="Technologies used across projects">
      <div className="marquee-track">
        {loop.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="inline-flex items-center gap-2.5 text-muted"
            aria-hidden={i >= names.length}
          >
            <TechLogo name={name} size={22} />
            <span className="text-small font-medium whitespace-nowrap">{name}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
