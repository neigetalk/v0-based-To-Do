import { Task } from './types'

const today = new Date()
const getDateTime = (dayOffset: number, hour: number, minute = 0) => {
  const d = new Date(today)
  d.setDate(today.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d
}

export const mockTasks: Task[] = [
  // Today
  {
    id: '1',
    title: 'Review Q1 financial reports',
    category: '개인정보보호',
    status: 'Review',
    startDate: getDateTime(0, 9, 0),
    dueDate: getDateTime(0, 11, 0),
    date: getDateTime(0, 0, 0),
    priority: 'high',
    completed: false,
    notesHtml: `
      <p><strong>Agenda</strong></p>
      <ul>
        <li data-type="taskItem" data-checked="false">
          <label><input type="checkbox" /><span>Revenue variance</span></label>
        </li>
        <li data-type="taskItem" data-checked="true">
          <label><input type="checkbox" checked /><span>Expense breakdown</span></label>
        </li>
        <li data-type="taskItem" data-checked="false">
          <label><input type="checkbox" /><span>Action items</span></label>
        </li>
      </ul>
      <p><u>Remember</u>: send summary to Finance.</p>
    `.trim(),
    isArchived: false,
    isDeleted: false,
  },
  {
    id: '2',
    title: 'Team standup meeting',
    category: '홈페이지 운영',
    status: 'Done',
    startDate: getDateTime(0, 10, 0),
    dueDate: getDateTime(0, 10, 30),
    date: getDateTime(0, 0, 0),
    priority: 'medium',
    completed: true,
    notesHtml: `<p><em>Quick notes</em>: blockers + next steps.</p>`,
    isArchived: false,
    isDeleted: false,
  },
  {
    id: '3',
    title: 'Reply to client emails',
    category: '네트워크 운영',
    status: 'To Do',
    startDate: getDateTime(0, 15, 0),
    // Within 24h (orange) if currently before this time today
    dueDate: getDateTime(0, 18, 0),
    date: getDateTime(0, 0, 0),
    priority: 'low',
    completed: false,
    notesHtml: `
      <ul>
        <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>ACME follow-up</span></label></li>
        <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>Contract questions</span></label></li>
        <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>Scheduling</span></label></li>
      </ul>
    `.trim(),
    isArchived: false,
    isDeleted: false,
  },
  // Tomorrow
  {
    id: '4',
    title: 'Prepare presentation slides',
    category: '홈페이지 운영',
    status: 'In Progress',
    startDate: getDateTime(1, 9, 30),
    dueDate: getDateTime(1, 12, 0),
    date: getDateTime(1, 0, 0),
    priority: 'high',
    completed: false,
    isArchived: false,
    isDeleted: false,
  },
  {
    id: '5',
    title: 'Code review for new feature',
    category: '개인정보보호',
    status: 'To Do',
    startDate: getDateTime(1, 13, 0),
    dueDate: getDateTime(1, 17, 0),
    date: getDateTime(1, 0, 0),
    priority: 'medium',
    completed: false,
    isArchived: false,
    isDeleted: false,
  },
  // Day after tomorrow
  {
    id: '6',
    title: 'Client meeting - Project kickoff',
    category: '네트워크 운영',
    status: 'Review',
    startDate: getDateTime(2, 10, 0),
    dueDate: getDateTime(2, 11, 0),
    date: getDateTime(2, 0, 0),
    priority: 'high',
    completed: false,
    notesHtml: `
      <p><strong>Checklist</strong></p>
      <ul>
        <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>Confirm attendees</span></label></li>
        <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>Share deck</span></label></li>
        <li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>Define milestones</span></label></li>
      </ul>
    `.trim(),
    isArchived: false,
    isDeleted: false,
  },
  {
    id: '7',
    title: 'Update project documentation',
    category: '홈페이지 운영',
    status: 'To Do',
    startDate: getDateTime(2, 14, 0),
    dueDate: getDateTime(2, 16, 30),
    date: getDateTime(2, 0, 0),
    priority: 'low',
    completed: false,
    isArchived: false,
    isDeleted: false,
  },
  // Next week
  {
    id: '8',
    title: 'Submit expense reports',
    category: '네트워크 운영',
    status: 'To Do',
    startDate: getDateTime(5, 9, 0),
    dueDate: getDateTime(5, 17, 0),
    date: getDateTime(5, 0, 0),
    priority: 'medium',
    completed: false,
    isArchived: false,
    isDeleted: false,
  },
  {
    id: '9',
    title: 'Sprint planning session',
    category: '개인정보보호',
    status: 'In Progress',
    startDate: getDateTime(7, 11, 0),
    dueDate: getDateTime(7, 12, 0),
    date: getDateTime(7, 0, 0),
    priority: 'high',
    completed: false,
    isArchived: false,
    isDeleted: false,
  },
  {
    id: '10',
    title: 'One-on-one with manager',
    category: '개인정보보호',
    status: 'In Progress',
    startDate: getDateTime(7, 15, 0),
    dueDate: getDateTime(7, 15, 30),
    date: getDateTime(7, 0, 0),
    priority: 'medium',
    completed: false,
    isArchived: true,
    isDeleted: false,
  },
  // Past tasks
  {
    id: '11',
    title: 'Weekly status report',
    category: '홈페이지 운영',
    status: 'Done',
    startDate: getDateTime(-1, 9, 0),
    // Past due (red)
    dueDate: getDateTime(-1, 12, 0),
    date: getDateTime(-1, 0, 0),
    priority: 'medium',
    completed: true,
    isArchived: false,
    isDeleted: false,
  },
  {
    id: '12',
    title: 'Fix production bug',
    category: '네트워크 운영',
    status: 'Done',
    startDate: getDateTime(-2, 10, 0),
    dueDate: getDateTime(-2, 18, 0),
    date: getDateTime(-2, 0, 0),
    priority: 'high',
    completed: true,
    isArchived: false,
    isDeleted: true,
  },
  {
    id: '13',
    title: 'Update team documentation',
    category: '홈페이지 운영',
    status: 'To Do',
    startDate: getDateTime(-3, 14, 0),
    dueDate: getDateTime(-3, 17, 0),
    date: getDateTime(-3, 0, 0),
    priority: 'low',
    completed: false,
    isArchived: false,
    isDeleted: false,
  },
]
