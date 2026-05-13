import { createClient } from '@/lib/supabase/server'
import { HandHeart, MapPin, Clock, Users, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CreateShiftButton } from '@/components/volunteering/create-shift-button'
import { SignUpButton } from '@/components/volunteering/sign-up-button'

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')}${ampm}`
}

export default async function VolunteeringPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('id, role, club_id, full_name').single()

  const [{ data: shifts }, { data: mySignups }] = await Promise.all([
    supabase
      .from('volunteer_shifts')
      .select('*, volunteer_signups(id, user_id, full_name)')
      .gte('shift_date', new Date().toISOString().split('T')[0])
      .order('shift_date')
      .order('start_time'),
    supabase
      .from('volunteer_signups')
      .select('shift_id')
      .eq('user_id', profile?.id ?? ''),
  ])

  const isCoachOrAdmin = profile?.role === 'club_admin' || profile?.role === 'coach'
  const myShiftIds = new Set((mySignups ?? []).map(s => s.shift_id))

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HandHeart className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Volunteering</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">Upcoming volunteer shifts — sign up to help out.</p>
        </div>
        {isCoachOrAdmin && (
          <CreateShiftButton clubId={profile!.club_id!} createdBy={profile!.id} />
        )}
      </div>

      {!shifts?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-slate-600">No volunteer shifts yet</p>
          {isCoachOrAdmin && <p className="mt-1 text-xs text-slate-400">Create a shift using the button above.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map(shift => {
            const signups = (shift.volunteer_signups ?? []) as { id: string; user_id: string; full_name: string }[]
            const filled = signups.length
            const isFull = filled >= shift.slots_needed
            const isSigned = myShiftIds.has(shift.id)

            return (
              <div key={shift.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={isFull ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                        {filled}/{shift.slots_needed} spots filled
                      </Badge>
                    </div>
                    <h2 className="font-semibold text-slate-900">{shift.title}</h2>
                    {shift.description && (
                      <p className="mt-1 text-sm text-slate-500">{shift.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(shift.shift_date)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{fmtTime(shift.start_time)} – {fmtTime(shift.end_time)}</span>
                      {shift.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{shift.location}</span>}
                    </div>

                    {signups.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {signups.map(s => (
                          <span key={s.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s.full_name}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <SignUpButton
                    shiftId={shift.id}
                    userId={profile!.id}
                    userName={(profile as any)?.full_name ?? ''}
                    isSigned={isSigned}
                    isFull={isFull && !isSigned}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
