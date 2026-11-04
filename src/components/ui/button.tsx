import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-border bg-surface text-fg hover:bg-canvas',
  ghost: 'text-fg-secondary hover:bg-neutral-bg hover:text-fg',
  danger: 'bg-danger text-white hover:bg-[#912018]',
}

const sizes = {
  sm: 'h-8 gap-1.5 px-2.5 text-meta',
  md: 'h-9 gap-2 px-3.5',
  icon: 'size-8 justify-center',
}

export type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  asChild?: boolean
}

export function Button({ variant = 'secondary', size = 'md', asChild, className, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(
        'inline-flex shrink-0 items-center rounded-md font-medium whitespace-nowrap transition-colors outline-none select-none',
        'focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
