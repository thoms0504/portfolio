import { cn } from '@/lib/cn'

interface TagProps {
  children: React.ReactNode
  className?: string
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-block text-small text-muted border border-line rounded-tag px-[10px] py-1 font-sans',
        className
      )}
    >
      {children}
    </span>
  )
}
