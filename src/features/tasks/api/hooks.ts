import { useMutation, useQuery, useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { timeZone, toDateKey, weekStart } from '@/lib/dates'
import type {
  CreateTaskInput,
  SummaryParams,
  SummaryRow,
  Task,
  TaskFilters,
  TaskStatus,
  UpdateTaskInput,
} from '../types'
import { progressOf } from '../utils'
import { taskKeys } from './keys'

export function useTasks(filters: TaskFilters, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => api<Task[]>('/tasks', { query: filters }),
    enabled,
  })
}

export function useTaskSummary(params: SummaryParams) {
  return useQuery({
    queryKey: taskKeys.summary(params),
    queryFn: () =>
      api<SummaryRow[]>('/tasks/summary', {
        query: { ...params, tz: timeZone },
      }),
  })
}

export function useTask(id: string | null, placeholder?: Task) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: () => api<Task>(`/tasks/${id}`),
    enabled: id !== null,
    placeholderData: placeholder,
  })
}

const showError = (error: Error) => toast.error(error.message)

function useInvalidateTasks() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => api<Task>('/tasks', { method: 'POST', body: input }),
    onError: showError,
    onSettled: invalidate,
  })
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTaskInput & { id: string }) =>
      api<Task>(`/tasks/${id}`, { method: 'PATCH', body: input }),
    onError: showError,
    onSettled: invalidate,
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) })
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.lists() }, (tasks) => tasks?.filter((t) => t.id !== id))
    },
    onError: showError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

type StatusChange = { task: Task; status: TaskStatus }

export function useSetTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ task, status }: StatusChange) =>
      api<Task>(`/tasks/${task.id}`, { method: 'PATCH', body: { status } }),
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const snapshot = queryClient.getQueriesData({ queryKey: taskKeys.all })
      applyStatusChange(queryClient, change)
      return { snapshot }
    },
    onError: (error, _change, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
      showError(error)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

const countField = {
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
} as const

function applyStatusChange(queryClient: QueryClient, { task, status }: StatusChange) {
  const next: Task = { ...task, status, skipReason: null }

  for (const [key, tasks] of queryClient.getQueriesData<Task[]>({
    queryKey: taskKeys.lists(),
  })) {
    if (!tasks) continue
    const filters = (key as QueryKey)[2] as TaskFilters
    const updated = tasks
      .map((t) => (t.id === task.id ? next : t))
      .filter((t) => t.id !== task.id || !filters.status || filters.status === status)
    queryClient.setQueryData(key, updated)
  }

  queryClient.setQueryData<Task>(taskKeys.detail(task.id), (current) => current && next)

  const due = new Date(task.dueAt)
  for (const [key, rows] of queryClient.getQueriesData<SummaryRow[]>({
    queryKey: taskKeys.summaries(),
  })) {
    if (!rows) continue
    const { groupBy } = (key as QueryKey)[2] as SummaryParams
    const start = toDateKey(groupBy === 'week' ? weekStart(due) : startOfDay(due))
    queryClient.setQueryData(
      key,
      rows.map((row) => (row.start === start ? moveCount(row, task.status, status) : row)),
    )
  }
}

function moveCount(row: SummaryRow, from: TaskStatus, to: TaskStatus): SummaryRow {
  const next = { ...row }
  next[countField[from]] = Math.max(0, next[countField[from]] - 1)
  next[countField[to]] += 1
  next.progress = progressOf(next.completed, next.inProgress)
  return next
}
