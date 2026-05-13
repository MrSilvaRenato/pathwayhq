import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarView } from '@/components/calendar/calendar-view'
import { CreateEventButton } from '@/components/calendar/create-event-button'
import { CalendarDays } from 'lucide-react'

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, club_id')
    .single()

  const [{ data: events }, { data: squads }] = await Promise.all([
    supabase
      .from('events')
      .select('*, squads(name)')
      .gte('starts_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .lte('starts_at', new Date(Date.now() + 60 * 86400000).toISOString())
      .eq('is_cancelled', false)
      .order('starts_at'),
    supabase
      .from('squads')
      .select('id, name')
      .order('name'),
  ])

  const isCoachOrAdmin = profile?.role === 'club_admin' || profile?.role === 'coach'

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">Upcoming events, sessions and matches.</p>
        </div>
        {isCoachOrAdmin && (
          <CreateEventButton
            clubId={profile!.club_id!}
            createdBy={profile!.id}
            squads={squads ?? []}
          />
        )}
      </div>

      <CalendarView events={events ?? []} isCoachOrAdmin={isCoachOrAdmin} />
    </div>
  )
}
