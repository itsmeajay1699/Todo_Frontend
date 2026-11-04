import type { RawResponse } from '@/lib/api'
import { toDateKey, weekStart } from '@/lib/dates'
import type { User } from '@/features/auth/types'
import type { Priority, SummaryRow, Task, TaskStatus } from '@/features/tasks/types'
import { progressOf } from '@/features/tasks/utils'
import { createSeedTasks } from './seed'

type Account = { user: User; password?: string }
type StoredTask = Task & { userId: string }

const LATENCY_MS = 150
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH']
const STATUSES: TaskStatus[] = ['IN_PROGRESS', 'COMPLETED', 'SKIPPED']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const guest: User = { id: 'guest-1', email: null, isGuest: true }
const accounts = new Map<string, Account>([[guest.id, { user: guest }]])

const { VITE_DEMO_EMAIL: demoEmail, VITE_DEMO_PASSWORD: demoPassword } = import.meta.env
if (demoEmail && demoPassword) {
  const demoUser: User = { id: 'demo-user', email: demoEmail.toLowerCase(), isGuest: false }
  accounts.set(demoUser.id, { user: demoUser, password: demoPassword })
}
let tasks: StoredTask[] = createSeedTasks().map((task) => ({ ...task, userId: guest.id }))
let sessionUserId: string | null = guest.id
let nextId = 1

const ERROR_NAMES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  409: 'Conflict',
}

const ok = (data: unknown, status = 200): RawResponse => ({ status, data: structuredClone(data) })
const noContent = (): RawResponse => ({ status: 204, data: undefined })
const fail = (status: number, message: string | string[]): RawResponse => ({
  status,
  data: { statusCode: status, message, error: ERROR_NAMES[status] ?? 'Error' },
})

export async function handleMockRequest(method: string, url: string, body: unknown): Promise<RawResponse> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
  const { pathname, searchParams } = new URL(url, 'http://mock.local')
  const path = pathname.replace(/^\/api/, '')
  const input = (body ?? {}) as Record<string, unknown>

  if (path.startsWith('/auth/')) return handleAuth(method, path, input)

  const user = currentUser()
  if (!user) return fail(401, 'Not signed in')

  if (path === '/tasks' && method === 'GET') return listTasks(user, searchParams)
  if (path === '/tasks' && method === 'POST') return createTask(user, input)
  if (path === '/tasks/summary' && method === 'GET') return summarize(user, searchParams)

  const match = /^\/tasks\/([^/]+)$/.exec(path)
  if (match) {
    const task = tasks.find((t) => t.id === match[1] && t.userId === user.id)
    if (!task) return fail(404, 'Not found')
    if (method === 'GET') return ok(publicTask(task))
    if (method === 'PATCH') return updateTask(task, input)
    if (method === 'DELETE') {
      tasks = tasks.filter((t) => t !== task)
      return noContent()
    }
  }

  return fail(404, `Cannot ${method} ${pathname}`)
}

function currentUser() {
  return sessionUserId ? (accounts.get(sessionUserId)?.user ?? null) : null
}

function handleAuth(method: string, path: string, input: Record<string, unknown>): RawResponse {
  const user = currentUser()

  if (path === '/auth/me' && method === 'GET') {
    return user ? ok({ user }) : fail(401, 'Not signed in')
  }

  if (path === '/auth/guest' && method === 'POST') {
    if (user) return ok({ user })
    const created: User = { id: `guest-${nextId++}`, email: null, isGuest: true }
    accounts.set(created.id, { user: created })
    sessionUserId = created.id
    return ok({ user: created })
  }

  if (path === '/auth/logout' && method === 'POST') {
    sessionUserId = null
    return noContent()
  }

  const errors = credentialErrors(input)
  if (errors.length) return fail(400, errors)
  const email = String(input.email).trim().toLowerCase()
  const password = String(input.password)
  const existing = [...accounts.values()].find((a) => a.user.email === email)

  if (path === '/auth/signup' && method === 'POST') {
    if (existing) return fail(409, 'An account with this email already exists')
    if (user?.isGuest) {
      const upgraded: User = { ...user, email, isGuest: false }
      accounts.set(user.id, { user: upgraded, password })
      return ok({ user: upgraded }, 201)
    }
    const created: User = { id: `user-${nextId++}`, email, isGuest: false }
    accounts.set(created.id, { user: created, password })
    sessionUserId = created.id
    return ok({ user: created }, 201)
  }

  if (path === '/auth/login' && method === 'POST') {
    if (!existing || existing.password !== password) return fail(401, 'Invalid email or password')
    let mergedTasks = 0
    if (user?.isGuest) {
      for (const task of tasks) {
        if (task.userId === user.id) {
          task.userId = existing.user.id
          mergedTasks++
        }
      }
      accounts.delete(user.id)
    }
    sessionUserId = existing.user.id
    return ok({ user: existing.user, mergedTasks })
  }

  return fail(404, `Cannot ${method} /api${path}`)
}

