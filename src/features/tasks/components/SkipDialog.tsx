import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/input'
import { useUpdateTask } from '../api/hooks'
import type { Task } from '../types'

const MAX_REASON = 200

export function SkipDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  return (
    <Dialog open={task !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent title="Skip this task?" description={task?.title}>
        {task ? <SkipForm key={task.id} task={task} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function SkipForm({ task, onClose }: { task: Task; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const update = useUpdateTask()

  const submit = () => {
    const skipReason = reason.trim()
    update.mutate({ id: task.id, status: 'SKIPPED', ...(skipReason ? { skipReason } : {}) }, { onSuccess: onClose })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <DialogBody>
        <Label htmlFor="skip-reason">
          Reason <span className="font-normal text-fg-muted">(optional)</span>
        </Label>
        <Textarea
          id="skip-reason"
          autoFocus
          rows={3}
          maxLength={MAX_REASON}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Not needed any more"
        />
        <p className="mt-1 text-right text-meta text-fg-muted tabular-nums">
          {reason.length}/{MAX_REASON}
        </p>
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={update.isPending}>
          Skip task
        </Button>
      </DialogFooter>
    </form>
  )
}
