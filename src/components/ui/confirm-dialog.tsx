import { AlertDialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { Button } from './button'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  onConfirm: () => void
  pending?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-fg/30 data-[state=open]:animate-fade-in" />
        <AlertDialog.Content className="fixed top-[20vh] left-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-lg border border-border bg-surface p-5 shadow-overlay outline-none data-[state=open]:animate-pop-in">
          <AlertDialog.Title className="text-base font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-fg-secondary">{description}</AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button>Cancel</Button>
            </AlertDialog.Cancel>
            <Button variant="danger" onClick={onConfirm} disabled={pending}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
