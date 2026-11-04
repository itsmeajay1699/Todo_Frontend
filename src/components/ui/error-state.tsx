import { AlertCircle } from 'lucide-react'
import { Button } from './button'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#FECDCA] bg-danger-bg px-3.5 py-2.5 text-danger">
      <AlertCircle className="size-4 shrink-0" />
      <p className="min-w-0 flex-1 text-meta">{message}</p>
      <Button size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
