import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const fieldClass =
  'w-full rounded-md border border-border bg-surface px-3 text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 aria-invalid:border-danger aria-invalid:focus:ring-danger/15 disabled:opacity-60'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldClass, 'h-9', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldClass, 'min-h-20 resize-y py-2', className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('mb-1.5 block text-meta font-medium text-fg-secondary', className)} {...props} />
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-meta text-danger">{message}</p>
}
