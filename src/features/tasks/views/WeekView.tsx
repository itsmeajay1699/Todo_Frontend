import { addWeeks, format, isSameDay, isSameWeek } from 'date-fns'
import { Link, Navigate, useParams } from 'react-router'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import {
  WEEK_OPTIONS,
  daysOf,
  formatWeekRange,
  parseDateKey,
  rangeQuery,
  toDateKey,
  weekRange,
  weekStart,
} from '@/lib/dates'
import { useToday } from '@/lib/hooks'
import { useTasks } from '../api/hooks'
import { PeriodNav } from '../components/PeriodNav'
import { Headline } from '../components/ProgressHeadline'
import { TaskPreviewList } from '../components/TaskPreview'
import type { Task } from '../types'
import { countByStatus, groupByDay, openFirst } from '../utils'

const MAX_IN_CARD = 5

export function WeekView() {
  const { date: param } = useParams()
  const today = useToday()
  if (param === undefined) return <WeekContent start={weekStart(today)} today={today} />
  const date = parseDateKey(param)
  if (!date) return <Navigate to="/week" replace />
  return <WeekContent start={weekStart(date)} today={today} />
}

function WeekContent({ start, today }: { start: Date; today: Date }) {
  const range = weekRange(start)
  const { data: tasks, isError, error, refetch } = useTasks(rangeQuery(range))
  const byDay = groupByDay(tasks ?? [])

  return (
    <div className="space-y-4">
      <PeriodNav
        title={formatWeekRange(start, today)}
        prevTo={`/week/${toDateKey(addWeeks(start, -1))}`}
        nextTo={`/week/${toDateKey(addWeeks(start, 1))}`}
        todayTo="/week"
        isCurrent={isSameWeek(start, today, WEEK_OPTIONS)}
        prevLabel="Previous week"
        nextLabel="Next week"
      />

      {tasks ? (
        <Headline counts={countByStatus(tasks)} period="this week" />
      ) : (
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
      )}

      {isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}

      <div className="grid gap-2 lg:grid-cols-7">
        {daysOf(range).map((day) => (
          <DayCard
            key={toDateKey(day)}
            day={day}
            tasks={tasks ? (byDay.get(toDateKey(day)) ?? []) : null}
            isToday={isSameDay(day, today)}
          />
        ))}
      </div>
    </div>
  )
}

function DayCard({ day, tasks, isToday }: { day: Date; tasks: Task[] | null; isToday: boolean }) {
  const sorted = openFirst(tasks ?? [])
  const shown = sorted.slice(0, MAX_IN_CARD)
  const open = sorted.filter((task) => task.status === 'IN_PROGRESS').length

  return (
    <Link
      to={`/day/${toDateKey(day)}`}
      aria-label={`${format(day, 'EEEE d MMMM')}, ${sorted.length === 1 ? '1 task' : `${sorted.length} tasks`}`}
      className={cn(
        'flex min-w-0 flex-col gap-2.5 rounded-lg border bg-surface p-3 outline-none hover:border-fg-faint focus-visible:ring-2 focus-visible:ring-primary/30 lg:min-h-72',
        isToday ? 'border-primary/50' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col items-center">
          <span className="text-meta leading-5 font-medium text-fg-secondary">{format(day, 'EEE')}</span>
          <span
            className={cn(
              'flex size-7 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums',
              isToday && 'bg-primary text-white',
            )}
          >
            {format(day, 'd')}
          </span>
        </div>
        {open > 0 ? (
          <span className="text-meta leading-5 whitespace-nowrap text-fg-secondary tabular-nums">{open} open</span>
        ) : null}
      </div>

      {tasks === null ? (
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-meta text-fg-muted">No tasks</p>
      ) : (
        <TaskPreviewList tasks={shown} more={sorted.length - shown.length} showTime />
      )}
    </Link>
  )
}
