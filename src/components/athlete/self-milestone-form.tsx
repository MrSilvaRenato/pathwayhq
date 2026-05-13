'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FTEM_PHASES, type FtemPhase } from '@/types'

interface Props {
  athleteId: string
  currentPhase: FtemPhase
}

export function SelfMilestoneForm({ athleteId, currentPhase }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', description: '',
    achieved_at: new Date().toISOString().split('T')[0],
    ftem_phase: currentPhase,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { data: profile } = await supabase.from('profiles').select('id').single()

    const { error: err } = await supabase.from('milestones').insert({
      athlete_id: athleteId,
      club_id: null,
      recorded_by: profile?.id ?? null,
      title: form.title,
      description: form.description || null,
      achieved_at: form.achieved_at,
      ftem_phase: form.ftem_phase,
      is_shared_with_parent: false,
    })

    if (err) { setError(err.message); setLoading(false); return }

    setSuccess(true)
    setForm({ title: '', description: '', achieved_at: new Date().toISOString().split('T')[0], ftem_phase: currentPhase })
    setLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Title" placeholder="First competition win, PB in 100m..."
        value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
      <Input label="Description (optional)" placeholder="More detail..."
        value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      <Input type="date" label="Date" value={form.achieved_at}
        onChange={e => setForm(p => ({ ...p, achieved_at: e.target.value }))} required />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">FTEM phase</label>
        <select value={form.ftem_phase} onChange={e => setForm(p => ({ ...p, ftem_phase: e.target.value as FtemPhase }))}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {(Object.keys(FTEM_PHASES) as FtemPhase[]).map(p => (
            <option key={p} value={p}>{p} — {FTEM_PHASES[p].label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">Milestone saved!</p>}
      <Button type="submit" loading={loading} className="w-full">Save milestone</Button>
    </form>
  )
}
