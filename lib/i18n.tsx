'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'en' | 'ko'

const dict = {
  en: {
    // App header
    appTitle: 'Calendar Todo',
    appSubtitle: 'Switch between Calendar and Board views',

    // View tabs
    viewCalendar: 'Calendar',
    viewBoard: 'Board',

    // Scope tabs
    scopeActive: 'Active',
    scopeArchived: 'Archived',
    scopeTrash: 'Trash',

    // Header buttons
    categoriesBtn: 'Categories',
    loadingTasks: 'Loading tasks…',
    addNewTask: 'Add new task',

    // Language toggle
    langToggle: 'KO',

    // Monthly calendar
    todayBtn: 'Today',
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    // Task list panel
    dateToday: 'Today',
    dateTomorrow: 'Tomorrow',
    dateYesterday: 'Yesterday',
    completedCount: (done: number, total: number) => `${done}/${total} completed`,
    noTasksTitle: 'No tasks for this date',
    noTasksHint: 'Click the + button to add a task',

    // Task card & board card menu
    openDetails: 'Open details',
    menuPriority: 'Priority',
    menuArchive: 'Archive',
    menuRestore: 'Restore',
    menuDelete: 'Delete',
    menuDeletePermanently: 'Delete permanently',

    // Priority labels
    priorityHigh: 'High',
    priorityMedium: 'Medium',
    priorityLow: 'Low',

    // Status labels (display)
    statusToDo: 'To Do',
    statusInProgress: 'In Progress',
    statusReview: 'Review',
    statusDone: 'Done',
    statusGeneral: 'General',

    // Board view
    boardTitle: 'Board',
    boardSubtitle: 'Drag cards to update status',
    boardAllCategories: 'All categories',
    boardDropHere: 'Drop here',
    boardCompletedCount: (done: number, total: number) => `${done}/${total} done`,

    // Add Task dialog
    addTaskTitle: 'Add New Task',
    fieldTaskTitle: 'Title',
    fieldTaskPlaceholder: 'Enter task title…',
    fieldAllDay: 'All Day',
    fieldStart: 'Start',
    fieldDue: 'Due',
    fieldPriority: 'Priority',
    fieldCategory: 'Category',
    fieldStatus: 'Status',
    fieldManage: 'Manage',
    fieldCategoryPlaceholder: 'Choose category',
    fieldQuickAddPlaceholder: 'Quick-add category…',
    fieldStatusPlaceholder: 'Choose status',
    btnAdd: 'Add',
    btnAddTask: 'Add Task',
    btnCancel: 'Cancel',

    // Task Detail dialog
    detailTitle: 'Task details',
    detailNoImage: 'No image attached',
    detailTitle2: 'Title',
    detailClassification: 'Classification',
    detailScheduling: 'Scheduling',
    detailAttachment: 'Attachment',
    detailImageNote: 'Images are stored locally in memory (demo).',
    detailRemoveImage: 'Remove',
    btnSave: 'Save',

    // Manage categories dialog
    manageCatTitle: 'Manage Categories',
    manageCatNewPlaceholder: 'New category name…',
    manageCatEmpty: 'No categories yet.',
    manageCatDelete: (cat: string, count: number) =>
      count > 0
        ? `Delete "${cat}"? ${count} task${count !== 1 ? 's' : ''} will be reassigned to Others.`
        : `Delete "${cat}"?`,
    manageCatDeleteBtn: 'Delete',
    manageCatDone: 'Done',
    manageCatTaskCount: (n: number) => `${n} task${n !== 1 ? 's' : ''}`,

    // Rich text editor
    editorBold: 'Bold',
    editorItalic: 'Italic',
    editorUnderline: 'Underline',
    editorTable: 'Insert table',
    editorChecklist: 'Checklist',
    editorLoading: 'Loading editor…',

    // Start time / due time display in card
    labelStart: 'Start',
    labelDue: 'Due',

    // Trash auto-delete notice
    trashAutoDeleteNotice: 'Items in the Trash will be permanently deleted after 7 days.',

    // Recurring tasks
    repeatLabel: 'Repeat',
    repeatNone: 'None',
    repeatDaily: 'Daily',
    repeatWeekly: 'Weekly',
    repeatMonthly: 'Monthly',
    repeatYearly: 'Yearly',
    repeatExcludeWeekends: 'Weekdays only (Mon–Fri)',
  },

  ko: {
    appTitle: '캘린더 할일',
    appSubtitle: '캘린더와 보드 뷰 사이를 전환하세요',

    viewCalendar: '캘린더',
    viewBoard: '보드',

    scopeActive: '활성',
    scopeArchived: '보관됨',
    scopeTrash: '휴지통',

    categoriesBtn: '카테고리',
    loadingTasks: '로딩 중…',
    addNewTask: '새 할일 추가',

    langToggle: 'EN',

    todayBtn: '오늘',
    weekDays: ['일', '월', '화', '수', '목', '금', '토'],

    dateToday: '오늘',
    dateTomorrow: '내일',
    dateYesterday: '어제',
    completedCount: (done: number, total: number) => `${done}/${total} 완료`,
    noTasksTitle: '이 날짜에 할일이 없습니다',
    noTasksHint: '+ 버튼을 눌러 할일을 추가하세요',

    openDetails: '상세 보기',
    menuPriority: '우선순위',
    menuArchive: '보관',
    menuRestore: '복원',
    menuDelete: '삭제',
    menuDeletePermanently: '영구 삭제',

    priorityHigh: '높음',
    priorityMedium: '보통',
    priorityLow: '낮음',

    statusToDo: '할 일',
    statusInProgress: '진행 중',
    statusReview: '검토 중',
    statusDone: '완료',
    statusGeneral: '기본',

    boardTitle: '보드',
    boardSubtitle: '카드를 드래그하여 상태를 변경하세요',
    boardAllCategories: '모든 카테고리',
    boardDropHere: '여기에 놓기',
    boardCompletedCount: (done: number, total: number) => `${done}/${total} 완료`,

    addTaskTitle: '새 할일 추가',
    fieldTaskTitle: '제목',
    fieldTaskPlaceholder: '제목을 입력하세요…',
    fieldAllDay: '하루 종일',
    fieldStart: '시작',
    fieldDue: '마감',
    fieldPriority: '우선순위',
    fieldCategory: '카테고리',
    fieldStatus: '상태',
    fieldManage: '관리',
    fieldCategoryPlaceholder: '카테고리 선택',
    fieldQuickAddPlaceholder: '카테고리 빠른 추가…',
    fieldStatusPlaceholder: '상태 선택',
    btnAdd: '추가',
    btnAddTask: '할일 추가',
    btnCancel: '취소',

    detailTitle: '할일 상세',
    detailNoImage: '첨부 이미지 없음',
    detailTitle2: '제목',
    detailClassification: '분류',
    detailScheduling: '일정',
    detailAttachment: '첨부파일',
    detailImageNote: '이미지는 메모리에 임시 저장됩니다 (데모).',
    detailRemoveImage: '제거',
    btnSave: '저장',

    manageCatTitle: '카테고리 관리',
    manageCatNewPlaceholder: '새 카테고리 이름…',
    manageCatEmpty: '카테고리가 없습니다.',
    manageCatDelete: (cat: string, count: number) =>
      count > 0
        ? `"${cat}" 삭제 시 ${count}개 할일이 기타로 이동됩니다.`
        : `"${cat}"을(를) 삭제할까요?`,
    manageCatDeleteBtn: '삭제',
    manageCatDone: '완료',
    manageCatTaskCount: (n: number) => `${n}개`,

    editorBold: '굵게',
    editorItalic: '기울임',
    editorUnderline: '밑줄',
    editorTable: '표 삽입',
    editorChecklist: '체크리스트',
    editorLoading: '에디터 로딩 중…',

    labelStart: '시작',
    labelDue: '마감',

    trashAutoDeleteNotice: '휴지통에 있는 항목은 7일 후 자동으로 영구 삭제됩니다.',

    repeatLabel: '반복',
    repeatNone: '없음',
    repeatDaily: '매일',
    repeatWeekly: '매주',
    repeatMonthly: '매월',
    repeatYearly: '매년',
    repeatExcludeWeekends: '주중만 (월–금)',
  },
} as const

export type Translations = typeof dict.en

interface LanguageContextValue {
  lang: Lang
  t: Translations
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    if (stored === 'en' || stored === 'ko') {
      setLangState(stored)
    } else {
      const detected = navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en'
      setLangState(detected)
    }
  }, [])

  const setLang = (next: Lang) => {
    setLangState(next)
    localStorage.setItem('lang', next)
  }

  return (
    <LanguageContext.Provider value={{ lang, t: dict[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useT() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useT must be used inside <LanguageProvider>')
  return ctx
}
