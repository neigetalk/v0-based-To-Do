'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { startOfDay } from 'date-fns'
import type { Task, Priority } from '@/lib/types'
import { mockTasks } from '@/lib/mock-data'
import {
  saveTask,
  patchTask,
  deleteTask,
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
      // When checking off → Done. When unchecking → restore original status
      // unless it was 'Done' (meaning it was already complete), in which case
      // revert to 'To Do' so it re-enters the workflow.
      const nextStatus: Task['status'] = nextCompleted
        ? 'Done'
        : task.status === 'Done'
          ? 'To Do'
          : task.status
      const patch = {
        completed: nextCompleted,
        status: nextStatus,
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
      await patchTask(id, patch)
    },
    [tasks]
  )

  const handleUpdateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    await patchTask(id, patch)
  }, [])

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

  const handleDelete = useCallback(async (id: string) => {
    const patch = { isDeleted: true, isArchived: false }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    await patchTask(id, patch)
  }, [])

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
      status: Task['status']
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
      const patch = { status, completed: status === 'Done' }
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
      await patchTask(id, patch)
    },
    []
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
