import { createContext, useContext } from 'react'
import type { Task, TaskStatus } from './types'

export type TaskActions = {
  create: (defaultDate?: Date) => void
  view: (task: Task) => void
  edit: (task: Task) => void
  skip: (task: Task) => void
  setStatus: (task: Task, status: TaskStatus) => void
  confirmDelete: (task: Task) => void
  deleteNow: (task: Task) => void
}

export const TaskActionsContext = createContext<TaskActions | null>(null)

export function useTaskActions() {
  const actions = useContext(TaskActionsContext)
  if (!actions) throw new Error('useTaskActions must be used inside TaskActionsProvider')
  return actions
}
