'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, startOfDay } from 'date-fns'
import { CalendarIcon, Image as ImageIcon, Settings2 } from 'lucide-react'
import { Task, Priority, RepeatType } from '@/lib/types'
import type { TaskStatus } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { RichTextEditor } from '@/components/rich-text-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useT } from '@/lib/i18n'
import { Checkbox } from '@/components/ui/checkbox'

interface TaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onUpdateTask: (id: string, patch: Partial<Task>) => void
  categories: string[]
  onAddCategory: (category: string) => void
  onOpenManageCategories?: () => void
}

function setDatePart(base: Date, day: Date) {
  const next = new Date(base)
  next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
  return next
}

function setTimePart(base: Date, timeHHMM: string) {
  const [hh, mm] = timeHHMM.split(':').map((v) => Number(v))
  const next = new Date(base)
  next.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0)
  return next
}

function toTimeValue(d: Date) {
  const hh = `${d.getHours()}`.padStart(2, '0')
  const mm = `${d.getMinutes()}`.padStart(2, '0')
  return `${hh}:${mm}`
}

const PRIORITY_ACTIVE_CLASSES: Record<Priority, string> = {
  high: 'bg-[#FF3B30] text-white border-[#FF3B30]',
  medium: 'bg-[#4CD964] text-white border-[#4CD964]',
  low: 'bg-gray-400 text-white border-gray-400',
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  onUpdateTask,
  categories,
  onAddCategory,
  onOpenManageCategories,
}: TaskDetailDialogProps) {
  const hasMounted = useHasMounted()
  const { t } = useT()
  const [localTitle, setLocalTitle] = useState('')
  const [localNotes, setLocalNotes] = useState('')
  const [localStart, setLocalStart] = useState<Date>(new Date())
  const [localDue, setLocalDue] = useState<Date>(new Date())
  const [localImage, setLocalImage] = useState<string | undefined>(undefined)
  const [localCategory, setLocalCategory] = useState('')
  const [localStatus, setLocalStatus] = useState<TaskStatus>('To Do')
  const [localPriority, setLocalPriority] = useState<Priority>('medium')
  const [newCategory, setNewCategory] = useState('')
  const [localRepeatType, setLocalRepeatType] = useState<'none' | RepeatType>('none')
  const [localExcludeWeekends, setLocalExcludeWeekends] = useState(false)

  useEffect(() => {
    if (!task) return
    setLocalTitle(task.title)
    setLocalNotes(task.notesHtml ?? '')
    setLocalStart(task.startDate)
    setLocalDue(task.dueDate)
    setLocalImage(task.imageDataUrl)
    setLocalCategory(task.category)
    setLocalStatus(task.status)
    setLocalPriority(task.priority)
    setLocalRepeatType(task.repeatType ?? 'none')
    setLocalExcludeWeekends(task.excludeWeekends ?? false)
  }, [task])

  const statusTone = useMemo(() => {
    switch (localStatus) {
      case 'In Progress':
        return 'bg-[#4CD964]/10 text-[#4CD964]'
      case 'Review':
        return 'bg-[#007AFF]/10 text-[#007AFF]'
      case 'Done':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }, [localStatus])

  const handleSave = () => {
    if (!task) return
    const nextStart = localStart
    const nextDue = localDue
    const nextDay = startOfDay(nextStart)

    const isRecurring = localRepeatType !== 'none'
    onUpdateTask(task.id, {
      title: localTitle.trim() ? localTitle.trim() : task.title,
      notesHtml: localNotes,
      startDate: nextStart,
      dueDate: nextDue,
      date: nextDay,
      imageDataUrl: localImage,
      category: localCategory || task.category,
      status: localStatus,
      priority: localPriority,
      completed: localStatus === 'Done',
      isRecurring,
      repeatType: isRecurring ? (localRepeatType as RepeatType) : undefined,
      excludeWeekends: isRecurring && localRepeatType === 'daily' ? localExcludeWeekends : undefined,
    })
    onOpenChange(false)
  }

  if (!task) return null

  return (
    !hasMounted ? null : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-white max-h-[90vh] overflow-y-auto overflow-x-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{t.detailTitle}</DialogTitle>
        </DialogHeader>

        {/* Hero image */}
        {localImage ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={localImage}
              alt="Task attachment"
              className="w-full max-h-[240px] object-cover"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-sm text-gray-500 flex items-center justify-center">
            <span className="inline-flex items-center gap-2">
              <ImageIcon className="size-4" />
              {t.detailNoImage}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700" htmlFor="task-title">
                {t.detailTitle2}
              </Label>
              <Input
                id="task-title"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>

            <RichTextEditor valueHtml={localNotes} onChangeHtml={setLocalNotes} />
          </div>

          <div className="space-y-5">
            {/* Classification card */}
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 space-y-4">
              <div className="text-sm font-semibold text-gray-900">{t.detailClassification}</div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-gray-700">{t.fieldPriority}</Label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setLocalPriority(p)}
                      className={cn(
                        'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors',
                        localPriority === p
                          ? PRIORITY_ACTIVE_CLASSES[p]
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {p === 'high' ? t.priorityHigh : p === 'medium' ? t.priorityMedium : t.priorityLow}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700">{t.fieldCategory}</Label>
                  {onOpenManageCategories && (
                    <button
                      type="button"
                      onClick={onOpenManageCategories}
                      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#4CD964] transition-colors"
                      title={t.fieldManage}
                    >
                      <Settings2 className="size-3.5" />
                      {t.fieldManage}
                    </button>
                  )}
                </div>

                <Select value={localCategory} onValueChange={setLocalCategory}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue placeholder={t.fieldCategoryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2 pt-1">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder={t.fieldQuickAddPlaceholder}
                    className="bg-gray-50 border-gray-200 text-gray-900 text-sm"
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      const trimmed = newCategory.trim()
                      if (!trimmed) return
                      onAddCategory(trimmed)
                      setLocalCategory(trimmed)
                      setNewCategory('')
                    }}
                  />
                  <Button
                    type="button"
                    className="bg-[#4CD964] text-white hover:bg-[#4CD964]/90 px-3 shrink-0"
                    onClick={() => {
                      const trimmed = newCategory.trim()
                      if (!trimmed) return
                      onAddCategory(trimmed)
                      setLocalCategory(trimmed)
                      setNewCategory('')
                    }}
                  >
                    {t.btnAdd}
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-gray-700">{t.fieldStatus}</Label>
                <div className="flex items-center justify-between gap-3">
                  <Select
                    value={localStatus}
                    onValueChange={(v) => setLocalStatus(v as TaskStatus)}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                      <SelectValue placeholder={t.fieldStatusPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">{t.statusGeneral}</SelectItem>
                      <SelectItem value="To Do">{t.statusToDo}</SelectItem>
                      <SelectItem value="In Progress">{t.statusInProgress}</SelectItem>
                      <SelectItem value="Review">{t.statusReview}</SelectItem>
                      <SelectItem value="Done">{t.statusDone}</SelectItem>
                    </SelectContent>
                  </Select>

                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full shrink-0', statusTone)}>
                    {localStatus === 'General' ? t.statusGeneral
                      : localStatus === 'To Do' ? t.statusToDo
                      : localStatus === 'In Progress' ? t.statusInProgress
                      : localStatus === 'Review' ? t.statusReview
                      : t.statusDone}
                  </span>
                </div>
              </div>

              {/* Repeat */}
              <div className="space-y-2">
                <Label className="text-gray-700">{t.repeatLabel}</Label>
                <Select value={localRepeatType} onValueChange={(v) => {
                  setLocalRepeatType(v as 'none' | RepeatType)
                  if (v !== 'daily') setLocalExcludeWeekends(false)
                }}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.repeatNone}</SelectItem>
                    <SelectItem value="daily">{t.repeatDaily}</SelectItem>
                    <SelectItem value="weekly">{t.repeatWeekly}</SelectItem>
                    <SelectItem value="monthly">{t.repeatMonthly}</SelectItem>
                    <SelectItem value="yearly">{t.repeatYearly}</SelectItem>
                  </SelectContent>
                </Select>

                {localRepeatType === 'daily' && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 select-none">
                    <Checkbox
                      checked={localExcludeWeekends}
                      onCheckedChange={(v) => setLocalExcludeWeekends(Boolean(v))}
                      className="data-[state=checked]:bg-[#4CD964] data-[state=checked]:border-[#4CD964]"
                    />
                    {t.repeatExcludeWeekends}
                  </label>
                )}
              </div>
            </div>

            {/* Scheduling card */}
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <div className="text-sm font-semibold text-gray-900">{t.detailScheduling}</div>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">{t.fieldStart}</Label>
                  <div className="grid grid-cols-[1fr_110px] gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start text-left font-normal bg-gray-50 border-gray-200 text-gray-900"
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
                  <Label className="text-gray-700">{t.fieldDue}</Label>
                  <div className="grid grid-cols-[1fr_110px] gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start text-left font-normal bg-gray-50 border-gray-200 text-gray-900"
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
              </div>
            </div>

            {/* Attachment card */}
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
              <div className="text-sm font-semibold text-gray-900">{t.detailAttachment}</div>

              <div className="mt-3 space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  className="bg-gray-50 border-gray-200"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      const result =
                        typeof reader.result === 'string' ? reader.result : undefined
                      if (result) setLocalImage(result)
                    }
                    reader.readAsDataURL(file)
                  }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {t.detailImageNote}
                  </span>
                  {localImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-700"
                      onClick={() => setLocalImage(undefined)}
                    >
                      {t.detailRemoveImage}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-gray-700 border-gray-200"
                onClick={() => onOpenChange(false)}
              >
                {t.btnCancel}
              </Button>
              <Button
                type="button"
                className="bg-[#4CD964] text-white hover:bg-[#4CD964]/90"
                onClick={handleSave}
              >
                {t.btnSave}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    )
  )
}
