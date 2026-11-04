import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/dates'
import type { Priority, Task } from '../types'
import { isOverdue } from '../utils'

const priorityStyle: Partial<Record<Priority, { label: string; text: string; dot: string }>> = {
  HIGH: { label: 'High', text: 'text-danger', dot: 'bg-danger-fill' },
  MEDIUM: { label: 'Medium', text: 'text-warning', dot: 'bg-warning-fill' },
}

export function PriorityLabel({ priority }: { priority: Priority | null }) {
  const style = priority ? priorityStyle[priority] : undefined
  if (!style) return null
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium', style.text)}>
      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  )
}

const Dot = () => <span aria-hidden="true">·</span>

export function TaskMeta({
  task,
  showDate = false,
  hideOverdueLabel = false,
  className,
}: {
  task: Task
  showDate?: boolean
  hideOverdueLabel?: boolean
  className?: string
}) {
  const due = new Date(task.dueAt)
  const overdue = isOverdue(task)
  const when = showDate ? `${format(due, 'EEE d MMM')}, ${formatTime(due)}` : formatTime(due)

  return (
    <p className={cn('flex flex-wrap items-center gap-x-1.5 text-meta text-fg-secondary', className)}>
      <time dateTime={task.dueAt} className={cn('tabular-nums', overdue && 'text-overdue')}>
        {when}
      </time>
      {task.status === 'SKIPPED' ? (
        <>
          <Dot />
          <span>Skipped</span>
          {task.skipReason ? (
            <>
              <Dot />
              <span className="min-w-0 break-words">{task.skipReason}</span>
            </>
          ) : null}
        </>
      ) : (
        <>
          {task.priority && priorityStyle[task.priority] ? (
            <>
              <Dot />
              <PriorityLabel priority={task.priority} />
            </>
          ) : null}
          {overdue && !hideOverdueLabel ? (
            <>
              <Dot />
              <span className="font-medium text-overdue">Overdue</span>
            </>
          ) : null}
        </>
      )}
    </p>
  )
}

export function StatusBadge({ task }: { task: Task }) {
  if (task.status === 'COMPLETED') return <Badge tone="success">Completed</Badge>
  if (task.status === 'SKIPPED') return <Badge tone="neutral">Skipped</Badge>
  if (isOverdue(task)) return <Badge tone="danger">Overdue</Badge>
  return <Badge tone="neutral">In progress</Badge>
}
