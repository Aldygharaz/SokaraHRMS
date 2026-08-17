import { cn } from '@/lib/utils'

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  intensity?: number
}

export function TiltCard({ children, className, intensity: _intensity, ...props }: TiltCardProps) {
  return (
    <div
      className={cn("transition-colors duration-150", className)}
      {...props}
    >
      {children}
    </div>
  )
}
