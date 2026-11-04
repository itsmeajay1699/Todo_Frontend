import { ChevronRight } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import type { Task } from '../types'
import { TaskRow } from './TaskRow'

export function TaskList({
  tasks,
  showDate,
  hideOverdueLabel,
  className,
}: {
  tasks: Task[]
  showDate?: boolean
  hideOverdueLabel?: boolean
  className?: string
}) {
  return (
    <ul className={cn('space-y-0.5', className)}>
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} showDate={showDate} hideOverdueLabel={hideOverdueLabel} />
        ))}
      </AnimatePresence>
    </ul>
  )
}

export function FinishedFold({ tasks, showDate }: { tasks: Task[]; showDate?: boolean }) {
  const [open, setOpen] = useState(false)
  if (tasks.length === 0) return null

  return (
    <div className="mt-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-meta font-medium text-fg-secondary outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <ChevronRight className={cn('size-4 transition-transform duration-200', open && 'rotate-90')} />
        {open ? 'Hide' : 'Show'} completed and skipped <span className="tabular-nums">({tasks.length})</span>
      </button>
      {open ? <TaskList tasks={tasks} showDate={showDate} /> : null}
    </div>
  )
}

export function TaskListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-1 py-1" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex min-h-[52px] items-start gap-3 px-3 py-2.5">
          <Skeleton className="mt-0.5 size-[18px] rounded-[5px]" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5" style={{ width: `${70 - i * 15}%` }} />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-fg-secondary">
      <p>{children}</p>
      {action}
    </div>
  )
}
