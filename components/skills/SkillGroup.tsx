import { TechBadge } from '@/components/ui/TechBadge'

interface SkillGroupProps {
  label: string
  items: string[]
}

export function SkillGroup({ label, items }: SkillGroupProps) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-small font-medium text-muted mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <TechBadge key={item} tech={item} />
        ))}
      </div>
    </div>
  )
}
