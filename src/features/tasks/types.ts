export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'

export type Task = {
  id: string
  title: string
  description: string | null
  dueAt: string
  priority: Priority | null
  status: TaskStatus
  skipReason: string | null
  createdAt: string
  updatedAt: string
}

export type SummaryRow = {
  start: string
  inProgress: number
  completed: number
  skipped: number
  progress: number | null
}

export type GroupBy = 'week' | 'day'

export type TaskFilters = {
  from?: string
  to?: string
  status?: TaskStatus
  q?: string
}

export type SummaryParams = {
  groupBy: GroupBy
  from?: string
  to?: string
}

export type CreateTaskInput = {
  title: string
  description?: string | null
  dueAt: string
  priority?: Priority | null
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  status?: TaskStatus
  skipReason?: string | null
}
