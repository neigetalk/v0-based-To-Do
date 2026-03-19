/**
 * Firestore helpers for the Tasks collection.
 *
 * Dates are stored as ISO strings in Firestore so that they survive
 * JSON serialization and round-trip back to JS Date objects cleanly.
 * (Firestore Timestamps also work, but ISO strings are simpler here.)
 */
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Task } from '@/lib/types'

// ─── Collection reference ────────────────────────────────────────────────────

export const TASKS_COLLECTION = 'tasks'

export const tasksRef = () => collection(db, TASKS_COLLECTION)

// ─── Serialization helpers ────────────────────────────────────────────────────

/**
 * Firestore document shape — dates are stored as ISO strings so they
 * survive the SDK's serialization without needing Timestamp conversion.
 */
export type FirestoreTask = Omit<Task, 'startDate' | 'dueDate' | 'date'> & {
  startDate: string
  dueDate: string
  date: string
}

export function taskToFirestore(task: Task): FirestoreTask {
  return {
    ...task,
    startDate: task.startDate.toISOString(),
    dueDate: task.dueDate.toISOString(),
    date: task.date.toISOString(),
  }
}

export function firestoreToTask(id: string, data: DocumentData): Task {
  return {
    ...(data as FirestoreTask),
    id,
    startDate: new Date(data.startDate as string),
    dueDate: new Date(data.dueDate as string),
    date: new Date(data.date as string),
  }
}

// ─── CRUD operations ──────────────────────────────────────────────────────────

/** Create or fully overwrite a task document. */
export async function saveTask(task: Task): Promise<void> {
  const ref = doc(db, TASKS_COLLECTION, task.id)
  await setDoc(ref, taskToFirestore(task))
}

/** Partially update a task document. */
export async function patchTask(
  id: string,
  patch: Partial<Task>
): Promise<void> {
  const ref = doc(db, TASKS_COLLECTION, id)
  // Serialize any Date fields inside the patch.
  const { startDate, dueDate, date, ...rest } = patch
  const serialized: Record<string, string | boolean | null | undefined | object> = {
    ...rest,
  }
  if (startDate) serialized.startDate = startDate.toISOString()
  if (dueDate) serialized.dueDate = dueDate.toISOString()
  if (date) serialized.date = date.toISOString()
  await updateDoc(ref, serialized)
}

/** Hard-delete a task document. */
export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, TASKS_COLLECTION, id))
}

// ─── Categories document ─────────────────────────────────────────────────────

const META_CATEGORIES_REF = () => doc(db, 'meta', 'categories')

/** Subscribe to the managed category list. Returns unsubscribe. */
export function subscribeToCategories(
  onData: (cats: string[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    META_CATEGORIES_REF(),
    (snap) => {
      onData(snap.exists() ? ((snap.data().list as string[]) ?? []) : [])
    },
    onError
  )
}

/** Overwrite the managed category list. */
export async function saveCategories(list: string[]): Promise<void> {
  await setDoc(META_CATEGORIES_REF(), { list })
}

// ─── Tasks subscription ───────────────────────────────────────────────────────

/** Subscribe to all tasks, ordered by dueDate ascending. Returns unsubscribe. */
export function subscribeToTasks(
  onData: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(tasksRef(), orderBy('date', 'asc'))

  return onSnapshot(
    q,
    (snap: QuerySnapshot<DocumentData>) => {
      const tasks = snap.docs.map((d) => firestoreToTask(d.id, d.data()))
      onData(tasks)
    },
    onError
  )
}
