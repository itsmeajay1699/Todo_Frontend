import { format, isSameDay } from 'date-fns'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { toDateKey } from '@/lib/dates'
import { useToday } from '@/lib/hooks'
import type { Task } from '../types'
import { DayDots } from './DayDots'

type DateStripProps = {
  days: Date[]
  tasksByDay: Map<string, Task[]>
  selected?: Date
}

export function DateStrip({ days, tasksByDay, selected }: DateStripProps) {
  const today = useToday()
  return (
    <nav className="grid grid-cols-7 gap-1" aria-label="Days of the week">
      {days.map((day) => {
        const key = toDateKey(day)
        const active = selected !== undefined && isSameDay(day, selected)
        const isToday = isSameDay(day, today)
        const tasks = tasksByDay.get(key) ?? []
        return (
          <Link
            key={key}
            to={`/day/${key}`}
            aria-current={active ? 'date' : undefined}
            aria-label={format(day, 'EEEE d MMMM')}
            className={cn(
              'flex flex-col items-center gap-1 rounded-md border border-transparent py-1.5 transition-colors outline-none',
              'hover:bg-canvas focus-visible:ring-2 focus-visible:ring-primary/30',
              active && 'border-border bg-neutral-bg hover:bg-neutral-bg',
            )}
          >
            <span className="text-meta font-medium text-fg-secondary">{format(day, 'EEE')}</span>
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                isToday ? 'bg-primary text-white' : 'text-fg',
              )}
            >
              {format(day, 'd')}
            </span>
            <DayDots
              open={tasks.filter((t) => t.status === 'IN_PROGRESS').length}
              completed={tasks.filter((t) => t.status === 'COMPLETED').length}
            />
          </Link>
        )
      })}
    </nav>
  )
}
