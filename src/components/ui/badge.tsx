import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'success' | 'warning'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-slate-100 text-slate-800': variant === 'default',
          'border border-slate-200 text-slate-700': variant === 'outline',
          'bg-emerald-100 text-emerald-800': variant === 'success',
          'bg-amber-100 text-amber-800': variant === 'warning',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
