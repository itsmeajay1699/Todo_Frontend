import type { SummaryParams, TaskFilters } from '../types'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => ['tasks', 'list'] as const,
  list: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
  summaries: () => ['tasks', 'summary'] as const,
  summary: (params: SummaryParams) => ['tasks', 'summary', params] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
}
