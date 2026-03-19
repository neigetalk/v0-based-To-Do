'use client'

import { useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MonthlyCalendarProps {
  currentMonth: Date
  selectedDate: Date
  tasks: Task[]
  onSelectDate: (date: Date) => void
  onMonthChange: (date: Date) => void
  onDrop: (date: Date) => void
  isDragging: boolean
}

export function MonthlyCalendar({
  currentMonth,
  selectedDate,
  tasks,
  onSelectDate,
  onMonthChange,
  onDrop,
  isDragging,
}: MonthlyCalendarProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(task.date, date))
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-white/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold text-gray-900"
        >
          {format(currentMonth, 'MMMM yyyy')}
        </motion.h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onMonthChange(new Date())
              onSelectDate(new Date())
            }}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day, index) => {
            const dayTasks = getTasksForDate(day)
            const hasHigh = dayTasks.some((t) => t.priority === 'high' && !t.completed)
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isTodayDate = isToday(day)

            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => onSelectDate(day)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(day)}
                className={cn(
                  'relative flex flex-col items-center justify-start p-1 rounded-lg transition-all min-h-[60px] md:min-h-[80px]',
                  isCurrentMonth
                    ? 'text-gray-900 hover:bg-gray-100'
                    : 'text-gray-400 hover:bg-gray-50',
                  isSelected && 'bg-[#4CD964]/10 ring-2 ring-[#4CD964]',
                  isTodayDate && !isSelected && 'bg-[#4CD964]/20',
                  isDragging && 'hover:ring-2 hover:ring-[#007AFF] hover:ring-dashed'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                    isTodayDate && 'bg-[#4CD964] text-white'
                  )}
                >
                  {format(day, 'd')}
                </span>

                {dayTasks.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          'size-1.5 rounded-full',
                          task.completed
                            ? 'bg-gray-300'
                            : task.priority === 'high'
                            ? 'bg-[#FF3B30]'
                            : task.priority === 'medium'
                            ? 'bg-[#4CD964]'
                            : 'bg-gray-400'
                        )}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-gray-400">
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {hasHigh && !isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 size-2 bg-[#FF3B30] rounded-full"
                  />
                )}
              </motion.button>
            )
        })}
      </div>
    </motion.div>
  )
}
