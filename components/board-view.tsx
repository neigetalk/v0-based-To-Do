'use client'

import { type DragEvent, useMemo, useState } from 'react'
import { differenceInHours, format, isBefore } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Archive,
  Ellipsis,
  Flag,
  Image as ImageIcon,
  CheckCircle2,
  Clock3,
  Circle,
  MessageSquare,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus, Priority } from '@/lib/types'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useT } from '@/lib/i18n'
import type { Translations } from '@/lib/i18n'

interface BoardViewProps {
  tasks: Task[]
  onToggleComplete: (id: string) => void
  onOpenDetails: (task: Task) => void
  onChangePriority: (id: string, priority: Priority) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onPermanentDelete: (id: string) => void
  onMoveTaskToStatus: (id: string, status: TaskStatus) => void

  categories: string[]
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
}

const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done']

function getDueDateTone(dueDate: Date, now: Date) {
  if (isBefore(dueDate, now)) return 'overdue'
  const hours = differenceInHours(dueDate, now)
  if (hours <= 24) return 'soon'
  return 'normal'
}

function getStatusLabel(status: TaskStatus, t: Translations) {
  switch (status) {
    case 'To Do': return t.statusToDo
    case 'In Progress': return t.statusInProgress
    case 'Review': return t.statusReview
    case 'Done': return t.statusDone
    default: return status
  }
}

function renderStatusIcon(status: TaskStatus) {
  const commonProps = {
    size: 16,
    className: 'inline-block',
    strokeWidth: 2.2,
  }

  switch (status) {
    case 'In Progress':
      return <Clock3 {...commonProps} className="inline-block text-orange-500" />
    case 'Review':
      return (
        <MessageSquare
          {...commonProps}
          className="inline-block text-[#007AFF]"
        />
      )
    case 'Done':
      return <CheckCircle2 {...commonProps} className="inline-block text-gray-900" />
    default:
      return <Circle {...commonProps} className="inline-block text-gray-400" />
  }
}

