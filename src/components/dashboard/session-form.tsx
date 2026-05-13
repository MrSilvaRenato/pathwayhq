'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Athlete } from '@/types'

interface SessionFormProps {
  squadId: string
  athletes: Athlete[]
}

type AttendanceStatus = 'present' | 'absent' | 'excused'

export function SessionForm({ squadId, athletes }: SessionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration_minutes: '60',
    notes: '',
  })

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(athletes.map((a) => [a.id, 'present']))
  )

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleAttendance(athleteId: string) {
    setAttendance((prev) => {
      const current = prev[athleteId]
      const next: AttendanceStatus =
        current === 'present' ? 'absent' : current === 'absent' ? 'excused' : 'present'
      return { ...prev, [athleteId]: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) return
    setLoading(true)
    setError('')

    const { data: profile } = await supabase.from('profiles').select('club_id, id').single()
    if (!profile) { setError('Profile error.'); setLoading(false); return }

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        squad_id: squadId,
        club_id: profile.club_id,
        coach_id: profile.id,
        title: form.title,
        date: form.date,
        duration_minutes: parseInt(form.duration_minutes),
        notes: form.notes || null,
      })
      .select()
      .single()

    if (sessionError || !session) {
      setError(sessionError?.message ?? 'Failed to save session.')
      setLoading(false)
      return
    }

    // Log attendance for all athletes
    if (athletes.length > 0) {
      await supabase.from('attendance').insert(
        athletes.map((a) => ({
          session_id: session.id,
          athlete_id: a.id,
          status: attendance[a.id] ?? 'present',
        }))
      )
    }

    setSubmitted(true)
    setForm({ title: '', date: new Date().toISOString().split('T')[0], duration_minutes: '60', notes: '' })
    setAttendance(Object.fromEntries(athletes.map((a) => [a.id, 'present'])))
    setLoading(false)
    router.refresh()
    setTimeout(() => setSubmitted(false), 3000)
  }

  const statusColor: Record<AttendanceStatus, string> = {
    present: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
    absent:  'bg-red-100 text-red-700 ring-red-300',
    excused: 'bg-amber-100 text-amber-700 ring-amber-300',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <Input
            id="title"
            label="Session title"
            placeholder="Morning training, Match prep..."
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            required
          />
        </div>
        <Input
          id="date"
          type="date"
          label="Date"
          value={form.date}
          onChange={(e) => updateForm('date', e.target.value)}
          required
        />
        <Input
          id="duration"
          type="number"
          label="Duration (min)"
          value={form.duration_minutes}
          onChange={(e) => updateForm('duration_minutes', e.target.value)}
          min="15"
          max="300"
        />
      </div>

      <Input
        id="notes"
        label="Notes (optional)"
        placeholder="Focus areas, observations..."
        value={form.notes}
        onChange={(e) => updateForm('notes', e.target.value)}
      />

      {/* Attendance */}
      {athletes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Attendance — tap to toggle</p>
          <div className="flex flex-wrap gap-2">
            {athletes.map((athlete) => {
              const status = attendance[athlete.id] ?? 'present'
              return (
                <button
                  key={athlete.id}
                  type="button"
                  onClick={() => toggleAttendance(athlete.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition-colors',
                    statusColor[status]
                  )}
                >
                  <Avatar name={athlete.full_name} size="sm" className="h-5 w-5 text-xs" />
                  {athlete.full_name.split(' ')[0]}
                  <span className="text-xs opacity-70 capitalize">{status}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {submitted && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">
          Session logged successfully.
        </p>
      )}

      <Button type="submit" loading={loading} disabled={!form.title}>
        Log session
      </Button>
    </form>
  )
}
