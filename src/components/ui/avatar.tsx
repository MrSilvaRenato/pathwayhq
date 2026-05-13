import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, imageUrl, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  }

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
