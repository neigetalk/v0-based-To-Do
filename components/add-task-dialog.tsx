'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Settings2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Priority, TaskStatus } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (
    title: string,
    startDate: Date,
    dueDate: Date,
    priority: Priority,
    category: string,
    status: TaskStatus
  ) => void
  defaultDate: Date
  categories: string[]
  onAddCategory: (category: string) => void
  onOpenManageCategories?: () => void
}

export function AddTaskDialog({
  open,
  onOpenChange,
  onAddTask,
  defaultDate,
  categories,
  onAddCategory,
  onOpenManageCategories,
}: AddTaskDialogProps) {
  const setDatePart = (base: Date, day: Date) => {
    const next = new Date(base)
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    return next
  }

  const setTimePart = (base: Date, timeHHMM: string) => {
    const [hh, mm] = timeHHMM.split(':').map((v) => Number(v))
    const next = new Date(base)
    next.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0)
    return next
  }

  const toTimeValue = (d: Date) => {
    const hh = `${d.getHours()}`.padStart(2, '0')
    const mm = `${d.getMinutes()}`.padStart(2, '0')
    return `${hh}:${mm}`
  }

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [localStart, setLocalStart] = useState<Date>(defaultDate)
  const [localDue, setLocalDue] = useState<Date>(defaultDate)
  const [category, setCategory] = useState<string>(categories[0] ?? '')
  const [status, setStatus] = useState<TaskStatus>('To Do')
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle('')
    setPriority('medium')

    const start = new Date(defaultDate)
    start.setHours(9, 0, 0, 0)
    const due = new Date(defaultDate)
    due.setHours(17, 0, 0, 0)
    setLocalStart(start)
    setLocalDue(due)

    setCategory(categories[0] ?? '')
    setStatus('To Do')
    setNewCategory('')
  }, [open, defaultDate, categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      const finalCategory = category || categories[0] || '기타'
      onAddTask(title.trim(), localStart, localDue, priority, finalCategory, status)
      setTitle('')
      onOpenChange(false)
    }
  }

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-gray-200 text-gray-700 hover:bg-gray-300' },
    { value: 'medium', label: 'Medium', color: 'bg-[#4CD964]/20 text-[#4CD964] hover:bg-[#4CD964]/30' },
    { value: 'high', label: 'High', color: 'bg-[#FF3B30]/20 text-[#FF3B30] hover:bg-[#FF3B30]/30' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title" className="text-gray-700">
                Task Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Start</Label>
              <div className="grid grid-cols-[1fr_110px] gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal bg-gray-50 border-gray-200 text-gray-900'
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {format(localStart, 'PPP p')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={localStart}
                      onSelect={(d) => d && setLocalStart(setDatePart(localStart, d))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Input
                  type="time"
                  value={toTimeValue(localStart)}
                  onChange={(e) => setLocalStart(setTimePart(localStart, e.target.value))}
                  className="bg-gray-50 border-gray-200 text-gray-900"
                  step={60}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Due</Label>
              <div className="grid grid-cols-[1fr_110px] gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal bg-gray-50 border-gray-200 text-gray-900'
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {format(localDue, 'PPP p')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={localDue}
                      onSelect={(d) => d && setLocalDue(setDatePart(localDue, d))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Input
                  type="time"
                  value={toTimeValue(localDue)}
                  onChange={(e) => setLocalDue(setTimePart(localDue, e.target.value))}
                  className="bg-gray-50 border-gray-200 text-gray-900"
                  step={60}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-gray-700">Priority</Label>
              <div className="flex gap-2">
                <AnimatePresence>
                  {priorities.map((p) => (
                    <motion.button
                      key={p.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPriority(p.value)}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                        p.color,
                        priority === p.value && 'ring-2 ring-offset-2 ring-gray-400'
                      )}
                    >
                      {p.label}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {/* Label row: "Category" + Manage link */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-700">Category</Label>
                {onOpenManageCategories && (
                  <button
                    type="button"
                    onClick={onOpenManageCategories}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#4CD964] transition-colors"
                    title="Manage categories"
                  >
                    <Settings2 className="size-3.5" />
                    Manage
                  </button>
                )}
              </div>

              {/* Dropdown */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quick-add row */}
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Quick-add category…"
                  className="bg-gray-50 border-gray-200 text-gray-900 text-sm"
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    const trimmed = newCategory.trim()
                    if (!trimmed) return
                    onAddCategory(trimmed)
                    setCategory(trimmed)
                    setNewCategory('')
                  }}
                />
                <Button
                  type="button"
                  className="bg-[#4CD964] text-white hover:bg-[#4CD964]/90 shrink-0"
                  onClick={() => {
                    const trimmed = newCategory.trim()
                    if (!trimmed) return
                    onAddCategory(trimmed)
                    setCategory(trimmed)
                    setNewCategory('')
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-gray-700">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">할 일</SelectItem>
                  <SelectItem value="In Progress">진행 중</SelectItem>
                  <SelectItem value="Review">검토 중</SelectItem>
                  <SelectItem value="Done">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-700 border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="bg-[#4CD964] text-white hover:bg-[#4CD964]/90"
            >
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
