import { format } from 'date-fns'
import { Ban, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { useTask, useUpdateTask } from '../api/hooks'
import { useTaskActions } from '../task-actions'
import type { Task } from '../types'
import { PriorityLabel, StatusBadge } from './badges'
import { TaskForm } from './TaskForm'

export type PanelMode = 'view' | 'edit'

type TaskPanelProps = {
  task: Task | null
  mode: PanelMode
  onModeChange: (mode: PanelMode) => void
  onClose: () => void
}

export function TaskPanel({ task, mode, onModeChange, onClose }: TaskPanelProps) {
  const { data } = useTask(task?.id ?? null, task ?? undefined)
  const current = data ?? task
  const update = useUpdateTask()

  return (
    <Dialog open={task !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent title={mode === 'edit' ? 'Edit task' : 'Task details'}>
        {current && mode === 'edit' ? (
          <TaskForm
            key={current.id}
            task={current}
            submitLabel="Save changes"
            onCancel={() => onModeChange('view')}
            onSubmit={(input) =>
              update.mutateAsync({ id: current.id, ...input }).then(() => {
                toast.success('Changes saved')
                onModeChange('view')
              })
            }
          />
        ) : null}
        {current && mode === 'view' ? <TaskDetails task={current} onEdit={() => onModeChange('edit')} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function TaskDetails({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const actions = useTaskActions()
  const due = new Date(task.dueAt)
  const skipped = task.status === 'SKIPPED'

  return (
    <>
      <DialogBody>
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            {skipped ? (
              <Ban className="size-[18px] text-fg-muted" aria-label="Skipped" />
            ) : (
              <Checkbox
                aria-label="Completed"
                checked={task.status === 'COMPLETED'}
                onCheckedChange={(checked) => actions.setStatus(task, checked ? 'COMPLETED' : 'IN_PROGRESS')}
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg leading-6 font-semibold break-words">{task.title}</h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <StatusBadge task={task} />
            </div>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-[88px_1fr] gap-x-3 gap-y-2.5">
          <dt className="text-meta text-fg-muted">Due</dt>
          <dd className="tabular-nums">{format(due, "EEEE, d MMM yyyy 'at' HH:mm")}</dd>
          <dt className="text-meta text-fg-muted">Priority</dt>
          <dd>
            {task.priority === 'LOW' ? 'Low' : task.priority ? <PriorityLabel priority={task.priority} /> : 'None'}
          </dd>
          <dt className="text-meta text-fg-muted">Description</dt>
          <dd className="break-words whitespace-pre-wrap text-fg-secondary">{task.description || '—'}</dd>
          {skipped ? (
            <>
              <dt className="text-meta text-fg-muted">Skip reason</dt>
              <dd className="text-fg-secondary">{task.skipReason || 'No reason given'}</dd>
            </>
          ) : null}
        </dl>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="ghost"
          className="text-danger hover:bg-danger-bg hover:text-danger sm:mr-auto"
          onClick={() => actions.confirmDelete(task)}
        >
          <Trash2 />
          Delete
        </Button>
        {skipped ? (
          <Button onClick={() => actions.setStatus(task, 'IN_PROGRESS')}>
            <RotateCcw />
            Restore
          </Button>
        ) : (
          <Button onClick={() => actions.skip(task)}>
            <Ban />
            Skip
          </Button>
        )}
        <Button variant="primary" onClick={onEdit}>
          <Pencil />
          Edit
        </Button>
      </DialogFooter>
    </>
  )
}
