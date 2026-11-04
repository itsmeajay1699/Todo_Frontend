import { ProgressBar } from '@/components/ui/progress'
import { cn } from '@/lib/cn'
import { progressOf, type StatusCounts } from '../utils'

type HeadlineProps = {
  counts: StatusCounts
  period: 'today' | 'this day' | 'this week' | 'this month'
  className?: string
}

export function Headline({ counts, period, className }: HeadlineProps) {
  const { inProgress: left, completed, skipped } = counts
  const total = left + completed + skipped
  const progress = progressOf(completed, left)

  let title = 'No tasks'
  if (total > 0 && left === 0) title = 'All done'
  else if (left > 0) {
    const noun = period === 'today' || period === 'this day' ? (left === 1 ? ' task' : ' tasks') : ''
    title = `${left}${noun} left ${period === 'this day' ? '' : period}`.trim()
  }

  return (
    <div className={className}>
      <p className={cn('text-xl leading-7 font-semibold', total > 0 && left === 0 && 'text-success')}>{title}</p>
      {total > 0 ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-meta text-fg-secondary">
          <span className="tabular-nums">
            {completed} completed
            {skipped > 0 ? ` · ${skipped} skipped` : ''}
          </span>
          <span className="flex items-center gap-2">
            <ProgressBar value={progress} className="w-32 sm:w-40" />
            {progress === null ? null : <span className="font-medium tabular-nums">{progress}%</span>}
          </span>
        </div>
      ) : null}
    </div>
  )
}