function credentialErrors(input: Record<string, unknown>) {
  const errors: string[] = []
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.push('email must be a valid email address')
  const password = typeof input.password === 'string' ? input.password : ''
  if (password.length < 8 || password.length > 128) errors.push('password must be between 8 and 128 characters')
  return errors
}

function listTasks(user: User, params: URLSearchParams): RawResponse {
  const status = params.get('status')
  if (status && !STATUSES.includes(status as TaskStatus)) return fail(400, ['status must be a valid status'])

  const q = params.get('q')?.trim().toLowerCase()
  const result = inRange(ownTasks(user), params)
    .filter((t) => !status || t.status === status)
    .filter((t) => !q || t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q))
    .slice(0, 500)
  return ok(result.map(publicTask))
}

function summarize(user: User, params: URLSearchParams): RawResponse {
  const groupBy = params.get('groupBy')
  const errors: string[] = []
  if (groupBy !== 'week' && groupBy !== 'day') errors.push('groupBy must be one of: week, day')
  if (!params.get('tz')) errors.push('tz must be a valid IANA time zone')
  if (errors.length) return fail(400, errors)

  // The mock runs in the browser, so local time stands in for the requested tz.
  const rows = new Map<string, SummaryRow>()
  for (const task of inRange(ownTasks(user), params)) {
    const due = new Date(task.dueAt)
    const start = toDateKey(groupBy === 'week' ? weekStart(due) : due)
    const row = rows.get(start) ?? { start, inProgress: 0, completed: 0, skipped: 0, progress: null }
    if (task.status === 'IN_PROGRESS') row.inProgress++
    else if (task.status === 'COMPLETED') row.completed++
    else row.skipped++
    rows.set(start, row)
  }

  const result = [...rows.values()]
    .map((row) => ({ ...row, progress: progressOf(row.completed, row.inProgress) }))
    .sort((a, b) => a.start.localeCompare(b.start))
  return ok(result)
}

function createTask(user: User, input: Record<string, unknown>): RawResponse {
  const errors = taskFieldErrors(input, true)
  if (errors.length) return fail(400, errors)

  const now = new Date().toISOString()
  const task: StoredTask = {
    id: `task-${nextId++}`,
    userId: user.id,
    title: String(input.title).trim(),
    description: (input.description as string | null | undefined) ?? null,
    dueAt: new Date(String(input.dueAt)).toISOString(),
    priority: (input.priority as Priority | null | undefined) ?? null,
    status: 'IN_PROGRESS',
    skipReason: null,
    createdAt: now,
    updatedAt: now,
  }
  tasks.push(task)
  return ok(publicTask(task), 201)
}

function updateTask(task: StoredTask, input: Record<string, unknown>): RawResponse {
  const errors = taskFieldErrors(input, false)
  if (input.status !== undefined && !STATUSES.includes(input.status as TaskStatus)) {
    errors.push('status must be a valid status')
  }
  if ('skipReason' in input) {
    if (input.status !== 'SKIPPED') errors.push('skipReason is only allowed when status is SKIPPED')
    else if (input.skipReason !== null && (typeof input.skipReason !== 'string' || input.skipReason.length > 200)) {
      errors.push('skipReason must be at most 200 characters')
    }
  }
  if (errors.length) return fail(400, errors)

  if (input.title !== undefined) task.title = String(input.title).trim()
  if (input.description !== undefined) task.description = input.description as string | null
  if (input.dueAt !== undefined) task.dueAt = new Date(String(input.dueAt)).toISOString()
  if (input.priority !== undefined) task.priority = input.priority as Priority | null
  if (input.status !== undefined) {
    task.status = input.status as TaskStatus
    task.skipReason = task.status === 'SKIPPED' ? ((input.skipReason as string | null | undefined) ?? null) : null
  }
  task.updatedAt = new Date().toISOString()
  return ok(publicTask(task))
}

function taskFieldErrors(input: Record<string, unknown>, creating: boolean) {
  const errors: string[] = []
  const { title, description, dueAt, priority } = input

  if (creating || title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 1 || title.length > 200) {
      errors.push('title must be between 1 and 200 characters')
    }
  }
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string' || description.length > 2000) {
      errors.push('description must be at most 2000 characters')
    }
  }
  if (creating || dueAt !== undefined) {
    if (typeof dueAt !== 'string' || Number.isNaN(Date.parse(dueAt))) errors.push('dueAt must be a valid ISO 8601 date')
  }
  if (priority !== undefined && priority !== null && !PRIORITIES.includes(priority as Priority)) {
    errors.push('priority must be one of: LOW, MEDIUM, HIGH')
  }
  return errors
}

function ownTasks(user: User) {
  return tasks.filter((t) => t.userId === user.id).sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

function inRange(list: StoredTask[], params: URLSearchParams) {
  const from = params.get('from')
  const to = params.get('to')
  const fromTime = from ? Date.parse(from) : -Infinity
  const toTime = to ? Date.parse(to) : Infinity
  return list.filter((t) => {
    const due = Date.parse(t.dueAt)
    return due >= fromTime && due < toTime
  })
}

function publicTask({ userId: _userId, ...task }: StoredTask): Task {
  return task
}
