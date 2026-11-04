import { Eye, Pencil, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ErrorState } from '@/components/ui/error-state'
import { cn } from '@/lib/cn'
import { useDebouncedValue } from '@/lib/hooks'
import { useTasks } from '../api/hooks'
import { useTaskActions } from '../task-actions'
import type { Task } from '../types'
import { StatusBadge, TaskMeta } from './badges'
import { TaskListSkeleton } from './TaskList'

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Search tasks" className="sm:max-w-xl">
        {open ? <SearchContent /> : null}
      </DialogContent>
    </Dialog>
  )
}

function SearchContent() {
  const [input, setInput] = useState('')
  const query = useDebouncedValue(input.trim(), 300)
  const { data: results, isFetching, isError, error, refetch } = useTasks({ q: query }, { enabled: query.length > 0 })

  return (
    <div>
      <div className="border-b border-border px-5 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted" />
          <input
            autoFocus
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search by title or description"
            aria-label="Search tasks"
            className="h-9 w-full rounded-md border border-border bg-surface pr-3 pl-9 outline-none placeholder:text-fg-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="min-h-32">
        {query.length === 0 ? (
          <p className="px-5 py-8 text-center text-fg-muted">Type to search your tasks.</p>
        ) : isError ? (
          <div className="p-4">
            <ErrorState error={error} onRetry={() => void refetch()} />
          </div>
        ) : !results ? (
          <TaskListSkeleton rows={3} />
        ) : results.length === 0 ? (
          <p className="px-5 py-8 text-center text-fg-secondary">No tasks match “{query}”.</p>
        ) : (
          <>
            <p className="px-5 pt-3 pb-1 text-meta text-fg-muted tabular-nums">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            <ul className={cn('space-y-0.5 px-2 pb-2', isFetching && 'opacity-60')}>
              {results.map((task) => (
                <SearchResult key={task.id} task={task} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

function SearchResult({ task }: { task: Task }) {
  const actions = useTaskActions()
  const done = task.status !== 'IN_PROGRESS'
  const iconButton =
    'relative z-10 rounded-md p-1.5 text-fg-muted outline-none hover:bg-neutral-bg hover:text-fg focus-visible:ring-2 focus-visible:ring-primary/30'

  return (
    <li className="relative flex min-h-[52px] items-center gap-3 rounded-md px-3 py-2.5 hover:bg-canvas">
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => actions.view(task)}
          className={cn(
            'block w-full text-left text-[15px] leading-[22px] break-words outline-none after:absolute after:inset-0 focus-visible:underline',
            done ? 'text-fg-muted' : 'text-fg',
            task.status === 'COMPLETED' && 'line-through decoration-fg-faint',
          )}
        >
          {task.title}
        </button>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <TaskMeta task={task} showDate />
          {task.status === 'COMPLETED' ? <StatusBadge task={task} /> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <button type="button" className={iconButton} aria-label="View" onClick={() => actions.view(task)}>
          <Eye className="size-4" />
        </button>
        <button type="button" className={iconButton} aria-label="Edit" onClick={() => actions.edit(task)}>
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          className={cn(iconButton, 'hover:bg-danger-bg hover:text-danger')}
          aria-label="Delete"
          onClick={() => actions.confirmDelete(task)}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  )
}
