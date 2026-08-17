import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: TooltipPosition
  delay?: number
  shortcut?: string
  className?: string          // Applied to container wrapper
  tooltipClassName?: string   // Applied to tooltip popup bubble
  disabled?: boolean
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 0,
  shortcut,
  className,
  tooltipClassName,
  disabled = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; actualPos: TooltipPosition }>({
    top: 0,
    left: 0,
    actualPos: position
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<any>(null)

  const updateCoordinates = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    // Auto flip if near viewport boundary
    let actualPos = position
    if (position === 'top' && rect.top < 60) {
      actualPos = 'bottom'
    } else if (position === 'bottom' && rect.bottom > window.innerHeight - 60) {
      actualPos = 'top'
    } else if (position === 'left' && rect.left < 140) {
      actualPos = 'right'
    } else if (position === 'right' && rect.right > window.innerWidth - 140) {
      actualPos = 'left'
    }

    let top = 0
    let left = 0

    switch (actualPos) {
      case 'top':
        top = rect.top - 8
        left = Math.max(16, Math.min(window.innerWidth - 16, rect.left + rect.width / 2))
        break
      case 'bottom':
        top = rect.bottom + 8
        left = Math.max(16, Math.min(window.innerWidth - 16, rect.left + rect.width / 2))
        break
      case 'left':
        top = rect.top + rect.height / 2
        left = rect.left - 8
        break
      case 'right':
        top = rect.top + rect.height / 2
        left = rect.right + 8
        break
    }

    setCoords({ top, left, actualPos })
  }, [position])

  const showTooltip = () => {
    if (disabled || !content) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateCoordinates()
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsVisible(false)
  }

  // Handle outside scroll, resize & escape key
  useEffect(() => {
    if (!isVisible) return

    const handleScrollOrResize = () => {
      updateCoordinates()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideTooltip()
      }
    }

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, updateCoordinates])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const transformStyle: Record<TooltipPosition, string> = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)'
  }

  const arrowClasses: Record<TooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-container-highest border-x-transparent border-b-transparent border-t-[5px] border-x-[5px] border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface-container-highest border-x-transparent border-t-transparent border-b-[5px] border-x-[5px] border-t-0',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-container-highest border-y-transparent border-r-transparent border-l-[5px] border-y-[5px] border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-surface-container-highest border-y-transparent border-l-transparent border-r-[5px] border-y-[5px] border-r-0'
  }

  return (
    <>
      <div 
        ref={containerRef}
        className={cn("relative inline-flex items-center", className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onClick={hideTooltip}
      >
        {children}
      </div>

      {isVisible && !disabled && content && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: transformStyle[coords.actualPos],
            zIndex: 99999
          }}
          className={cn(
            "pointer-events-none select-none whitespace-normal w-max max-w-[280px] px-3 py-1.5 rounded-xl text-xs font-medium tracking-normal text-on-surface bg-surface-container-highest/98 backdrop-blur-md border border-outline shadow-xl break-words text-left",
            tooltipClassName
          )}
        >
          <div className="flex items-center gap-2">
            <span className="leading-snug text-[11px] font-sans">{content}</span>
            {shortcut && (
              <span className="px-1.5 py-0.5 rounded-md bg-surface-container-low/80 border border-outline text-[9px] font-mono text-on-surface-variant shrink-0 font-bold">
                {shortcut}
              </span>
            )}
          </div>
          <span className={cn("absolute w-0 h-0", arrowClasses[coords.actualPos])} />
        </div>,
        document.body
      )}
    </>
  )
}
