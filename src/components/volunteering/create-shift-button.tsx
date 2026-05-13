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
}

export function CreateShiftButton({ clubId, createdBy }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    shift_date: today, start_time: '09:00', end_time: '12:00', slots_needed: 2,
  })

  function update(field: string, value: string | number) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.from('volunteer_shifts').insert({
      club_id: clubId,
      created_by: createdBy,
      title: form.title,
      description: form.description || null,
      location: form.location || null,
      shift_date: form.shift_date,
      start_time: form.start_time,
      end_time: form.end_time,
      slots_needed: form.slots_needed,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setOpen(false)
    setForm({ title: '', description: '', location: '', shift_date: today, start_time: '09:00', end_time: '12:00', slots_needed: 2 })
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add shift
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Create volunteer shift</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <Input label="Title" placeholder="Canteen duty, Gate marshal..." value={form.title} onChange={e => update('title', e.target.value)} required />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Description (optional)</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  rows={2} placeholder="What does this role involve?"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Date" value={form.shift_date} onChange={e => update('shift_date', e.target.value)} required />
                <Input label="Volunteers needed" type="number" min={1} max={50} value={String(form.slots_needed)} onChange={e => update('slots_needed', Number(e.target.value))} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="time" label="Start time" value={form.start_time} onChange={e => update('start_time', e.target.value)} required />
                <Input type="time" label="End time" value={form.end_time} onChange={e => update('end_time', e.target.value)} required />
              </div>

              <Input label="Location (optional)" placeholder="Canteen, Main gate..." value={form.location} onChange={e => update('location', e.target.value)} />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>Create shift</Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
