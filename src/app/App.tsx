import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMe } from '@/features/auth/api'
import { TaskActionsProvider } from '@/features/tasks/components/TaskActionsProvider'
import { ApiError } from '@/lib/api'
import { router } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
    },
  },
})

const toasterTheme = {
  '--normal-bg': 'var(--color-surface)',
  '--normal-border': 'var(--color-border)',
  '--normal-text': 'var(--color-fg)',
  '--border-radius': '8px',
  fontFamily: 'var(--font-sans)',
} as CSSProperties

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
      <Toaster position="bottom-right" style={toasterTheme} />
    </QueryClientProvider>
  )
}

function AuthGate() {
  const { data: user, isError, error, refetch } = useMe()

  if (isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5">
          <h1 className="font-semibold">Can't load your tasks</h1>
          <p className="mt-1 text-fg-secondary">{error.message}</p>
          <Button className="mt-4" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
        <span className="size-5 animate-spin rounded-full border-2 border-border border-t-fg-secondary" />
      </div>
    )
  }

  return (
    <TaskActionsProvider>
      <RouterProvider router={router} />
    </TaskActionsProvider>
  )
}
