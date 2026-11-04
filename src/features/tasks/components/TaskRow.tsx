import { Ban, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { animate, motion, useMotionValue, type PanInfo } from 'motion/react'
import { useRef, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/hooks'
import { useTaskActions } from '../task-actions'
import type { Task } from '../types'
import { TaskMeta } from './badges'

const DELETE_WIDTH = 84

export function TaskRow({
  task,
  showDate = false,
  hideOverdueLabel = false,
}: {
  task: Task
  showDate?: boolean
  hideOverdueLabel?: boolean
}) {
  const actions = useTaskActions()
  const isMobile = useIsMobile()
  const x = useMotionValue(0)
  const [revealed, setRevealed] = useState(false)
  const dragged = useRef(false)

  const skipped = task.status === 'SKIPPED'
  const completed = task.status === 'COMPLETED'

  const settle = (open: boolean) => {
    setRevealed(open)
    void animate(x, open ? -DELETE_WIDTH : 0, {
      type: 'spring',
      stiffness: 500,
      damping: 40,
    })
  }

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    settle(info.offset.x < -DELETE_WIDTH / 2 || info.velocity.x < -400)
    // A drag ends with a click on the row; swallow it so the panel doesn't open.
    setTimeout(() => (dragged.current = false), 0)
  }

  const onOpen = () => {
    if (dragged.current) return
    if (revealed) settle(false)
    else actions.view(task)
  }

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-md"
    >
      {isMobile ? (
        <button
          type="button"
          tabIndex={revealed ? 0 : -1}
          onClick={() => actions.deleteNow(task)}
          className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-md bg-danger font-medium text-white"
          style={{ width: DELETE_WIDTH }}
        >
          Delete
        </button>
      ) : null}

      <motion.div
        drag={isMobile ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: -DELETE_WIDTH, right: 0 }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={onDragEnd}
        style={{ x }}
        className="group relative flex min-h-[52px] items-start gap-3 rounded-md bg-surface px-3 py-2.5 hover:bg-canvas"
      >
        <div className="relative z-10 flex h-[22px] items-center">
          {skipped ? (
            <Ban className="size-[18px] text-fg-muted" aria-label="Skipped" />
          ) : (
            <Checkbox
              aria-label={completed ? `Mark “${task.title}” as in progress` : `Mark “${task.title}” as completed`}
              checked={completed}
              onCheckedChange={(checked) => actions.setStatus(task, checked ? 'COMPLETED' : 'IN_PROGRESS')}
            />
          )}
        </div>

        <div className={cn('min-w-0 flex-1', skipped && 'opacity-75')}>
          <button
            type="button"
            onClick={onOpen}
            className={cn(
              'block w-full text-left text-[15px] leading-[22px] break-words outline-none after:absolute after:inset-0 focus-visible:underline',
              completed || skipped ? 'text-fg-muted' : 'text-fg',
              completed && 'line-through decoration-fg-faint',
            )}
          >
            {task.title}
          </button>
          <TaskMeta
            task={task}
            showDate={showDate}
            hideOverdueLabel={hideOverdueLabel}
            className={cn('mt-0.5', (completed || skipped) && 'text-fg-muted')}
          />
        </div>

        {isMobile ? null : <RowMenu task={task} />}
      </motion.div>
    </motion.li>
  )
}

function RowMenu({ task }: { task: Task }) {
  const actions = useTaskActions()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Task actions"
        className="relative z-10 -mr-1 rounded-md p-1 text-fg-muted opacity-0 outline-none group-hover:opacity-100 hover:bg-neutral-bg hover:text-fg focus-visible:opacity-100 data-[state=open]:opacity-100"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => actions.edit(task)}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        {task.status === 'SKIPPED' ? (
          <DropdownMenuItem onSelect={() => actions.setStatus(task, 'IN_PROGRESS')}>
            <RotateCcw />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => actions.skip(task)}>
            <Ban />
            Skip
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => actions.confirmDelete(task)}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
