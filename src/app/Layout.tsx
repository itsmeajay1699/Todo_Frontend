import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { matchPath, Outlet, useLocation } from 'react-router'
import { AuthDialog, type AuthMode } from '@/features/auth/AuthDialog'
import { SearchDialog } from '@/features/tasks/components/SearchDialog'
import { useTaskActions } from '@/features/tasks/task-actions'
import { dayRange, defaultDateIn, monthRange, parseDateKey, parseMonthKey, weekRange } from '@/lib/dates'
import { Header } from './Header'

export function Layout() {
  const { pathname } = useLocation()
  const actions = useTaskActions()
  const [searchOpen, setSearchOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const addTask = () => actions.create(defaultDateFor(pathname))

  return (
    <div className="min-h-dvh">
      <Header
        onSearch={() => setSearchOpen(true)}
        onAddTask={addTask}
        onLogIn={() => setAuthMode('login')}
        onSignUp={() => setAuthMode('signup')}
      />

      <main className="mx-auto max-w-5xl px-4 pt-5 pb-24 sm:px-6 sm:pt-6">
        <Outlet />
      </main>

      <button
        type="button"
        onClick={addTask}
        aria-label="Add task"
        className="fixed right-4 bottom-5 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-overlay outline-none hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-primary/30 sm:hidden"
      >
        <Plus className="size-5" />
      </button>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <AuthDialog mode={authMode} onModeChange={setAuthMode} />
    </div>
  )
}

function defaultDateFor(pathname: string) {
  const day = parseDateKey(matchPath('/day/:date', pathname)?.params.date)
  if (day) return dayRange(day).from
  const month = parseMonthKey(matchPath('/month/:month', pathname)?.params.month)
  if (month) return defaultDateIn(monthRange(month))
  const week = parseDateKey(matchPath('/week/:date', pathname)?.params.date)
  return defaultDateIn(weekRange(week ?? new Date()))
}
