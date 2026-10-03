import { useState, useRef, useEffect, useLayoutEffect, useCallback, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content?: ReactNode
  title?: string
  description?: ReactNode
  badge?: string
  shortcut?: string
  icon?: LucideIcon | any
  children: ReactNode
  position?: TooltipPosition
  delay?: number
  maxWidth?: number | string
  className?: string          // Applied to container wrapper
  tooltipClassName?: string   // Applied to tooltip popup bubble
  disabled?: boolean
  toggleOnClick?: boolean
}

export function Tooltip({
  content,
  title,
  description,
  badge,
  shortcut,
  icon: Icon,
  children,
  position = 'top',
  delay = 50,
  maxWidth = 320,
  className,
  tooltipClassName,
  disabled = false,
  toggleOnClick = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState<{
    top: number
    left: number
    actualPos: TooltipPosition
    arrowOffset: number
  }>({
    top: 0,
    left: 0,
    actualPos: position,
    arrowOffset: 20
  })

  const tooltipId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<any>(null)

  const hasData = Boolean(title || description || content)

  const updateCoordinates = useCallback(() => {
    if (!containerRef.current) return
    const triggerRect = containerRef.current.getBoundingClientRect()
    
    // Accurate dynamic measurement with fallback estimate
    const tooltipWidth = tooltipRef.current?.offsetWidth || (typeof maxWidth === 'number' ? Math.min(maxWidth, 280) : 280)
    const tooltipHeight = tooltipRef.current?.offsetHeight || 60

    const margin = 12
    let actualPos = position

    // Auto-flip vertical boundary checks
    if (position === 'top' && triggerRect.top - tooltipHeight - 8 < margin) {
      actualPos = 'bottom'
    } else if (position === 'bottom' && triggerRect.bottom + tooltipHeight + 8 > window.innerHeight - margin) {
      actualPos = 'top'
    } 
    // Auto-flip horizontal boundary checks
    else if (position === 'left' && triggerRect.left - tooltipWidth - 8 < margin) {
      actualPos = 'right'
    } else if (position === 'right' && triggerRect.right + tooltipWidth + 8 > window.innerWidth - margin) {
      actualPos = 'left'
    }

    let top = 0
    let left = 0
    let arrowOffset = 0

    if (actualPos === 'top' || actualPos === 'bottom') {
      if (actualPos === 'top') {
        top = triggerRect.top - tooltipHeight - 8
      } else {
        top = triggerRect.bottom + 8
      }
      // Center horizontally on trigger, clamp strictly inside screen viewport
      const idealLeft = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2)
      left = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, idealLeft))
      
      // Calculate dynamic arrow pointer offset matching trigger center
      const triggerCenter = triggerRect.left + (triggerRect.width / 2)
      arrowOffset = Math.max(14, Math.min(tooltipWidth - 14, triggerCenter - left))
    } else {
      // 'left' or 'right'
      if (actualPos === 'left') {
        left = triggerRect.left - tooltipWidth - 8
      } else {
        left = triggerRect.right + 8
      }
      // Center vertically on trigger, clamp strictly inside screen viewport
      const idealTop = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2)
      top = Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, idealTop))
      
      // Calculate dynamic arrow pointer offset matching trigger middle
      const triggerMiddle = triggerRect.top + (triggerRect.height / 2)
      arrowOffset = Math.max(14, Math.min(tooltipHeight - 14, triggerMiddle - top))
    }

    setCoords({ top, left, actualPos, arrowOffset })
  }, [position, maxWidth])

  const showTooltip = () => {
    if (disabled || !hasData) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsVisible(false)
  }

  const toggleTooltip = () => {
    if (disabled || !hasData) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsVisible(prev => !prev)
  }

  // Measure and align coordinates immediately after DOM node is mounted before paint
  useLayoutEffect(() => {
    if (isVisible) {
      updateCoordinates()
    }
  }, [isVisible, updateCoordinates])

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

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(e.target as Node) &&
        tooltipRef.current && 
        !tooltipRef.current.contains(e.target as Node)
      ) {
        hideTooltip()
      }
    }

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDownOutside)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDownOutside)
    }
  }, [isVisible, updateCoordinates])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const hasRichHeader = Boolean(title || badge || Icon)
  const bodyText = description || content

  return (
    <>
      <div 
        ref={containerRef}
        aria-describedby={isVisible && hasData ? tooltipId : undefined}
        className={cn("relative inline-flex items-center", className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onClick={() => {
          if (toggleOnClick) {
            toggleTooltip()
          }
        }}
      >
        {children}
      </div>

      {isVisible && !disabled && hasData && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
            zIndex: 99999
          }}
          className={cn(
            "pointer-events-none select-none whitespace-normal w-max px-3 py-2 rounded-xl text-xs font-medium tracking-normal text-slate-100 bg-slate-900 dark:bg-slate-950 border border-slate-700 shadow-2xl break-words text-left animate-in fade-in zoom-in-95 duration-150 ease-out",
            tooltipClassName
          )}
        >
          {hasRichHeader ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {Icon && <Icon className="w-3.5 h-3.5 text-accent-primary shrink-0" />}
                  {title && (
                    <span className="font-bold text-xs text-slate-100 tracking-tight truncate">
                      {title}
                    </span>
                  )}
                </div>
                {badge && (
                  <span className="px-1.5 py-0.5 rounded bg-accent-primary/20 text-accent-primary border border-accent-primary/30 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              {bodyText && (
                <div className="text-[11px] leading-relaxed text-slate-300 font-sans">
                  {bodyText}
                </div>
              )}
              {shortcut && (
                <div className="pt-1 flex justify-end">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-[9px] font-mono text-slate-400 font-semibold">
                    {shortcut}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {badge && (
                <span className="px-1.5 py-0.5 rounded bg-accent-primary/20 text-accent-primary border border-accent-primary/30 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">
                  {badge}
                </span>
              )}
              <span className="leading-snug text-[11px] font-sans text-slate-200">
                {bodyText}
              </span>
              {shortcut && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-[9px] font-mono text-slate-400 shrink-0 font-bold">
                  {shortcut}
                </span>
              )}
            </div>
          )}
          
          {/* Rotated square seamless border arrow */}
          {coords.actualPos === 'top' && (
            <span 
              style={{ left: `${coords.arrowOffset}px` }} 
              className="absolute -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-950 border-r border-b border-slate-700 pointer-events-none" 
            />
          )}
          {coords.actualPos === 'bottom' && (
            <span 
              style={{ left: `${coords.arrowOffset}px` }} 
              className="absolute -top-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-950 border-l border-t border-slate-700 pointer-events-none" 
            />
          )}
          {coords.actualPos === 'left' && (
            <span 
              style={{ top: `${coords.arrowOffset}px` }} 
              className="absolute -right-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-950 border-t border-r border-slate-700 pointer-events-none" 
            />
          )}
          {coords.actualPos === 'right' && (
            <span 
              style={{ top: `${coords.arrowOffset}px` }} 
              className="absolute -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-950 border-b border-l border-slate-700 pointer-events-none" 
            />
          )}
        </div>,
        document.body
      )}
    </>
  )
}

export interface InfoTooltipProps extends Omit<TooltipProps, 'children'> {
  className?: string
  iconClassName?: string
}

export function InfoTooltip({
  title,
  description,
  content,
  badge,
  shortcut,
  icon,
  position = 'top',
  delay = 50,
  maxWidth = 320,
  className,
  iconClassName
}: InfoTooltipProps) {
  return (
    <Tooltip
      title={title}
      description={description}
      content={content}
      badge={badge}
      shortcut={shortcut}
      icon={icon}
      position={position}
      delay={delay}
      maxWidth={maxWidth}
      className={className}
      toggleOnClick={true}
    >
      <span 
        tabIndex={0}
        role="button"
        aria-label={title || "Informasi fitur"}
        className="inline-flex items-center justify-center p-0.5 rounded text-on-surface-variant/70 hover:text-accent-primary hover:bg-surface-container cursor-help transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent-primary"
      >
        <HelpCircle className={cn("w-3.5 h-3.5", iconClassName)} />
      </span>
    </Tooltip>
  )
}

