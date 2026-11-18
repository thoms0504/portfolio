import { TimelineEntry } from './TimelineEntry'
import { Tx } from '@/components/i18n/Tx'
import type { Experience, Education } from '@/types'

interface ExperienceTimelineProps {
  items: Experience[]
  itemsId?: Experience[]
}

interface EducationTimelineProps {
  items: Education[]
  itemsId?: Education[]
}

export function ExperienceTimeline({ items, itemsId }: ExperienceTimelineProps) {
  return (
    <div className="timeline">
      {items.map((item, i) => (
        <TimelineEntry
          key={i}
          period={item.period}
          title={item.role}
          subtitle={item.type ? `${item.company} · ${item.type}` : item.company}
          meta={item.location}
          description={
            item.description ? <Tx en={item.description} id={itemsId?.[i]?.description} /> : undefined
          }
          highlights={item.highlights?.map((h, j) => (
            <Tx key={j} en={h} id={itemsId?.[i]?.highlights?.[j]} />
          ))}
        />
      ))}
    </div>
  )
}

export function EducationTimeline({ items, itemsId }: EducationTimelineProps) {
  return (
    <div className="timeline">
      {items.map((item, i) => (
        <TimelineEntry
          key={i}
          period={item.period}
          title={item.degree}
          subtitle={item.institution}
          description={
            item.description ? <Tx en={item.description} id={itemsId?.[i]?.description} /> : undefined
          }
          highlights={item.highlights?.map((h, j) => (
            <Tx key={j} en={h} id={itemsId?.[i]?.highlights?.[j]} />
          ))}
        />
      ))}
    </div>
  )
}
