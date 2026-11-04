import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const tones = {
  neutral: 'bg-neutral-bg text-neutral',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
}

export type BadgeTone = keyof typeof tones

export function Badge({ tone = 'neutral', className, ...props }: ComponentProps<'span'> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center rounded px-1.5 text-meta leading-none font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
