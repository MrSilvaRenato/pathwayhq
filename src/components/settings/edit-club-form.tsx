'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SportSelect } from '@/components/ui/sport-select'
import { SUBSCRIPTION_TIERS, type Sport, type AustralianState } from '@/types'

const STATES: { value: AustralianState; label: string }[] = [
  { value: 'QLD', label: 'Queensland' },
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'WA',  label: 'Western Australia' },
  { value: 'SA',  label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'ACT' },
  { value: 'NT',  label: 'Northern Territory' },
]

interface Props {
  clubId: string
  initialName: string
  initialCity: string
  initialState: AustralianState
  initialSport: Sport
  subscriptionTier: string
}

export function EditClubForm({ clubId, initialName, initialCity, initialState, initialSport, subscriptionTier }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({ name: initialName, city: initialCity, state: initialState, sport: initialSport })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const tier = SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof SUBSCRIPTION_TIERS]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { error: err } = await supabase
      .from('clubs')
      .update({ name: form.name, city: form.city, state: form.state, sport: form.sport })
      .eq('id', clubId)

    if (err) { setError(err.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Club name"
        value={form.name}
        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Primary sport</label>
          <SportSelect value={form.sport} onChange={v => setForm(p => ({ ...p, sport: v }))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">State</label>
          <select
            value={form.state}
            onChange={e => setForm(p => ({ ...p, state: e.target.value as AustralianState }))}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <Input
        label="City / Suburb"
        value={form.city}
        onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
        required
      />

      <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Current plan: <span className="text-emerald-600">{tier?.label ?? subscriptionTier}</span></p>
          <p className="text-xs text-slate-400">Up to {tier?.athlete_limit ?? '—'} athletes · ${tier?.price ?? 0}/mo</p>
        </div>
        <span className="text-xs text-slate-400">Contact us to upgrade</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">Club details updated.</p>}

      <Button type="submit" loading={loading}>Save changes</Button>
    </form>
  )
}
