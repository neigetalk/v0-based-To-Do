'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X, Plus, AlertTriangle } from 'lucide-react'
import { Task } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

interface ManageCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  tasks: Task[]
  onAddCategory: (name: string) => void
  onRenameCategory: (oldName: string, newName: string) => void
  onDeleteCategory: (name: string) => void
}

export function ManageCategoriesDialog({
  open,
  onOpenChange,
  categories,
  tasks,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: ManageCategoriesDialogProps) {
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const { t } = useT()

  const taskCountForCategory = (name: string) =>
    tasks.filter((t) => t.category === name && !t.isDeleted).length

  const startEdit = (name: string) => {
    setEditingName(name)
    setEditValue(name)
    setPendingDelete(null)
  }

  const confirmEdit = () => {
    if (!editingName) return
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== editingName) {
      onRenameCategory(editingName, trimmed)
    }
    setEditingName(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingName(null)
    setEditValue('')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    onDeleteCategory(pendingDelete)
    setPendingDelete(null)
  }

  const handleAddNew = () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    onAddCategory(trimmed)
    setNewCategoryName('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{t.manageCatTitle}</DialogTitle>
        </DialogHeader>

        {/* Add new category */}
        <div className="flex gap-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder={t.manageCatNewPlaceholder}
            className="bg-gray-50 border-gray-200 text-gray-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddNew()
              if (e.key === 'Escape') setNewCategoryName('')
            }}
          />
          <Button
            type="button"
            onClick={handleAddNew}
            disabled={!newCategoryName.trim()}
            className="bg-[#4CD964] text-white hover:bg-[#4CD964]/90 shrink-0"
          >
            <Plus className="size-4 mr-1" />
            {t.btnAdd}
          </Button>
        </div>

        {/* Category list */}
        <div className="space-y-2 mt-1">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              {t.manageCatEmpty}
            </p>
          )}

          {categories.map((cat) => {
            const count = taskCountForCategory(cat)
            const isEditing = editingName === cat
            const isConfirmingDelete = pendingDelete === cat

            return (
              <div
                key={cat}
                className={cn(
                  'flex items-center gap-2 rounded-xl border bg-gray-50/60 px-3 py-2 transition-colors',
                  isConfirmingDelete
                    ? 'border-red-300 bg-red-50/60'
                    : 'border-gray-200'
                )}
              >
                {isEditing ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-7 text-sm bg-white border-gray-300 flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmEdit()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                    />
                    <button
                      type="button"
                      onClick={confirmEdit}
                      className="text-[#4CD964] hover:text-[#4CD964]/80 p-1"
                      title="Confirm rename"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Cancel"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : isConfirmingDelete ? (
                  <>
                    <AlertTriangle className="size-4 text-red-500 shrink-0" />
                    <p className="flex-1 text-sm text-red-600">
                      {t.manageCatDelete(cat, count)}
                    </p>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      className="text-red-500 hover:text-red-700 p-1 font-medium text-xs"
                      title={t.manageCatDeleteBtn}
                    >
                      {t.manageCatDeleteBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(null)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Cancel"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-900 truncate">
                      {cat}
                    </span>
                    {count > 0 && (
                      <span className="text-xs text-gray-400 shrink-0">
                        {t.manageCatTaskCount(count)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="text-gray-400 hover:text-gray-700 p-1 transition-colors"
                      title="Rename"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingDelete(cat)
                        setEditingName(null)
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            className="text-gray-700 border-gray-200"
            onClick={() => onOpenChange(false)}
          >
            {t.manageCatDone}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
