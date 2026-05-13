'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FTEM_PHASES, type FtemPhase } from '@/types'

const FTEM_PHASE_KEYS = Object.keys(FTEM_PHASES) as FtemPhase[]

interface Props {
  athletes: { id: string; full_name: string; ftem_phase: string }[]
}

export function AddMilestoneForm({ athletes }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    athlete_id: '',
    title: '',
    description: '',
    achieved_at: new Date().toISOString().split('T')[0],
    ftem_phase: 'F1' as FtemPhase,
    is_shared_with_parent: true,
  })

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Auto-set FTEM phase when athlete is selected
  function selectAthlete(athleteId: string) {
    const athlete = athletes.find((a) => a.id === athleteId)
    setForm((prev) => ({
      ...prev,
      athlete_id: athleteId,
      ftem_phase: (athlete?.ftem_phase as FtemPhase) ?? 'F1',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.athlete_id || !form.title) return
    setLoading(true)
    setError('')

    const { data: profile } = await supabase.from('profiles').select('club_id, id').single()
    if (!profile) { setError('Profile error.'); setLoading(false); return }

    const { error: insertError } = await supabase.from('milestones').insert({
      athlete_id: form.athlete_id,
      club_id: profile.club_id,
      recorded_by: profile.id,
      title: form.title,
      description: form.description || null,
      achieved_at: form.achieved_at,
      ftem_phase: form.ftem_phase,
      is_shared_with_parent: form.is_shared_with_parent,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setForm({
      athlete_id: '',
      title: '',
      description: '',
      achieved_at: new Date().toISOString().split('T')[0],
      ftem_phase: 'F1',
      is_shared_with_parent: true,
    })
    setLoading(false)
    router.refresh()
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Athlete</label>
        <select
          value={form.athlete_id}
          onChange={(e) => selectAthlete(e.target.value)}
          required
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select athlete...</option>
          {athletes.map((a) => (
            <option key={a.id} value={a.id}>{a.full_name}</option>
          ))}
        </select>
      </div>

      <Input
        label="Milestone title"
        placeholder="First goal scored, PB in 100m..."
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        required
      />

      <Input
        label="Description (optional)"
        placeholder="More detail about the achievement..."
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          label="Date achieved"
          value={form.achieved_at}
          onChange={(e) => update('achieved_at', e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">FTEM phase</label>
          <select
            value={form.ftem_phase}
            onChange={(e) => update('ftem_phase', e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {FTEM_PHASE_KEYS.map((phase) => (
              <option key={phase} value={phase}>{phase} — {FTEM_PHASES[phase].label}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_shared_with_parent}
          onChange={(e) => update('is_shared_with_parent', e.target.checked)}
          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Share with parent
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {submitted && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">
          Milestone recorded!
        </p>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Record milestone
      </Button>
    </form>
  )
}
