import { addDays, startOfDay } from 'date-fns'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { dateFromKey, toDateKey } from './dates'

function subscribeToMidnight(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>
  const schedule = () => {
    const untilMidnight = addDays(startOfDay(new Date()), 1).getTime() - Date.now()
    timer = setTimeout(() => {
      onChange()
      schedule()
    }, untilMidnight + 50)
  }
  schedule()
  return () => clearTimeout(timer)
}

const todayKey = () => toDateKey(new Date())

/** Start of today, stable across renders; rolls over at midnight so "today" highlights stay right. */
export function useToday() {
  const key = useSyncExternalStore(subscribeToMidnight, todayKey, todayKey)
  return useMemo(() => dateFromKey(key), [key])
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useIsMobile = () => useMediaQuery('(max-width: 639px)')

export function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
