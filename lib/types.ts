export type Priority = 'low' | 'medium' | 'high'

export type TaskStatus = 'To Do' | 'In Progress' | 'On Hold' | 'Done' | 'General'

export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Task {
  id: string
  title: string
  category: string
  status: TaskStatus
  startDate: Date
  dueDate: Date
  date: Date
  priority: Priority
  completed: boolean
  notesHtml?: string
  imageDataUrl?: string
  isArchived?: boolean
  isDeleted?: boolean
  /** ISO string set once when the task is first moved to Trash. Used for auto-purge after 7 days. */
  deletedAt?: string
  /** Whether this task repeats on a schedule. */
  isRecurring?: boolean
  repeatType?: RepeatType
  /** Only meaningful when repeatType === 'daily'. Skip Sat/Sun. */
  excludeWeekends?: boolean
  /** Links a generated recurrence back to the original task. */
  originalTaskId?: string
  /** True when the task spans the entire day (no specific start/end time). */
  isAllDay?: boolean
}
