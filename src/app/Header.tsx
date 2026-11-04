import { Plus, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { AccountMenu } from '@/features/auth/AccountMenu'
import { cn } from '@/lib/cn'
import { useToday } from '@/lib/hooks'
import { toDateKey, toMonthKey } from '@/lib/dates'

type HeaderProps = {
  onSearch: () => void
  onAddTask: () => void
  onLogIn: () => void
  onSignUp: () => void
}

export function Header({ onSearch, onAddTask, onLogIn, onSignUp }: HeaderProps) {
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto grid h-14 max-w-5xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
        <Link to="/week" className="flex items-center gap-2 justify-self-start font-semibold">
          <span className="flex size-6 items-center justify-center rounded-md bg-fg text-white">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
              <path
                d="m3.5 8.5 3 3 6-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Tasks
        </Link>

        <ViewTabs className="hidden sm:flex" />

        <div className="flex items-center gap-1.5 justify-self-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearch}
            aria-label="Search tasks"
            title={`Search (${isMac ? '⌘' : 'Ctrl'}+K)`}
          >
            <Search />
          </Button>
          <Button variant="primary" size="sm" onClick={onAddTask} className="hidden sm:inline-flex">
            <Plus />
            Add task
          </Button>
          <div className="ml-1.5">
            <AccountMenu onLogIn={onLogIn} onSignUp={onSignUp} />
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 sm:hidden">
        <ViewTabs className="flex w-full" />
      </div>
    </header>
  )
}

function ViewTabs({ className }: { className?: string }) {
  const { pathname } = useLocation()
  const today = useToday()
  const tabs = [
    { to: `/day/${toDateKey(today)}`, section: '/day', label: 'Day' },
    { to: '/week', section: '/week', label: 'Week' },
    { to: `/month/${toMonthKey(today)}`, section: '/month', label: 'Month' },
  ]

  return (
    <nav aria-label="Views" className={cn('rounded-md border border-border bg-neutral-bg p-0.5', className)}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.section)
        return (
          <Link
            key={tab.section}
            to={tab.to}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-8 flex-1 items-center justify-center rounded-[5px] px-4 text-sm font-medium text-fg-secondary transition-colors outline-none',
              'hover:text-fg focus-visible:ring-2 focus-visible:ring-primary/30',
              active && 'bg-surface font-semibold text-primary shadow-[0_0_0_1px_var(--color-border)]',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
