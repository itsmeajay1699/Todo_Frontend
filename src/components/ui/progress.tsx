import { cn } from '@/lib/cn'

export function ProgressBar({ value, className }: { value: number | null; className?: string }) {
  const pct = value ?? 0
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value ?? undefined}
      className={cn('h-1.5 overflow-hidden rounded-full bg-neutral-bg', className)}
    >
      <div
        className="h-full rounded-full bg-success-fill transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
