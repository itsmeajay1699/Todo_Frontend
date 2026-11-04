import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/dates'
import type { Task } from '../types'
import { statusColor } from '../utils'

type TaskPreviewListProps = {
  tasks: Task[]
  more: number
  showTime?: boolean
  className?: string
}

export function TaskPreviewList({ tasks, more, showTime = false, className }: TaskPreviewListProps) {
  return (
    <ul className={cn('min-w-0 space-y-1.5', className)}>
      {tasks.map((task) => (
        <li key={task.id} className="flex min-w-0 gap-1.5 text-meta leading-[18px]">
          <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', statusColor[task.status])} aria-hidden="true" />
          <span className="min-w-0">
            <span
              className={cn(
                showTime ? 'line-clamp-2' : 'block truncate',
                task.status === 'IN_PROGRESS' ? 'text-fg' : 'text-fg-muted',
                task.status === 'COMPLETED' && 'line-through decoration-fg-faint',
              )}
            >
              {task.title}
            </span>
            {showTime ? (
              <span className="block text-fg-muted tabular-nums">{formatTime(new Date(task.dueAt))}</span>
            ) : null}
          </span>
        </li>
      ))}
      {more > 0 ? <li className="pl-3 text-meta text-fg-muted tabular-nums">+{more} more</li> : null}
    </ul>
  )
}
