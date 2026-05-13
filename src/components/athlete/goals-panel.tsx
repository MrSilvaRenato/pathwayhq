'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Plus, Check, X } from 'lucide-react'
import { FTEM_PHASES } from '@/types'
import type { FtemPhase } from '@/types'

interface Goal {
  id: string
  title: string
  description: string | null
  ftem_phase: string
  target_date: string | null
  completed_at: string | null
  is_private: boolean
}

interface Props {
  athleteId: string
  currentPhase: FtemPhase
  goals: Goal[]
  canAdd?: boolean
  clubId?: string | null
  userId?: string
}

export function GoalsPanel({ athleteId, currentPhase, goals, canAdd = true, clubId, userId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)

  const active = goals.filter(g => !g.completed_at)
  const completed = goals.filter(g => g.completed_at)

  async function addGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await supabase.from('goals').insert({
      athlete_id: athleteId,
      club_id: clubId ?? null,
      set_by: userId ?? null,
      title: title.trim(),
      description: description || null,
      ftem_phase: currentPhase,
      target_date: targetDate || null,
      is_private: isPrivate,
    })
    setTitle(''); setDescription(''); setTargetDate(''); setAdding(false)
    setLoading(false)
    router.refresh()
  }

  async function complete(goalId: string) {
    await supabase.from('goals').update({ completed_at: new Date().toISOString() }).eq('id', goalId)
    router.refresh()
  }

  async function remove(goalId: string) {
    await supabase.from('goals').delete().eq('id', goalId)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {!active.length && !adding && (
        <p className="text-sm text-slate-400">No active goals yet.</p>
      )}

      {active.map(g => (
        <div key={g.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{g.title}</p>
            {g.description && <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>}
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <Badge className={FTEM_PHASES[g.ftem_phase as keyof typeof FTEM_PHASES]?.color ?? 'bg-slate-100 text-slate-600'}>
                {g.ftem_phase}
              </Badge>
              {g.target_date && (
                <span className="text-xs text-slate-400">
                  Due {new Date(g.target_date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {g.is_private && <span className="text-xs text-slate-400">🔒 Private</span>}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => complete(g.id)} title="Mark complete"
              className="rounded p-1 text-emerald-500 hover:bg-emerald-50"><Check className="h-4 w-4" /></button>
            <button onClick={() => remove(g.id)} title="Delete"
              className="rounded p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
          </div>
        </div>
      ))}

      {!!completed.length && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600 select-none">
            {completed.length} completed goal{completed.length > 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-2">
            {completed.map(g => (
              <div key={g.id} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 opacity-70">
                <p className="text-sm font-medium text-slate-700 line-through">{g.title}</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Completed {new Date(g.completed_at!).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {canAdd && (
        adding ? (
          <form onSubmit={addGoal} className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
            <Input
              placeholder="Goal title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Details (optional)"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" label="Target date (optional)" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  Private
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={loading} className="text-xs px-3 py-1.5 h-auto">Add goal</Button>
              <Button type="button" variant="secondary" onClick={() => setAdding(false)} className="text-xs px-3 py-1.5 h-auto">Cancel</Button>
            </div>
          </form>
        ) : (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-600 transition-colors">
            <Plus className="h-4 w-4" /> Add goal
          </button>
        )
      )}
    </div>
  )
}
