'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { addDays, addMonths, addWeeks, addYears, startOfDay } from 'date-fns'
import type { Task, Priority, RepeatType } from '@/lib/types'
import { mockTasks } from '@/lib/mock-data'
import {
  saveTask,
  patchTask,
  deleteTask,
  purgeExpiredTrashTasks,
  subscribeToTasks,
  subscribeToCategories,
  saveCategories,
} from '@/lib/firestore'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryList, setCategoryList] = useState<string[]>([])

  // '기본' is always pinned as the first category (calendar-only, hidden from board).
  const DEFAULT_CATEGORY = '기본'
  const seeded = useRef(false)
  const catSeeded = useRef(false)
  const purgeDone = useRef(false)

  // ── Recurring task helpers ────────────────────────────────────────────

  /** Advance a single date by one repeat interval. Handles end-of-month correctly via date-fns. */
  const advanceByRepeat = (d: Date, repeatType: RepeatType, excludeWeekends: boolean): Date => {
    switch (repeatType) {
      case 'daily': {
        let next = addDays(d, 1)
        while (excludeWeekends && (next.getDay() === 0 || next.getDay() === 6)) {
          next = addDays(next, 1)
        }
        return next
      }
      case 'weekly':  return addWeeks(d, 1)
      case 'monthly': return addMonths(d, 1)
      case 'yearly':  return addYears(d, 1)
    }
  }

  /**
   * Creates the next recurrence of a completed recurring task and saves it to
   * Firestore. Should be called after the original task is marked Done.
   */
  const spawnNextRecurrence = useCallback(async (task: Task) => {
    if (!task.isRecurring || !task.repeatType) return
    const rt = task.repeatType
    const skipWe = task.excludeWeekends ?? false

    const nextDate  = startOfDay(advanceByRepeat(task.date, rt, skipWe))
    const nextStart = advanceByRepeat(task.startDate, rt, skipWe)
    const nextDue   = advanceByRepeat(task.dueDate, rt, skipWe)

    const nextTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: task.title,
      category: task.category,
      priority: task.priority,
      status: 'To Do',
      completed: false,
      date: nextDate,
      startDate: nextStart,
      dueDate: nextDue,
      notesHtml: task.notesHtml,
      isRecurring: true,
      repeatType: rt,
      excludeWeekends: task.excludeWeekends,
      originalTaskId: task.originalTaskId ?? task.id,
      isArchived: false,
      isDeleted: false,
    }

    setTasks((prev) => [...prev, nextTask])
    await saveTask(nextTask)
  }, []) // setTasks is stable from useState; task data is passed as parameter

  // ── Real-time task listener ───────────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToTasks(
      async (remoteTasks) => {
        if (remoteTasks.length === 0 && !seeded.current) {
          seeded.current = true
          await Promise.all(mockTasks.map((t) => saveTask(t)))
          return
        }
        seeded.current = true
        setTasks(remoteTasks)
        setLoading(false)
      },
      (err) => {
        console.error('[useTasks] Firestore tasks error:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // ── One-time trash auto-purge (runs once after tasks first load) ──────
  useEffect(() => {
    if (purgeDone.current || loading) return
    purgeDone.current = true
    purgeExpiredTrashTasks().catch((err) =>
      console.error('[useTasks] Trash purge error:', err)
    )
  }, [loading])

  // ── Real-time categories listener ─────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToCategories(
      async (cats) => {
        if (cats.length === 0 && !catSeeded.current) {
          catSeeded.current = true
          const seedCats = Array.from(
            new Set([DEFAULT_CATEGORY, ...mockTasks.map((t) => t.category).filter(Boolean)])
          )
          await saveCategories(seedCats)
          return
        }
        catSeeded.current = true
        setCategoryList(cats)
      },
      (err) => {
        console.error('[useTasks] Firestore categories error:', err)
      }
    )
    return unsub
  }, [])

  // ── Mutations ─────────────────────────────────────────────────────────

  const handleToggleComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id)
      if (!task) return
      const nextCompleted = !task.completed
      const nextStatus: Task['status'] = nextCompleted
        ? 'Done'
        : task.status === 'Done'
          ? 'To Do'
          : task.status
      const patch = { completed: nextCompleted, status: nextStatus }
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
      await patchTask(id, patch)

      // Spawn next occurrence when a recurring task is checked off.
      if (nextCompleted && task.isRecurring) {
        await spawnNextRecurrence(task)
      }
    },
    [tasks, spawnNextRecurrence]
  )

  const handleUpdateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    const prevTask = tasks.find((t) => t.id === id)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    await patchTask(id, patch)

    // Spawn next occurrence when a recurring task transitions to Done via the detail dialog.
    const isNowDone = patch.completed === true
    const wasNotDone = prevTask && !prevTask.completed
    const recurring = patch.isRecurring ?? prevTask?.isRecurring
    if (isNowDone && wasNotDone && recurring) {
      await spawnNextRecurrence({ ...prevTask!, ...patch } as Task)
    }
  }, [tasks, spawnNextRecurrence])

  const handleChangePriority = useCallback(
    async (id: string, priority: Priority) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, priority } : t))
      )
      await patchTask(id, { priority })
    },
    []
  )

  const handleArchive = useCallback(async (id: string) => {
    const patch = { isArchived: true, isDeleted: false }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    await patchTask(id, patch)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id)
      if (!task) return
      // Only set deletedAt the first time a task is moved to Trash.
      const patch: Partial<Task> = {
        isDeleted: true,
        isArchived: false,
        ...(!task.deletedAt ? { deletedAt: new Date().toISOString() } : {}),
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
      await patchTask(id, patch)
    },
    [tasks]
  )

  const handleRestore = useCallback(async (id: string) => {
    const patch = { isArchived: false, isDeleted: false }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    await patchTask(id, patch)
  }, [])

  const handlePermanentDelete = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    await deleteTask(id)
  }, [])

  const handleAddTask = useCallback(
    async (
      title: string,
      startDate: Date,
      dueDate: Date,
      priority: Priority,
      category: string,
      status: Task['status'],
      isRecurring = false,
      repeatType?: RepeatType,
      excludeWeekends = false,
      isAllDay = false,
    ) => {
      const day = startOfDay(startDate)
      const nextStart = new Date(startDate)
      nextStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
      const nextDue = new Date(dueDate)
      const nextCategory = category.trim() || '기타'
      const completed = status === 'Done'

      const newTask: Task = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        date: day,
        startDate: nextStart,
        dueDate: nextDue,
        priority,
        category: nextCategory,
        status,
        completed,
        isArchived: false,
        isDeleted: false,
        isAllDay,
        ...(isRecurring && repeatType ? {
          isRecurring: true,
          repeatType,
          excludeWeekends: repeatType === 'daily' ? excludeWeekends : undefined,
        } : {}),
      }

      setTasks((prev) => [...prev, newTask])
      await saveTask(newTask)

      // Add to category list if new.
      if (nextCategory && !categoryList.includes(nextCategory)) {
        const next = [...categoryList, nextCategory]
        setCategoryList(next)
        await saveCategories(next)
      }
    },
    [categoryList]
  )

  const handleMoveTaskToStatus = useCallback(
    async (id: string, status: Task['status']) => {
      const task = tasks.find((t) => t.id === id)
      const patch = { status, completed: status === 'Done' }
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
      await patchTask(id, patch)

      if (status === 'Done' && task?.isRecurring && !task.completed) {
        await spawnNextRecurrence(task)
      }
    },
    [tasks, spawnNextRecurrence]
  )

  const handleDrop = useCallback(
    async (targetDate: Date, draggingTaskId: string | null) => {
      if (!draggingTaskId) return
      const task = tasks.find((t) => t.id === draggingTaskId)
      if (!task) return

      const day = startOfDay(targetDate)
      const nextStart = new Date(task.startDate)
      nextStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
      const nextDue = new Date(task.dueDate)
      nextDue.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())

      const patch = { date: day, startDate: nextStart, dueDate: nextDue }
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)))
      await patchTask(task.id, patch)
    },
    [tasks]
  )

  // ── Category mutations ────────────────────────────────────────────────

  const handleAddCategory = useCallback(
    async (name: string) => {
      const trimmed = name.trim()
      if (!trimmed || categoryList.includes(trimmed)) return
      const next = [...categoryList, trimmed]
      setCategoryList(next)
      await saveCategories(next)
    },
    [categoryList]
  )

  const handleRenameCategory = useCallback(
    async (oldName: string, newName: string) => {
      const trimmed = newName.trim()
      if (!trimmed || oldName === trimmed) return

      const updatedList = categoryList.map((c) =>
        c === oldName ? trimmed : c
      )
      setCategoryList(updatedList)
      await saveCategories(updatedList)

      const affected = tasks.filter((t) => t.category === oldName)
      if (affected.length > 0) {
        setTasks((prev) =>
          prev.map((t) =>
            t.category === oldName ? { ...t, category: trimmed } : t
          )
        )
        await Promise.all(
          affected.map((t) => patchTask(t.id, { category: trimmed }))
        )
      }
    },
    [categoryList, tasks]
  )

  const handleDeleteCategory = useCallback(
    async (name: string, reassignTo = '기타') => {
      const updatedList = categoryList.filter((c) => c !== name)
      setCategoryList(updatedList)
      await saveCategories(updatedList)

      const affected = tasks.filter((t) => t.category === name)
      if (affected.length > 0) {
        setTasks((prev) =>
          prev.map((t) =>
            t.category === name ? { ...t, category: reassignTo } : t
          )
        )
        await Promise.all(
          affected.map((t) => patchTask(t.id, { category: reassignTo }))
        )
      }
    },
    [categoryList, tasks]
  )

  const categories = categoryList.includes(DEFAULT_CATEGORY)
    ? categoryList
    : [DEFAULT_CATEGORY, ...categoryList]

  return {
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
  }
}