export function BoardView({
  tasks,
  onToggleComplete,
  onOpenDetails,
  onChangePriority,
  onArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  onMoveTaskToStatus,
  categories,
  categoryFilter,
  onCategoryFilterChange,
}: BoardViewProps) {
  const hasMounted = useHasMounted()
  const { t } = useT()
  const now = new Date()
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null)

  const filteredTasks = useMemo(() => {
    if (!categoryFilter || categoryFilter === 'All') return tasks
    return tasks.filter((t) => t.category === categoryFilter)
  }, [tasks, categoryFilter])

  const nowMs = now.getTime()

  const tasksByStatus = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>()
    for (const s of STATUSES) map.set(s, [])
    for (const t of filteredTasks) {
      map.get(t.status)?.push(t)
    }
    for (const s of STATUSES) {
      const list = map.get(s) ?? []
      // Closest to the current time first (handles both upcoming and overdue tasks)
      list.sort(
        (a, b) =>
          Math.abs(a.dueDate.getTime() - nowMs) -
          Math.abs(b.dueDate.getTime() - nowMs)
      )
      map.set(s, list)
    }
    return map
  }, [filteredTasks])

  const activeCount = useMemo(
    () => filteredTasks.filter((t) => t.completed).length,
    [filteredTasks]
  )

  const handleDropToStatus = (e: DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return
    onMoveTaskToStatus(id, status)
    setDragOverStatus(null)
  }

  return (
    hasMounted ? (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div className="flex flex-col bg-white/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm min-h-[520px]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t.boardTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {t.boardSubtitle}
            </p>
          </div>

          <div className="w-full sm:w-[260px]">
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="bg-white border-gray-200 text-gray-900 w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t.boardAllCategories}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1">
          <ScrollArea className="h-[540px]">
            <div className="grid grid-cols-1 xl:grid-cols-4 sm:grid-cols-2 gap-4">
              {STATUSES.map((status) => {
                const colTasks = tasksByStatus.get(status) ?? []
                const isOver = dragOverStatus === status

                const columnBorder =
                  status === 'In Progress'
                    ? 'ring-[#4CD964]/40'
                    : status === 'Review'
                      ? 'ring-[#007AFF]/40'
                      : 'ring-gray-200/60'

                return (
                  <div
                    key={status}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropToStatus(e, status)}
                    onDragEnter={() => setDragOverStatus(status)}
                    onDragLeave={() => setDragOverStatus((curr) => (curr === status ? null : curr))}
                    className={cn(
                      'rounded-xl border bg-white/60 p-3',
                      isOver ? `ring-2 ${columnBorder}` : 'border-gray-200/70',
                      'min-h-[220px]'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {getStatusLabel(status, t)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {colTasks.length}
                      </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {colTasks.length === 0 ? (
                        <div className="text-xs text-gray-400 py-6 text-center">
                          {t.boardDropHere}
                        </div>
                      ) : (
                        colTasks.map((task) => {
                          const tone = getDueDateTone(task.dueDate, now)
                          const dueClass =
                            tone === 'overdue'
                              ? 'text-red-600'
                              : tone === 'soon'
                                ? 'text-orange-500'
                                : 'text-gray-500'

                          return (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              draggable
                              onDragStart={(e) => {
                                const dt = (e as unknown as DragEvent).dataTransfer
                                if (!dt) return
                                dt.setData('text/plain', task.id)
                                dt.effectAllowed = 'move'
                              }}
                              className={cn(
                                'group flex items-start gap-3 rounded-lg bg-white/90 p-4 shadow-sm border-l-4 border-gray-200 transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing',
                                task.completed && 'opacity-60'
                              )}
                              style={{
                                borderLeftColor:
                                  task.priority === 'high'
                                    ? '#FF3B30'
                                    : task.priority === 'medium'
                                      ? '#4CD964'
                                      : '#9CA3AF',
                              }}
                            >
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => onToggleComplete(task.id)}
                                className={cn(
                                  'mt-0.5 border-gray-300',
                                  task.completed &&
                                    'bg-[#4CD964] border-[#4CD964] data-[state=checked]:bg-[#4CD964] data-[state=checked]:border-[#4CD964]'
                                )}
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <button
                                    type="button"
                                    onClick={() => onOpenDetails(task)}
                                    className={cn(
                                      'text-left text-sm font-medium text-gray-900 hover:underline underline-offset-2',
                                      task.completed && 'line-through text-gray-500'
                                    )}
                                    title="Open details"
                                    aria-label="Open details"
                                  >
                                    <span className="inline-flex items-center gap-1 min-w-0">
                                      {task.priority === 'high' && (
                                        <Flag className="inline-block size-3.5 text-[#FF3B30]" />
                                      )}
                                      <span className="truncate flex-1">{task.title}</span>
                                      <span
                                        className="inline-flex items-center"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {renderStatusIcon(task.status)}
                                      </span>
                                      {task.imageDataUrl && (
                                        <ImageIcon className="inline-block size-4 text-gray-500 align-[-2px]" />
                                      )}
                                    </span>
                                  </button>

                                  {/* Stop portal click events from bubbling to the title button */}
                                  <div onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        className="inline-flex shrink-0 items-center justify-center size-8 rounded-md text-gray-500 hover:text-[#4CD964] hover:bg-gray-100 transition-colors"
                                        aria-label="Task actions"
                                        title="Actions"
                                      >
                                        <Ellipsis className="size-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-white">
                                      <DropdownMenuItem
                                        onSelect={() => onOpenDetails(task)}
                                        className="cursor-pointer"
                                      >
                                        {t.openDetails}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />

                                      {/* Priority sub-menu */}
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="cursor-pointer">
                                          <Flag className="size-4 mr-2 text-gray-500" />
                                          {t.menuPriority}
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="bg-white">
                                          <DropdownMenuItem
                                            onSelect={() => onChangePriority(task.id, 'high')}
                                            className={cn('cursor-pointer', task.priority === 'high' && 'font-semibold')}
                                          >
                                            <Flag className="size-4 mr-2 text-[#FF3B30]" />
                                            {t.priorityHigh}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onSelect={() => onChangePriority(task.id, 'medium')}
                                            className={cn('cursor-pointer', task.priority === 'medium' && 'font-semibold')}
                                          >
                                            <Flag className="size-4 mr-2 text-[#4CD964]" />
                                            {t.priorityMedium}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onSelect={() => onChangePriority(task.id, 'low')}
                                            className={cn('cursor-pointer', task.priority === 'low' && 'font-semibold')}
                                          >
                                            <Flag className="size-4 mr-2 text-gray-400" />
                                            {t.priorityLow}
                                          </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>

                                      <DropdownMenuSeparator />

                                      {!task.isDeleted && !task.isArchived && (
                                        <DropdownMenuItem
                                          onSelect={() => onArchive(task.id)}
                                          className="cursor-pointer"
                                        >
                                          <Archive className="size-4 text-[#4CD964]" />
                                          {t.menuArchive}
                                        </DropdownMenuItem>
                                      )}

                                      {!task.isDeleted && task.isArchived && (
                                        <DropdownMenuItem
                                          onSelect={() => onRestore(task.id)}
                                          className="cursor-pointer"
                                        >
                                          <RotateCcw className="size-4 text-[#4CD964]" />
                                          {t.menuRestore}
                                        </DropdownMenuItem>
                                      )}

                                      {!task.isDeleted && (
                                        <DropdownMenuItem
                                          onSelect={() => onDelete(task.id)}
                                          className="cursor-pointer"
                                        >
                                          <Trash2 className="size-4 text-[#4CD964]" />
                                          {t.menuDelete}
                                        </DropdownMenuItem>
                                      )}

                                      {task.isDeleted && (
                                        <>
                                          <DropdownMenuItem
                                            onSelect={() => onRestore(task.id)}
                                            className="cursor-pointer"
                                          >
                                            <RotateCcw className="size-4 text-[#4CD964]" />
                                            {t.menuRestore}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            variant="destructive"
                                            onSelect={() => onPermanentDelete(task.id)}
                                            className="cursor-pointer"
                                          >
                                            <Trash2 className="size-4" />
                                            {t.menuDeletePermanently}
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  </div>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                    {task.category}
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                  <span className="text-gray-500">
                                    {t.labelDue}: <span className={cn('font-medium', dueClass)}>{format(task.dueDate, 'MMM d, p')}</span>
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="bg-white/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-900">Due status</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Normal</span>
            <span className="font-medium text-gray-500">Gray</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Within 24 hours</span>
            <span className="font-medium text-orange-500">Orange</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Overdue</span>
            <span className="font-medium text-red-600">Red</span>
          </div>
        </div>
      </div>
    </div>
    ) : null
  )
}

