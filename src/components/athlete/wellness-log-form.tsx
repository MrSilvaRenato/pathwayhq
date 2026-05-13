'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Props {
  athleteId: string
  todayLog?: { rpe: number | null; energy: number | null; mood: number | null; sleep_hours: number | null; note: string | null } | null
}

function RatingRow({ label, value, max, onChange, emojis }: {
  label: string; value: number; max: number; onChange: (v: number) => void; emojis?: string[]
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-600 w-24 shrink-0">{label}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              n <= value
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {emojis ? emojis[n - 1] : n}
          </button>
        ))}
      </div>
      <span className="text-xs text-slate-400 w-4">{value || '—'}</span>
    </div>
  )
}

export function WellnessLogForm({ athleteId, todayLog }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [rpe,    setRpe]    = useState(todayLog?.rpe ?? 0)
  const [energy, setEnergy] = useState(todayLog?.energy ?? 0)
  const [mood,   setMood]   = useState(todayLog?.mood ?? 0)
  const [sleep,  setSleep]  = useState(String(todayLog?.sleep_hours ?? ''))
  const [note,   setNote]   = useState(todayLog?.note ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('wellness_logs').upsert({
      athlete_id: athleteId,
      logged_at: today,
      rpe: rpe || null,
      energy: energy || null,
      mood: mood || null,
      sleep_hours: sleep ? parseFloat(sleep) : null,
      note: note || null,
    }, { onConflict: 'athlete_id,logged_at' })
    setSaved(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <RatingRow label="RPE (effort)" value={rpe} max={10} onChange={setRpe} />
      <RatingRow label="Energy" value={energy} max={5} onChange={setEnergy} emojis={['😴','😪','😐','😊','⚡']} />
      <RatingRow label="Mood" value={mood} max={5} onChange={setMood} emojis={['😞','😕','😐','🙂','😄']} />

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 w-24 shrink-0">Sleep (hrs)</span>
        <input
          type="number" min="0" max="24" step="0.5"
          value={sleep}
          onChange={e => setSleep(e.target.value)}
          placeholder="7.5"
          className="w-20 h-8 rounded-lg border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-slate-600">Note (optional)</span>
        <textarea
          value={note} onChange={e => setNote(e.target.value)}
          rows={2} placeholder="Feeling a bit stiff, right hamstring..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {saved ? '✓ Saved' : todayLog ? 'Update today\'s log' : 'Log today'}
      </Button>
    </form>
  )
}
