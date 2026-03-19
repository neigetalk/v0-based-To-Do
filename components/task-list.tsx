'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { CalendarDays, ListTodo } from 'lucide-react'
import { Task, Priority } from '@/lib/types'
import { TaskCard } from './task-card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TaskListProps {
  selectedDate: Date
  tasks: Task[]
  onToggleComplete: (id: string) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onDrop: (date: Date) => void
  onOpenDetails: (task: Task) => void
  onChangePriority: (id: string, priority: Priority) => void
  mode: 'calendar' | 'board'
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onPermanentDelete: (id: string) => void
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMMM d')
}

export function TaskList({
  selectedDate,
  tasks,
  onToggleComplete,
  onDragStart,
  onDragEnd,
  onDrop,
  onOpenDetails,
  onChangePriority,
  mode,
  onArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
}: TaskListProps) {
  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-white/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm"
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(selectedDate)}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h2
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-gray-900"
          >
            {getDateLabel(selectedDate)}
          </motion.h2>
          <p className="text-sm text-gray-500 mt-1">
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ListTodo className="size-4" />
          <span>
            {completedCount}/{totalCount} completed
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-gray-400"
          >
            <CalendarDays className="size-12 mb-4 opacity-50" />
            <p className="text-sm">No tasks for this date</p>
            <p className="text-xs mt-1">Click the + button to add a task</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onOpenDetails={onOpenDetails}
                  onChangePriority={onChangePriority}
                  mode={mode}
                  onArchive={onArchive}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onPermanentDelete={onPermanentDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </motion.div>
  )
}
