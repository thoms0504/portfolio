import { TimelineEntry } from './TimelineEntry'
import type { Experience, Education } from '@/types'

interface ExperienceTimelineProps {
  items: Experience[]
}

interface EducationTimelineProps {
  items: Education[]
}

export function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  return (
    <div className="timeline">
      {items.map((item, i) => (
        <TimelineEntry
          key={i}
          period={item.period}
          title={item.role}
          subtitle={item.type ? `${item.company} · ${item.type}` : item.company}
          meta={item.location}
          description={item.description}
          highlights={item.highlights}
        />
      ))}
    </div>
  )
}

export function EducationTimeline({ items }: EducationTimelineProps) {
  return (
    <div className="timeline">
      {items.map((item, i) => (
        <TimelineEntry
          key={i}
          period={item.period}
          title={item.degree}
          subtitle={item.institution}
          description={item.description}
          highlights={item.highlights}
        />
      ))}
    </div>
  )
}
