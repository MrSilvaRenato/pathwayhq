'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Pin } from 'lucide-react'

interface Props {
  clubId: string
  createdBy: string
}

export function CreateAnnouncementButton({ clubId, createdBy }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', is_pinned: false })

  function update(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.from('announcements').insert({
      club_id: clubId,
      author_id: createdBy,
      title: form.title,
      body: form.body || '',
      audience: form.audience,
      is_pinned: form.is_pinned,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setOpen(false)
    setForm({ title: '', body: '', audience: 'all', is_pinned: false })
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New announcement
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">New announcement</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <Input label="Title" placeholder="Training cancelled this Saturday..." value={form.title} onChange={e => update('title', e.target.value)} required />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Message (optional)</label>
                <textarea
                  value={form.body}
                  onChange={e => update('body', e.target.value)}
                  placeholder="Add more details here..."
                  rows={4}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Visible to</label>
                <select value={form.audience} onChange={e => update('audience', e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="all">Everyone in the club</option>
                  <option value="coaches">Coaches & Admins only</option>
                  <option value="parents">Parents & Athletes</option>
                  <option value="athletes">Athletes only</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.is_pinned} onChange={e => update('is_pinned', e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <Pin className="h-4 w-4 text-amber-500" />
                Pin this announcement
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading}>Post</Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
