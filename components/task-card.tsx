'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Archive,
  CheckCircle2,
  Ellipsis,
  Flag,
  GripVertical,
  Image as ImageIcon,
  Clock3,
  RotateCcw,
  Circle,
  MessageSquare,
  Trash2,
} from 'lucide-react'
import { Task, Priority } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onOpenDetails: (task: Task) => void
  onChangePriority: (id: string, priority: Priority) => void
  mode: 'calendar' | 'board'
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onPermanentDelete: (id: string) => void
}

export function TaskCard({
  task,
  onToggleComplete,
  onDragStart,
  onDragEnd,
  onOpenDetails,
  onChangePriority,
  mode,
  onArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
}: TaskCardProps) {
  const { t } = useT()
  const priorityColors = {
    low: 'border-l-gray-400',
    medium: 'border-l-[#4CD964]',
    high: 'border-l-[#FF3B30]',
  }

  const renderStatusIcon = () => {
    const commonProps = { size: 16, className: 'inline-block', strokeWidth: 2.2 }
    switch (task.status) {
      case 'In Progress':
        return <Clock3 {...commonProps} className="inline-block text-orange-500" aria-label="In Progress" />
      case 'Review':
        return <MessageSquare {...commonProps} className="inline-block text-[#007AFF]" aria-label="Review" />
      case 'Done':
        return <CheckCircle2 {...commonProps} className="inline-block text-gray-900" aria-label="Done" />
      default:
        return <Circle {...commonProps} className="inline-block text-gray-400" aria-label="To Do" />
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      draggable
      onDragStart={() => onDragStart(task)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenDetails(task)}
      className={cn(
        'group flex items-center gap-3 rounded-lg bg-white/90 p-4 shadow-sm border-l-4 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
        priorityColors[task.priority],
        task.completed && 'opacity-60'
      )}
    >
      <GripVertical className="size-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className={cn(
            'border-gray-300',
            task.completed &&
              'bg-[#4CD964] border-[#4CD964] data-[state=checked]:bg-[#4CD964] data-[state=checked]:border-[#4CD964]'
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                'text-sm font-medium text-gray-900',
                task.completed && 'line-through text-gray-500'
              )}
              title={task.title}
            >
              <div className="flex items-center gap-1 min-w-0">
                {task.priority === 'high' && (
                  <Flag className="inline-block size-3.5 text-[#FF3B30] shrink-0" />
                )}
                <span className="truncate">{task.title}</span>

                <span
                  className="inline-flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderStatusIcon()}
                </span>

                {task.imageDataUrl && (
                  <ImageIcon className="inline-block size-4 ml-1 text-gray-500 align-[-2px] shrink-0" />
                )}
              </div>
            </div>

            <div className="mt-1 text-xs text-gray-500">
              {mode === 'calendar'
                ? `${t.labelStart}: ${format(task.startDate, 'p')}`
                : `${t.labelDue}: ${format(task.dueDate, 'p')}`}
            </div>
          </div>

          {/* Stop portal click events from bubbling up to the card's onClick */}
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
      </div>

      {/* Priority badge */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            'text-xs font-medium px-2 py-1 rounded-full transition-colors',
            task.priority === 'low' && 'bg-gray-100 text-gray-600',
            task.priority === 'medium' && 'bg-[#4CD964]/10 text-[#4CD964]',
            task.priority === 'high' && 'bg-[#FF3B30]/10 text-[#FF3B30]'
          )}
          title="Priority"
          aria-label="Priority"
        >
          {task.priority === 'high' ? t.priorityHigh : task.priority === 'medium' ? t.priorityMedium : t.priorityLow}
        </span>
      </div>
    </motion.div>
  )
}
