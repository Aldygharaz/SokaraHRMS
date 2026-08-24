import { Sparkles, type LucideIcon } from 'lucide-react'
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
      "flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-outline bg-surface-container-lowest",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline flex items-center justify-center text-on-surface-variant mb-4 shadow-sm relative">
        <Icon className="w-8 h-8 opacity-60" />
        {actionLabel && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-primary rounded-full animate-ping opacity-50" />
        )}
      </div>
      <h4 className="text-lg font-bold text-on-surface font-display mb-2">{title}</h4>
      <p className="text-sm text-on-surface-variant mb-6 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-bold hover:shadow-lg transition-all cursor-pointer font-display flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> {actionLabel}
        </button>
      )}
    </div>
  )
}
