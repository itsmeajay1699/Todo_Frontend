import { ToggleGroup } from 'radix-ui'
import { cn } from '@/lib/cn'

type Option<T extends string> = { value: T; label: string }

type SegmentedProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  label: string
  className?: string
}

export function Segmented<T extends string>({ value, onChange, options, label, className }: SegmentedProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next as T)}
      aria-label={label}
      className={cn('inline-flex rounded-md border border-border bg-neutral-bg p-0.5', className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            'h-7 flex-1 rounded-[5px] px-3 text-meta font-medium text-fg-secondary transition-colors outline-none',
            'hover:text-fg focus-visible:ring-2 focus-visible:ring-primary/30',
            'data-[state=on]:bg-surface data-[state=on]:text-fg data-[state=on]:shadow-[0_0_0_1px_var(--color-border)]',
          )}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
