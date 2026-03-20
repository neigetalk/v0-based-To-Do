export type Priority = 'low' | 'medium' | 'high'

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done' | 'General'

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
}
