import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface SlideOverProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export function SlideOver({ isOpen, onClose, title, children, width = "max-w-md" }: SlideOverProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop (Dark Apple HIG blur) */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Slide-over panel */}
      <div 
        className={cn(
          "relative w-full bg-surface-container-lowest h-full flex flex-col shadow-2xl border-l border-outline",
          "animate-in slide-in-from-right duration-300 ease-out",
          width
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline bg-surface">
          <h2 className="text-lg font-bold font-display text-on-surface">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
          {children}
        </div>
      </div>
    </div>
  )
}
