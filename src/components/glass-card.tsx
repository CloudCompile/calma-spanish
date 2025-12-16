import { cn } from '@/lib/utils'
import { type HTMLAttributes, forwardRef } from 'react'

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong'
  hover?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300',
          variant === 'default' && 'glass-card',
          variant === 'strong' && 'glass-card-strong',
          hover && 'hover:-translate-y-1 hover:shadow-[0_12px_48px_oklch(0.35_0.08_265/0.15)]',
          className
        )}
        {...props}
      />
    )
  }
)

GlassCard.displayName = 'GlassCard'
