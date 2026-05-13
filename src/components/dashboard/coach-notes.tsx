'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Lock, Globe, StickyNote, Trash2 } from 'lucide-react'

interface Note {
  id: string
  content: string
  is_private: boolean
  created_at: string
  coach_id: string
}

interface Props {
  athleteId: string
  coachId: string
  initialNotes: Note[]
}

export function CoachNotes({ athleteId, coachId, initialNotes }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const { error } = await supabase.from('coach_notes').insert({
      id,
      athlete_id: athleteId,
      coach_id: coachId,
      content: content.trim(),
      is_private: isPrivate,
    })

    if (!error) {
      setNotes(prev => [{ id, content: content.trim(), is_private: isPrivate, created_at: now, coach_id: coachId }, ...prev])
      setContent('')
    }
    setLoading(false)
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId)
    await supabase.from('coach_notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
    setDeletingId(null)
  }

  return (
    <div className="space-y-4">
      {/* Add note */}
      <form onSubmit={handleAdd} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note about this athlete..."
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            {isPrivate ? (
              <span className="flex items-center gap-1 text-amber-600"><Lock className="h-3 w-3" /> Private (only you)</span>
            ) : (
              <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Visible to all coaches</span>
            )}
          </label>
          <Button type="submit" size="sm" loading={loading} disabled={!content.trim()}>
            Add note
          </Button>
        </div>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
          <StickyNote className="h-4 w-4" />
          No notes yet.
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`rounded-lg border p-3 ${note.is_private ? 'border-amber-100 bg-amber-50' : 'border-slate-100 bg-white'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-800 flex-1 whitespace-pre-wrap">{note.content}</p>
                {note.coach_id === coachId && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                {note.is_private && (
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <Lock className="h-3 w-3" /> Private
                  </span>
                )}
                <span className="text-xs text-slate-400">{formatDate(note.created_at.split('T')[0])}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
