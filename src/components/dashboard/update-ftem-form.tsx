'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { FTEM_PHASES, type FtemPhase } from '@/types'
import { TrendingUp } from 'lucide-react'

const FTEM_PHASE_KEYS = Object.keys(FTEM_PHASES) as FtemPhase[]

interface Props {
  athleteId: string
  currentPhase: FtemPhase
}

export function UpdateFtemForm({ athleteId, currentPhase }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [phase, setPhase] = useState<FtemPhase>(currentPhase)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (phase === currentPhase) return
    setLoading(true)
    setError('')

    const { data: profile } = await supabase.from('profiles').select('id').single()
    if (!profile) { setError('Profile error.'); setLoading(false); return }

    const { error: historyError } = await supabase.from('ftem_history').insert({
      athlete_id: athleteId,
      from_phase: currentPhase,
      to_phase: phase,
      changed_by: profile.id,
      note: note || null,
    })

    if (historyError) { setError(historyError.message); setLoading(false); return }

    const { error: updateError } = await supabase
      .from('athletes')
      .update({ ftem_phase: phase, ftem_updated_at: new Date().toISOString(), ftem_updated_by: profile.id, ftem_verified: true })
      .eq('id', athleteId)

    if (updateError) { setError(updateError.message); setLoading(false); return }

    setSuccess(true)
    setNote('')
    setLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">New FTEM phase</label>
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value as FtemPhase)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {FTEM_PHASE_KEYS.map((p) => (
            <option key={p} value={p}>
              {p} — {FTEM_PHASES[p].label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Note <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for phase change..."
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">
          Phase updated!
        </p>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={phase === currentPhase}
        className="w-full"
      >
        <TrendingUp className="mr-2 h-4 w-4" />
        Update phase
      </Button>
    </form>
  )
}
