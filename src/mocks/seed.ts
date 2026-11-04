import { addDays, addWeeks, max, setHours, setMinutes, startOfDay, subDays, subHours } from 'date-fns'
import { weekStart } from '@/lib/dates'
import type { Priority, Task, TaskStatus } from '@/features/tasks/types'

type SeedEntry = {
  week: number
  day: number | 'today'
  time: string
  title: string
  priority?: Priority
  status?: TaskStatus
  description?: string
  skipReason?: string
}

const entries: SeedEntry[] = [
  { week: -3, day: 2, time: '11:00', title: 'Kickoff call with Acme', priority: 'HIGH', status: 'COMPLETED' },
  { week: -3, day: 4, time: '14:00', title: 'Clean up old Jira tickets' },
  { week: -2, day: 0, time: '09:00', title: 'Migrate analytics dashboard', priority: 'MEDIUM', status: 'COMPLETED' },
  { week: -2, day: 2, time: '16:00', title: 'Pay electricity bill', priority: 'LOW', status: 'COMPLETED' },
  { week: -1, day: 1, time: '10:00', title: 'Fix staging deploy pipeline', priority: 'HIGH', status: 'COMPLETED' },
  { week: -1, day: 3, time: '15:00', title: 'Write blog post draft', priority: 'MEDIUM', status: 'COMPLETED' },
  {
    week: -1,
    day: 4,
    time: '12:00',
    title: 'Team offsite logistics',
    status: 'SKIPPED',
    skipReason: 'Offsite moved to January.',
  },
  {
    week: 0,
    day: 0,
    time: '09:30',
    title: 'Sprint planning with design team',
    priority: 'HIGH',
    status: 'COMPLETED',
    description: 'Agree on scope for the settings redesign and split the work into tickets.',
  },
  { week: 0, day: 0, time: '14:00', title: 'Review Q4 hiring plan', priority: 'MEDIUM', status: 'COMPLETED' },
  { week: 0, day: 1, time: '11:00', title: 'Update onboarding checklist', status: 'COMPLETED' },
  {
    week: 0,
    day: 2,
    time: '16:30',
    title: 'Call landlord about the boiler',
    priority: 'LOW',
    status: 'SKIPPED',
    skipReason: 'Landlord fixed it before I called.',
  },
  { week: 0, day: 'today', time: '18:00', title: 'Prepare slides for Friday demo', priority: 'HIGH' },
  { week: 0, day: 3, time: '10:00', title: 'Dentist appointment' },
  {
    week: 0,
    day: 4,
    time: '15:00',
    title: 'Friday product demo',
    priority: 'MEDIUM',
    description: 'Show the new week view and the guest-to-account flow. 20 minutes plus questions.',
  },
  { week: 0, day: 5, time: '10:30', title: 'Grocery run and meal prep', priority: 'LOW' },
  { week: 0, day: 6, time: '19:00', title: 'Plan next week' },
  { week: 1, day: 0, time: '09:00', title: 'Quarterly budget review', priority: 'HIGH' },
  { week: 1, day: 2, time: '13:00', title: 'Lunch with Priya' },
  {
    week: 1,
    day: 3,
    time: '11:00',
    title: 'Renew car insurance',
    priority: 'MEDIUM',
    description: 'Compare the two quotes before the current policy runs out.',
  },
  { week: 1, day: 4, time: '17:30', title: 'Submit expense report', priority: 'LOW' },
  { week: 2, day: 1, time: '10:00', title: 'Performance review self-assessment', priority: 'HIGH' },
  { week: 2, day: 4, time: '18:00', title: 'Book flights for December trip', priority: 'MEDIUM' },
]

export function createSeedTasks(now = new Date()): Task[] {
  const thisWeek = weekStart(now)

  const tasks = entries.map((entry, index): Task => {
    const day = entry.day === 'today' ? startOfDay(now) : addDays(addWeeks(thisWeek, entry.week), entry.day)
    const [hours, minutes] = entry.time.split(':').map(Number)
    const dueAt = setMinutes(setHours(day, hours), minutes)
    const createdAt = subDays(dueAt < now ? dueAt : now, 3)
    return {
      id: `seed-${index + 1}`,
      title: entry.title,
      description: entry.description ?? null,
      dueAt: dueAt.toISOString(),
      priority: entry.priority ?? null,
      status: entry.status ?? 'IN_PROGRESS',
      skipReason: entry.skipReason ?? null,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    }
  })

  // Kept relative to "now" so it is overdue on whatever day the demo runs.
  const overdueAt = max([thisWeek, subHours(now, 20)])
  tasks.push({
    id: 'seed-overdue',
    title: 'Send invoice to Northwind',
    description: 'Includes the October retainer and the two extra workshop days.',
    dueAt: overdueAt.toISOString(),
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    skipReason: null,
    createdAt: subDays(overdueAt, 4).toISOString(),
    updatedAt: subDays(overdueAt, 4).toISOString(),
  })

  return tasks
}
