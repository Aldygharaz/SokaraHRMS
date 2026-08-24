import React from 'react'
import { cn } from '@/lib/utils'

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  intensity?: number
  containerClassName?: string
}

export function TiltCard({ children, className, containerClassName, ...props }: TiltCardProps) {
  return (
    <div className={cn("w-full h-full", containerClassName)}>
      <div
        className={cn("w-full h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", className)}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}
