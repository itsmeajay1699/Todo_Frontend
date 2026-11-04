import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCreateTask, useDeleteTask, useSetTaskStatus } from '../api/hooks'
import { TaskActionsContext, type TaskActions } from '../task-actions'
import type { Task } from '../types'
import { SkipDialog } from './SkipDialog'
import { TaskForm } from './TaskForm'
import { TaskPanel, type PanelMode } from './TaskPanel'

export function TaskActionsProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<{ task: Task; mode: PanelMode } | null>(null)
  const [createDate, setCreateDate] = useState<Date | null>(null)
  const [skipping, setSkipping] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)

  const createTask = useCreateTask()
  const deleteTask = useDeleteTask()
  const setStatus = useSetTaskStatus()

  const remove = (task: Task) =>
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success('Task deleted')
        setDeleting(null)
        setPanel((current) => (current?.task.id === task.id ? null : current))
      },
    })

  const actions: TaskActions = {
    create: (defaultDate) => setCreateDate(defaultDate ?? new Date()),
    view: (task) => setPanel({ task, mode: 'view' }),
    edit: (task) => setPanel({ task, mode: 'edit' }),
    skip: setSkipping,
    setStatus: (task, status) => setStatus.mutate({ task, status }),
    confirmDelete: setDeleting,
    deleteNow: remove,
  }

  return (
    <TaskActionsContext.Provider value={actions}>
      {children}

      <Dialog open={createDate !== null} onOpenChange={(open) => !open && setCreateDate(null)}>
        <DialogContent title="New task">
          {createDate ? (
            <TaskForm
              defaultDate={createDate}
              submitLabel="Create task"
              onCancel={() => setCreateDate(null)}
              onSubmit={(input) =>
                createTask.mutateAsync(input).then(() => {
                  toast.success('Task created')
                  setCreateDate(null)
                })
              }
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <TaskPanel
        task={panel?.task ?? null}
        mode={panel?.mode ?? 'view'}
        onModeChange={(mode) => setPanel((current) => current && { ...current, mode })}
        onClose={() => setPanel(null)}
      />

      <SkipDialog task={skipping} onClose={() => setSkipping(null)} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this task?"
        description={deleting ? `“${deleting.title}” will be permanently deleted.` : null}
        confirmLabel="Delete"
        pending={deleteTask.isPending}
        onConfirm={() => deleting && remove(deleting)}
      />
    </TaskActionsContext.Provider>
  )
}
