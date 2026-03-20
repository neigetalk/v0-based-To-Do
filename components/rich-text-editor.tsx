'use client'

import { useEffect, useMemo, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Bold, Italic, ListChecks, Underline as UnderlineIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useT } from '@/lib/i18n'

interface RichTextEditorProps {
  valueHtml: string
  onChangeHtml: (nextHtml: string) => void
}

export function RichTextEditor({ valueHtml, onChangeHtml }: RichTextEditorProps) {
  const hasMounted = useHasMounted()
  const { t } = useT()
  const lastEmitted = useRef<string>(valueHtml)
  const debounceRef = useRef<number | null>(null)

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        // Keep marks when manipulating lists/tables.
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'tiptap-link',
        },
      }),
      TaskList,
      TaskItem,
    ],
    []
  )

  const editor = useEditor(
    {
      extensions,
      // Avoid SSR hydration mismatches by preventing initial render on server.
      immediatelyRender: false,
      // Delay editor initialization details until after mount.
      content: hasMounted ? valueHtml || '<p></p>' : '<p></p>',
      editable: hasMounted,
      editorProps: {
        attributes: {
          class:
            'tiptap ProseMirror prose prose-sm max-w-none focus:outline-none bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[220px]',
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        // Debounce updates to avoid re-render lag.
        if (debounceRef.current) window.clearTimeout(debounceRef.current)
        debounceRef.current = window.setTimeout(() => {
          if (html === lastEmitted.current) return
          lastEmitted.current = html
          onChangeHtml(html)
        }, 200)
      },
    },
    // Extensions are stable, valueHtml changes are handled below via effect.
    [extensions, hasMounted]
  )

  useEffect(() => {
    if (!editor) return
    if (!hasMounted) return
    // Only sync when parent value changes externally.
    if (valueHtml !== lastEmitted.current) {
      lastEmitted.current = valueHtml
      editor.commands.setContent(valueHtml || '<p></p>')
    }
  }, [editor, valueHtml, hasMounted])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-label={t.editorBold}
          title={t.editorBold}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          aria-label={t.editorItalic}
          title={t.editorItalic}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          aria-label={t.editorUnderline}
          title={t.editorUnderline}
        >
          <UnderlineIcon className="size-4" />
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100"
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          aria-label={t.editorChecklist}
          title={t.editorChecklist}
        >
          <ListChecks className="size-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
      {!editor && <div className={cn('text-sm text-gray-500')}>{t.editorLoading}</div>}
    </div>
  )
}

