import { cn } from '@/lib/cn'

const MAX_DOTS = 3

export function DayDots({ open, completed, className }: { open: number; completed: number; className?: string }) {
  const dots = [...Array<'open'>(open).fill('open'), ...Array<'done'>(completed).fill('done')]
  if (dots.length === 0) return <span className={cn('h-1.5', className)} />

  return (
    <span className={cn('flex h-1.5 items-center gap-0.5', className)} aria-hidden="true">
      {dots.slice(0, MAX_DOTS).map((kind, i) => (
        <span key={i} className={cn('size-1.5 rounded-full', kind === 'open' ? 'bg-primary' : 'bg-success-fill')} />
      ))}
      {dots.length > MAX_DOTS ? <span className="text-[10px] leading-none font-semibold text-fg-muted">+</span> : null}
    </span>
  )
}
