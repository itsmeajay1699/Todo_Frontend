import { zodResolver } from '@hookform/resolvers/zod'
import { addHours, format, isToday, setHours, setMinutes, startOfDay, startOfHour } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import { FieldError, Input, Label, Textarea } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Segmented } from '@/components/ui/segmented'
import { cn } from '@/lib/cn'
import { formatTime, WEEK_OPTIONS } from '@/lib/dates'
import type { CreateTaskInput, Task } from '../types'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Keep the title under 200 characters'),
  description: z.string().max(2000, 'Keep the description under 2000 characters'),
  date: z.date({ error: 'Pick a date' }),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time'),
  priority: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']),
})

type FormValues = z.infer<typeof schema>

const priorityOptions: { value: FormValues['priority']; label: string }[] = [
  { value: 'NONE', label: 'None' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

type TaskFormProps = {
  task?: Task
  defaultDate?: Date
  submitLabel: string
  onSubmit: (input: CreateTaskInput) => Promise<unknown>
  onCancel: () => void
}

export function TaskForm({ task, defaultDate, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: task ? valuesFromTask(task) : emptyValues(defaultDate),
  })

  const submit = handleSubmit(async ({ title, description, date, time, priority }) => {
    const [hours, minutes] = time.split(':').map(Number)
    // The mutation hook already shows a toast on failure; the form just stays open.
    await onSubmit({
      title,
      description: description.trim() || null,
      dueAt: setMinutes(setHours(date, hours), minutes).toISOString(),
      priority: priority === 'NONE' ? null : priority,
    }).catch(() => undefined)
  })

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <DialogBody className="space-y-4">
        <div>
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            autoFocus
            placeholder="What needs doing?"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div>
          <Label htmlFor="task-description">
            Description <span className="font-normal text-fg-muted">(optional)</span>
          </Label>
          <Textarea id="task-description" rows={3} aria-invalid={!!errors.description} {...register('description')} />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="grid grid-cols-[1fr_120px] gap-3">
          <div>
            <Label htmlFor="task-date">Due date</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      id="task-date"
                      type="button"
                      aria-invalid={!!errors.date}
                      className={cn(
                        'flex h-9 w-full items-center gap-2 rounded-md border border-border bg-surface px-3 text-left outline-none',
                        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 aria-invalid:border-danger',
                      )}
                    >
                      <CalendarDays className="size-4 text-fg-muted" />
                      {field.value ? format(field.value, 'EEE, d MMM yyyy') : 'Pick a date'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <DayPicker
                      mode="single"
                      required
                      selected={field.value}
                      defaultMonth={field.value}
                      weekStartsOn={WEEK_OPTIONS.weekStartsOn}
                      showOutsideDays
                      onSelect={(date) => {
                        field.onChange(date)
                        setPickerOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError message={errors.date?.message} />
          </div>
          <div>
            <Label htmlFor="task-time">Due time</Label>
            <Input id="task-time" type="time" aria-invalid={!!errors.time} {...register('time')} />
            <FieldError message={errors.time?.message} />
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-meta font-medium text-fg-secondary">Priority</span>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Segmented
                label="Priority"
                value={field.value}
                onChange={field.onChange}
                options={priorityOptions}
                className="flex w-full"
              />
            )}
          />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

function valuesFromTask(task: Task): FormValues {
  const due = new Date(task.dueAt)
  return {
    title: task.title,
    description: task.description ?? '',
    date: startOfDay(due),
    time: formatTime(due),
    priority: task.priority ?? 'NONE',
  }
}

function emptyValues(defaultDate: Date | undefined): FormValues {
  const date = defaultDate ?? new Date()
  let time = '09:00'
  if (isToday(date)) {
    const nextHour = addHours(startOfHour(new Date()), 1)
    time = isToday(nextHour) ? formatTime(nextHour) : '23:59'
  }
  return {
    title: '',
    description: '',
    date: startOfDay(date),
    time,
    priority: 'NONE',
  }
}
