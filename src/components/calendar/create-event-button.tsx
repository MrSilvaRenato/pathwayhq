'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'

interface Props {
  clubId: string
  createdBy: string
  squads: { id: string; name: string }[]
}

const EVENT_TYPES = [
  { value: 'training',   label: 'Training' },
  { value: 'match',      label: 'Match' },
  { value: 'trial',      label: 'Trial' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'social',     label: 'Social' },
  { value: 'meeting',    label: 'Meeting' },
  { value: 'other',      label: 'Other' },
]

export function CreateEventButton({ clubId, createdBy, squads }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'training',
    location: '', date: today, start_time: '09:00', end_time: '10:00',
    squad_id: '', audience: 'all', is_all_day: false,
  })

  function update(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const starts_at = form.is_all_day
      ? `${form.date}T00:00:00`
      : `${form.date}T${form.start_time}:00`
    const ends_at = form.is_all_day
      ? `${form.date}T23:59:00`
      : `${form.date}T${form.end_time}:00`

    const { error: err } = await supabase.from('events').insert({
      club_id: clubId,
      created_by: createdBy,
      title: form.title,
      description: form.description || null,
      event_type: form.event_type,
      location: form.location || null,
      starts_at,
      ends_at,
      is_all_day: form.is_all_day,
      squad_id: form.squad_id || null,
      audience: form.audience,
    })

    if (err) { setError(err.message); setLoading(false); return }

    setOpen(false)
    setForm({ title: '', description: '', event_type: 'training', location: '', date: today, start_time: '09:00', end_time: '10:00', squad_id: '', audience: 'all', is_all_day: false })
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add event
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Create event</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <Input label="Title" placeholder="Squad training, Away match vs Northside FC..." value={form.title} onChange={e => update('title', e.target.value)} required />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <select value={form.event_type} onChange={e => update('event_type', e.target.value)}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Squad (optional)</label>
                  <select value={form.squad_id} onChange={e => update('squad_id', e.target.value)}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">All squads / Whole club</option>
                    {squads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <Input type="date" label="Date" value={form.date} onChange={e => update('date', e.target.value)} required />

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.is_all_day} onChange={e => update('is_all_day', e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                All day event
              </label>

              {!form.is_all_day && (
                <div className="grid grid-cols-2 gap-4">
                  <Input type="time" label="Start time" value={form.start_time} onChange={e => update('start_time', e.target.value)} required />
                  <Input type="time" label="End time" value={form.end_time} onChange={e => update('end_time', e.target.value)} required />
                </div>
              )}

              <Input label="Location (optional)" placeholder="Oval 3, Zillmere Sports Complex..." value={form.location} onChange={e => update('location', e.target.value)} />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Visible to</label>
                <select value={form.audience} onChange={e => update('audience', e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="all">Everyone in the club</option>
                  <option value="coaches">Coaches & Admins only</option>
                  <option value="parents">Parents & Athletes</option>
                </select>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>Create event</Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
