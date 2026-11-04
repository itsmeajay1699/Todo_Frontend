import { toDateKey } from '@/lib/dates'
import type { Task, TaskStatus } from './types'

export type StatusCounts = {
  inProgress: number
  completed: number
  skipped: number
}

export function countByStatus(tasks: { status: TaskStatus }[]): StatusCounts {
  const counts = { inProgress: 0, completed: 0, skipped: 0 }
  for (const { status } of tasks) {
    if (status === 'IN_PROGRESS') counts.inProgress++
    else if (status === 'COMPLETED') counts.completed++
    else counts.skipped++
  }
  return counts
}

// Floor, not round: 100% must mean nothing is left open. Matches the server.
export function progressOf(completed: number, inProgress: number) {
  const counted = completed + inProgress
  return counted === 0 ? null : Math.floor((completed / counted) * 100)
}

export function isOverdue(task: Task) {
  return task.status === 'IN_PROGRESS' && new Date(task.dueAt).getTime() < Date.now()
}

export function splitFinished(tasks: Task[]) {
  const open: Task[] = []
  const finished: Task[] = []
  for (const task of tasks) (task.status === 'IN_PROGRESS' ? open : finished).push(task)
  return { open, finished }
}

export function groupByDay(tasks: Task[]) {
  const groups = new Map<string, Task[]>()
  for (const task of tasks) {
    const key = toDateKey(new Date(task.dueAt))
    const group = groups.get(key)
    if (group) group.push(task)
    else groups.set(key, [task])
  }
  return groups
}

const statusOrder: Record<TaskStatus, number> = {
  IN_PROGRESS: 0,
  COMPLETED: 1,
  SKIPPED: 2,
}

export function openFirst(tasks: Task[]) {
  return [...tasks].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.dueAt.localeCompare(b.dueAt))
}

export const statusColor: Record<TaskStatus, string> = {
  IN_PROGRESS: 'bg-primary',
  COMPLETED: 'bg-success-fill',
  SKIPPED: 'bg-fg-faint',
}
