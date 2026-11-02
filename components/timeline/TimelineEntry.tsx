interface TimelineEntryProps {
  period: string
  title: string
  subtitle: string
  meta?: string
  description?: string
  highlights?: string[]
}

export function TimelineEntry({
  period,
  title,
  subtitle,
  meta,
  description,
  highlights,
}: TimelineEntryProps) {
  const isCurrent = /present/i.test(period)

  return (
    <div className={`tl-item reveal${isCurrent ? ' tl-current' : ''}`}>
      <div className="tl-date">
        <span>{period}</span>
      </div>

      <div className="tl-rail" aria-hidden="true">
        <span className="tl-dot" />
        <span className="tl-line" />
      </div>

      <div className="tl-card">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
          <p className="text-h3 text-text">{title}</p>
          {isCurrent && <span className="tl-badge">Current</span>}
        </div>
        <p className="text-body text-muted">{subtitle}</p>
        {meta && <p className="text-small text-faint mt-1">{meta}</p>}
        {description && <p className="text-body text-muted mt-4">{description}</p>}
        {highlights && highlights.length > 0 && (
          <ul className="tl-list mt-4">
            {highlights.map((h, i) => (
              <li key={i} style={{ ['--i' as string]: i }}>
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
