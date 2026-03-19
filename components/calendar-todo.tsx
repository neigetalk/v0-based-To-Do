'use client'

import { useState, useMemo } from 'react'
import { isSameDay } from 'date-fns'
import { Plus, Settings2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { MonthlyCalendar } from './monthly-calendar'
import { TaskList } from './task-list'
import { AddTaskDialog } from './add-task-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BoardView } from '@/components/board-view'
import { TaskDetailDialog } from '@/components/task-detail-dialog'
import { ManageCategoriesDialog } from '@/components/manage-categories-dialog'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useTasks } from '@/hooks/use-tasks'

export function CalendarTodo() {
  const hasMounted = useHasMounted()

  const {
    tasks,
    loading,
    categories,
    handleToggleComplete,
    handleUpdateTask,
    handleChangePriority,
    handleArchive,
    handleDelete,
    handleRestore,
    handlePermanentDelete,
    handleAddTask,
    handleMoveTaskToStatus,
    handleDrop,
    handleAddCategory,
    handleRenameCategory,
    handleDeleteCategory,
  } = useTasks()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'board'>('calendar')
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [taskScope, setTaskScope] = useState<'active' | 'archived' | 'trash'>('active')
  const [boardCategoryFilter, setBoardCategoryFilter] = useState<string>('All')

  const scopedTasks = useMemo(() => {
    if (taskScope === 'archived') return tasks.filter((t) => !t.isDeleted && t.isArchived)
    if (taskScope === 'trash') return tasks.filter((t) => t.isDeleted)
    return tasks.filter((t) => !t.isDeleted && !t.isArchived)
  }, [tasks, taskScope])

  const selectedDateTasks = useMemo(() => {
    return scopedTasks
      .filter((task) => isSameDay(task.date, selectedDate))
      .sort((a, b) => {
        const startDiff = a.startDate.getTime() - b.startDate.getTime()
        if (startDiff !== 0) return startDiff
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }, [scopedTasks, selectedDate])

  const detailTask = useMemo(
    () => tasks.find((t) => t.id === detailTaskId) ?? null,
    [tasks, detailTaskId]
  )

  const onDrop = (targetDate: Date) =>
    handleDrop(targetDate, draggingTaskId).then(() => setDraggingTaskId(null))

  if (!hasMounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5E5E5] to-[#D3D3D3] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl md:text-3xl font-bold text-gray-900"
              >
                Calendar Todo
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-1"
              >
                Switch between Calendar and Board views
              </motion.p>
            </div>

            <div className="flex items-center gap-3">
              {/* Manage categories button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCategoryDialogOpen(true)}
                className="border-gray-300 text-gray-700 hover:bg-white/70 gap-1.5"
              >
                <Settings2 className="size-4" />
                Categories
              </Button>

              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v === 'board' ? 'board' : 'calendar')}
                className="w-full md:w-auto"
              >
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="calendar" className="flex-1">
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="board" className="flex-1">
                    Board
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="mt-4">
            <Tabs
              value={taskScope}
              onValueChange={(v) => {
                if (v === 'archived' || v === 'trash' || v === 'active') {
                  setTaskScope(v)
                } else {
                  setTaskScope('active')
                }
              }}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
                <TabsTrigger value="trash" className="flex-1">Trash</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Loading tasks…
          </div>
        ) : viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <MonthlyCalendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              tasks={scopedTasks}
              onSelectDate={setSelectedDate}
              onMonthChange={setCurrentMonth}
              onDrop={onDrop}
              isDragging={draggingTaskId !== null}
            />

            <TaskList
              selectedDate={selectedDate}
              tasks={selectedDateTasks}
              onToggleComplete={handleToggleComplete}
              onDragStart={(task) => setDraggingTaskId(task.id)}
              onDragEnd={() => setDraggingTaskId(null)}
              onDrop={onDrop}
              onOpenDetails={(task) => setDetailTaskId(task.id)}
              onChangePriority={handleChangePriority}
              mode="calendar"
              onArchive={handleArchive}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
            />
          </div>
        ) : (
          <BoardView
            tasks={scopedTasks}
            onToggleComplete={handleToggleComplete}
            onOpenDetails={(task) => setDetailTaskId(task.id)}
            onChangePriority={handleChangePriority}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            onMoveTaskToStatus={handleMoveTaskToStatus}
            categories={categories}
            categoryFilter={boardCategoryFilter}
            onCategoryFilterChange={setBoardCategoryFilter}
          />
        )}
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8"
      >
        <Button
          size="lg"
          onClick={() => setIsAddDialogOpen(true)}
          className="size-14 rounded-full bg-[#4CD964] hover:bg-[#4CD964]/90 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="size-6" />
          <span className="sr-only">Add new task</span>
        </Button>
      </motion.div>

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTask={handleAddTask}
        defaultDate={selectedDate}
        categories={categories}
        onAddCategory={handleAddCategory}
        onOpenManageCategories={() => setIsCategoryDialogOpen(true)}
      />

      <TaskDetailDialog
        open={detailTaskId !== null}
        onOpenChange={(open) => setDetailTaskId(open ? detailTaskId : null)}
        task={detailTask}
        onUpdateTask={handleUpdateTask}
        categories={categories}
        onAddCategory={handleAddCategory}
        onOpenManageCategories={() => setIsCategoryDialogOpen(true)}
      />

      <ManageCategoriesDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        categories={categories}
        tasks={tasks}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  )
}
