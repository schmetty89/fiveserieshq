import { Generation } from '@/types'
import { GEN_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface GenBadgeProps {
  gen: Generation
  className?: string
  size?: 'sm' | 'md'
}

export function GenBadge({ gen, className, size = 'md' }: GenBadgeProps) {
  const { bg, text } = GEN_COLORS[gen]
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5',
        className
      )}
      style={{ backgroundColor: bg, color: text }}
    >
      {gen}
    </span>
  )
}
