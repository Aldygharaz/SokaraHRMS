import React, { useEffect } from 'react'
import { AlertTriangle, Trash2, X, CheckCircle2 } from 'lucide-react'
import { sound } from '@/lib/sound'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  icon?: React.ElementType
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  icon: Icon
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    if (Icon) return <Icon className="w-6 h-6" />
    if (variant === 'danger') return <Trash2 className="w-6 h-6 text-psy-danger" />
    if (variant === 'warning') return <AlertTriangle className="w-6 h-6 text-psy-warning" />
    return <CheckCircle2 className="w-6 h-6 text-accent-primary" />
  }

  const getConfirmStyle = () => {
    if (variant === 'danger') return 'bg-psy-danger hover:bg-psy-danger/90 text-white shadow-lg shadow-psy-danger/20'
    if (variant === 'warning') return 'bg-psy-warning hover:bg-psy-warning/90 text-white shadow-lg shadow-psy-warning/20'
    return 'bg-accent-primary hover:bg-accent-primary/90 text-white shadow-lg shadow-accent-primary/20'
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md glass-panel bg-surface border border-outline rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 z-10">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-2xl shrink-0",
            variant === 'danger' ? "bg-psy-danger-bg text-psy-danger" :
            variant === 'warning' ? "bg-psy-warning-bg text-psy-warning" :
            "bg-accent-primary/10 text-accent-primary"
          )}>
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold font-display text-on-surface leading-snug">
              {title}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed font-medium">
              {description}
            </p>
          </div>

          <button 
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-outline">
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="px-4 py-2.5 rounded-xl border border-outline hover:bg-surface-container text-xs font-bold text-on-surface-variant transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick()
              onConfirm()
              onClose()
            }}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold font-display transition-all cursor-pointer",
              getConfirmStyle()
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
