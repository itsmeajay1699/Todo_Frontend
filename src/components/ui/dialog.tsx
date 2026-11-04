import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export const Dialog = DialogPrimitive.Root

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  title: ReactNode
  description?: ReactNode
}

// One component for both layouts: a bottom sheet on phones, a centered dialog from `sm` up.
export function DialogContent({ title, description, className, children, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-fg/30 data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        {...(description ? {} : { 'aria-describedby': undefined })}
        className={cn(
          'fixed z-50 flex max-h-[92dvh] flex-col bg-surface shadow-overlay outline-none',
          'inset-x-0 bottom-0 rounded-t-xl data-[state=open]:animate-sheet-in',
          'sm:inset-x-auto sm:top-[10vh] sm:bottom-auto sm:left-1/2 sm:max-h-[80vh] sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:rounded-lg sm:border sm:border-border sm:data-[state=open]:animate-pop-in',
          className,
        )}
        {...props}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-3.5">
          <div className="min-w-0">
            <DialogPrimitive.Title className="text-base font-semibold">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-0.5 text-meta text-fg-secondary">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close
            className="-mr-1.5 rounded-md p-1.5 text-fg-muted hover:bg-neutral-bg hover:text-fg"
            aria-label="Close"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-border px-5 py-3 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}
