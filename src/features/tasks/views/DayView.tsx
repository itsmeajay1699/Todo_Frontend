import { addDays, format, isSameDay } from 'date-fns'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { daysOf, parseDateKey, rangeQuery, toDateKey, weekRange } from '@/lib/dates'
import { useToday } from '@/lib/hooks'
import { useTasks } from '../api/hooks'
import { DateStrip } from '../components/DateStrip'
import { PeriodNav } from '../components/PeriodNav'
import { Headline } from '../components/ProgressHeadline'
import { EmptyState, FinishedFold, TaskList, TaskListSkeleton } from '../components/TaskList'
import { useTaskActions } from '../task-actions'
import { countByStatus, groupByDay, splitFinished } from '../utils'

export function DayView() {
  const { date: param } = useParams()
  const today = useToday()
  const date = parseDateKey(param)
  if (!date) return <Navigate to={`/day/${toDateKey(today)}`} replace />
  return <DayContent date={date} today={today} />
}

function DayContent({ date, today }: { date: Date; today: Date }) {
  const actions = useTaskActions()
  const isToday = isSameDay(date, today)
  const week = weekRange(date)

  // Fetch the whole week: it feeds the strip's dots, and switching days within it needs no new request.
  const weekTasks = useTasks(rangeQuery(week))
  const overdue = useTasks({ status: 'IN_PROGRESS', to: today.toISOString() }, { enabled: isToday })

  const byDay = groupByDay(weekTasks.data ?? [])
  const dayTasks = byDay.get(toDateKey(date)) ?? []
  const { open, finished } = splitFinished(dayTasks)
  const overdueTasks = isToday ? [...(overdue.data ?? [])].reverse() : []
  const [showAllOverdue, setShowAllOverdue] = useState(false)
  const visibleOverdue = showAllOverdue ? overdueTasks : overdueTasks.slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PeriodNav
        title={format(date, isToday ? "'Today,' d MMM yyyy" : 'EEEE, d MMM yyyy')}
        prevTo={`/day/${toDateKey(addDays(date, -1))}`}
        nextTo={`/day/${toDateKey(addDays(date, 1))}`}
        todayTo={`/day/${toDateKey(today)}`}
        isCurrent={isToday}
        prevLabel="Previous day"
        nextLabel="Next day"
      />

      <div className="rounded-lg border border-border bg-surface p-1.5">
        <DateStrip days={daysOf(week)} tasksByDay={byDay} selected={date} />
      </div>

      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-start justify-between gap-4 px-4 pt-4 pb-3">
          {weekTasks.data ? (
            <Headline counts={countByStatus(dayTasks)} period={isToday ? 'today' : 'this day'} />
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-56" />
            </div>
          )}
          <Button size="sm" onClick={() => actions.create(date)}>
            <Plus />
            Add task
          </Button>
        </div>

        <div className="px-1 pb-2 sm:px-2">
          {weekTasks.isPending ? <TaskListSkeleton /> : null}
          {weekTasks.isError ? (
            <div className="p-2">
              <ErrorState error={weekTasks.error} onRetry={() => void weekTasks.refetch()} />
            </div>
          ) : null}

          {weekTasks.data ? (
            <>
              {open.length > 0 ? (
                <TaskList tasks={open} />
              ) : (
                <EmptyState>
                  {dayTasks.length > 0 ? 'Nothing left for this day.' : 'Nothing planned for this day.'}
                </EmptyState>
              )}

              {overdueTasks.length > 0 ? (
                <div className="mt-3">
                  <h3 className="px-3 pb-1 text-meta font-semibold text-overdue">
                    Overdue <span className="font-normal tabular-nums">({overdueTasks.length})</span>
                  </h3>
                  <TaskList tasks={visibleOverdue} showDate hideOverdueLabel />
                  {overdueTasks.length > visibleOverdue.length || showAllOverdue ? (
                    <button
                      type="button"
                      onClick={() => setShowAllOverdue((value) => !value)}
                      className="rounded-md px-3 py-2 text-meta font-medium text-fg-secondary outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      {showAllOverdue ? 'Show fewer' : `Show all ${overdueTasks.length}`}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <FinishedFold tasks={finished} />
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
