import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

type PeriodNavProps = {
  title: string
  prevTo: string
  nextTo: string
  todayTo: string
  isCurrent: boolean
  prevLabel: string
  nextLabel: string
}

export function PeriodNav({ title, prevTo, nextTo, todayTo, isCurrent, prevLabel, nextLabel }: PeriodNavProps) {
  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost" size="icon">
        <Link to={prevTo} aria-label={prevLabel}>
          <ChevronLeft />
        </Link>
      </Button>
      <h2 className="min-w-0 px-1 text-lg font-semibold tabular-nums sm:text-xl">{title}</h2>
      <Button asChild variant="ghost" size="icon">
        <Link to={nextTo} aria-label={nextLabel}>
          <ChevronRight />
        </Link>
      </Button>
      {isCurrent ? null : (
        <Button asChild size="sm" className="ml-2">
          <Link to={todayTo}>Today</Link>
        </Button>
      )}
    </div>
  )
}
