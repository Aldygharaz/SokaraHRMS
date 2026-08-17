import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-dashed border-outline bg-surface-container-low/40",
      className
    )}>
      <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline flex items-center justify-center text-on-surface-variant mb-3 shadow-inner">
        <Icon className="w-6 h-6 opacity-60" />
      </div>
      <h4 className="text-sm font-bold text-on-surface font-display">{title}</h4>
      <p className="text-xs text-on-surface-variant mt-1 max-w-xs leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 py-2 px-4 rounded-xl bg-accent-primary text-white text-xs font-bold hover:shadow-md hover:bg-accent-primary/90 transition-all cursor-pointer font-display"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
