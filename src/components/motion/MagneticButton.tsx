import React from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  intensity?: number
}

export function MagneticButton({ children, className, ...props }: MagneticButtonProps) {
  return (
    <button
      className={cn("transition-all duration-150 active:scale-95", className)}
      {...props}
    >
      {children}
    </button>
  )
}
