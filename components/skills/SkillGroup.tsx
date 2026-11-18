import { TechBadge } from '@/components/ui/TechBadge'
import { Tx } from '@/components/i18n/Tx'

interface SkillGroupProps {
  label: string
  labelId?: string
  items: string[]
}

export function SkillGroup({ label, labelId, items }: SkillGroupProps) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-small font-medium text-muted mb-3">
        <Tx en={label} id={labelId} />
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <TechBadge key={item} tech={item} />
        ))}
      </div>
    </div>
  )
}
