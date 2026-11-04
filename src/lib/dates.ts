import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameMonth,
  isSameYear,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export const WEEK_OPTIONS = { weekStartsOn: 1 } as const

export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

/** `to` is exclusive, matching the API. */
export type DateRange = { from: Date; to: Date }

export const weekStart = (date: Date) => startOfWeek(date, WEEK_OPTIONS)

export function weekRange(date: Date): DateRange {
  const from = weekStart(date)
  return { from, to: addWeeks(from, 1) }
}

export function dayRange(date: Date): DateRange {
  const from = startOfDay(date)
  return { from, to: addDays(from, 1) }
}

export function monthRange(date: Date): DateRange {
  const from = startOfMonth(date)
  return { from, to: addMonths(from, 1) }
}

export function monthGridRange(month: Date): DateRange {
  const from = weekStart(startOfMonth(month))
  return { from, to: addDays(from, 42) }
}

export function inRange(date: Date, range: DateRange) {
  return date >= range.from && date < range.to
}

export function rangeQuery(range: DateRange) {
  return { from: range.from.toISOString(), to: range.to.toISOString() }
}

export function daysOf(range: DateRange) {
  const days: Date[] = []
  for (let d = range.from; d < range.to; d = addDays(d, 1)) days.push(d)
  return days
}

export const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd')
export const toMonthKey = (date: Date) => format(date, 'yyyy-MM')

export const dateFromKey = (key: string) => parse(key, 'yyyy-MM-dd', new Date())

export function parseDateKey(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = parse(value, 'yyyy-MM-dd', new Date())
  return isValid(date) ? date : null
}

export function parseMonthKey(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null
  const date = parse(value, 'yyyy-MM', new Date())
  return isValid(date) ? date : null
}

export function formatWeekRange(start: Date, today: Date) {
  const end = addDays(start, 6)
  const endLabel = format(end, isSameYear(end, today) ? 'd MMM' : 'd MMM yyyy')
  if (!isSameYear(start, end)) return `${format(start, 'd MMM yyyy')} – ${endLabel}`
  if (!isSameMonth(start, end)) return `${format(start, 'd MMM')} – ${endLabel}`
  return `${format(start, 'd')} – ${endLabel}`
}

export const formatTime = (date: Date) => format(date, 'HH:mm')

export function defaultDateIn(range: DateRange, now = new Date()) {
  return inRange(now, range) ? startOfDay(now) : range.from
}
