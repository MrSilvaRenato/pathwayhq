'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { UserCheck, UserX, Clock, Star } from 'lucide-react'

type RosterStatus = 'selected' | 'reserve' | 'unavailable' | 'unconfirmed'

interface Athlete {
  id: string
  full_name: string
  ftem_phase: string
}

interface RosterEntry {
  athlete_id: string
  status: RosterStatus
  position: string | null
  note: string | null
}

interface Props {
  eventId: string
  athletes: Athlete[]
  initialRoster: RosterEntry[]
}

const STATUS_OPTIONS: { value: RosterStatus; label: string; color: string }[] = [
  { value: 'selected',    label: 'Selected',    color: 'bg-emerald-100 text-emerald-700' },
  { value: 'reserve',     label: 'Reserve',     color: 'bg-blue-100 text-blue-700' },
  { value: 'unavailable', label: 'Unavailable', color: 'bg-red-100 text-red-700' },
  { value: 'unconfirmed', label: 'TBC',         color: 'bg-slate-100 text-slate-500' },
]

export function RosterManager({ eventId, athletes, initialRoster }: Props) {
  const supabase = createClient()
  const [roster, setRoster] = useState<Record<string, RosterStatus>>(() => {
    const map: Record<string, RosterStatus> = {}
    for (const r of initialRoster) map[r.athlete_id] = r.status
    return map
  })
  const [saving, setSaving] = useState<string | null>(null)

  async function setStatus(athleteId: string, status: RosterStatus) {
    setSaving(athleteId)
    await supabase.from('event_roster').upsert(
      { event_id: eventId, athlete_id: athleteId, status },
      { onConflict: 'event_id,athlete_id' }
    )
    setRoster(prev => ({ ...prev, [athleteId]: status }))
    setSaving(null)
  }

  async function remove(athleteId: string) {
    setSaving(athleteId)
    await supabase.from('event_roster').delete().eq('event_id', eventId).eq('athlete_id', athleteId)
    setRoster(prev => { const next = { ...prev }; delete next[athleteId]; return next })
    setSaving(null)
  }

  if (!athletes.length) {
    return <p className="text-sm text-slate-400">No athletes in this squad.</p>
  }

  const selected = athletes.filter(a => roster[a.id] === 'selected')
  const reserve  = athletes.filter(a => roster[a.id] === 'reserve')
  const rest     = athletes.filter(a => !roster[a.id] || roster[a.id] === 'unconfirmed' || roster[a.id] === 'unavailable')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />{selected.length} selected</span>
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-blue-400" />{reserve.length} reserve</span>
      </div>

      <div className="space-y-1.5">
        {athletes.map(athlete => {
          const current = roster[athlete.id] ?? null
          const statusMeta = STATUS_OPTIONS.find(s => s.value === current)
          return (
            <div key={athlete.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-slate-800 truncate">{athlete.full_name}</span>
                <span className="text-xs text-slate-400 shrink-0">{athlete.ftem_phase}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {current && (
                  <Badge className={statusMeta?.color ?? 'bg-slate-100 text-slate-500'}>
                    {statusMeta?.label}
                  </Badge>
                )}
                <select
                  disabled={saving === athlete.id}
                  value={current ?? ''}
                  onChange={e => {
                    const val = e.target.value
                    if (!val) remove(athlete.id)
                    else setStatus(athlete.id, val as RosterStatus)
                  }}
                  className="h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="">— Set status</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
