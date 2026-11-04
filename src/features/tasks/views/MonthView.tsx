import { addMonths, format, isSameDay, isSameMonth } from 'date-fns'
import { Link, Navigate, useParams } from 'react-router'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import {
  daysOf,
  inRange,
  monthGridRange,
  monthRange,
  parseMonthKey,
  rangeQuery,
  toDateKey,
  toMonthKey,
} from '@/lib/dates'
import { useToday } from '@/lib/hooks'
import { useTasks } from '../api/hooks'
import { PeriodNav } from '../components/PeriodNav'
import { Headline } from '../components/ProgressHeadline'
import { TaskPreviewList } from '../components/TaskPreview'
import type { Task } from '../types'
import { countByStatus, groupByDay, openFirst, statusColor } from '../utils'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_IN_CELL = 3

export function MonthView() {
  const { month: param } = useParams()
  const today = useToday()
  const month = parseMonthKey(param)
  if (!month) return <Navigate to={`/month/${toMonthKey(today)}`} replace />
  return <MonthContent month={month} today={today} />
}

function MonthContent({ month, today }: { month: Date; today: Date }) {
  const grid = monthGridRange(month)
  const weeks = chunk(daysOf(grid), 7)
  const { data: tasks, isError, error, refetch } = useTasks(rangeQuery(grid))

  const byDay = groupByDay(tasks ?? [])
  const range = monthRange(month)
  const monthTasks = (tasks ?? []).filter((task) => inRange(new Date(task.dueAt), range))

  return (
    <div className="space-y-4">
      <PeriodNav
        title={format(month, 'MMMM yyyy')}
        prevTo={`/month/${toMonthKey(addMonths(month, -1))}`}
        nextTo={`/month/${toMonthKey(addMonths(month, 1))}`}
        todayTo={`/month/${toMonthKey(today)}`}
        isCurrent={isSameMonth(month, today)}
        prevLabel="Previous month"
        nextLabel="Next month"
      />

      {tasks ? (
        <Headline counts={countByStatus(monthTasks)} period="this month" />
      ) : (
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
      )}

      {isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="grid grid-cols-7 border-b border-border bg-canvas">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2 text-center text-meta font-medium text-fg-secondary">
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week) => (
          <div
            key={toDateKey(week[0])}
            className="grid grid-cols-7 border-border not-first:border-t [&>*+*]:border-l [&>*+*]:border-border"
          >
            {week.map((day) => (
              <DayCell
                key={toDateKey(day)}
                day={day}
                tasks={byDay.get(toDateKey(day)) ?? []}
                outside={!isSameMonth(day, month)}
                isToday={isSameDay(day, today)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

type DayCellProps = {
  day: Date
  tasks: Task[]
  outside: boolean
  isToday: boolean
}

function DayCell({ day, tasks, outside, isToday }: DayCellProps) {
  const sorted = openFirst(tasks)
  const shown = sorted.slice(0, MAX_IN_CELL)
  const more = sorted.length - shown.length
  const label = `${format(day, 'EEEE d MMMM')}, ${tasks.length === 1 ? '1 task' : `${tasks.length} tasks`}`

  return (
    <Link
      to={`/day/${toDateKey(day)}`}
      aria-label={label}
      className={cn(
        'flex min-h-[72px] min-w-0 flex-col items-center gap-1 p-1 outline-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset sm:min-h-28 sm:items-stretch sm:p-1.5',
        outside && 'bg-canvas/60',
      )}
    >
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-full text-meta font-medium tabular-nums',
          outside ? 'text-fg-muted' : 'text-fg',
          isToday && 'bg-primary font-semibold text-white',
        )}
      >
        {format(day, 'd')}
      </span>

      <TaskPreviewList tasks={shown} more={more} className="hidden space-y-0.5 sm:block" />

      {tasks.length > 0 ? (
        <span className="flex w-full flex-col items-center gap-0.5 sm:hidden" aria-hidden="true">
          {shown.map((task) => (
            <span key={task.id} className={cn('h-1 w-full max-w-7 rounded-full', statusColor[task.status])} />
          ))}
          <span className="text-meta leading-4 text-fg-secondary tabular-nums">{tasks.length}</span>
        </span>
      ) : null}
    </Link>
  )
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}
