import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MapPin, Clock, Users, CalendarDays } from 'lucide-react'
import { RosterManager } from '@/components/calendar/roster-manager'
import { RsvpButton } from '@/components/calendar/rsvp-button'

const TYPE_STYLES: Record<string, { color: string; label: string }> = {
  training:   { color: 'bg-blue-100 text-blue-700',    label: 'Training' },
  match:      { color: 'bg-red-100 text-red-700',      label: 'Match' },
  trial:      { color: 'bg-purple-100 text-purple-700', label: 'Trial' },
  tournament: { color: 'bg-amber-100 text-amber-700',  label: 'Tournament' },
  social:     { color: 'bg-emerald-100 text-emerald-700', label: 'Social' },
  meeting:    { color: 'bg-slate-100 text-slate-700',  label: 'Meeting' },
  other:      { color: 'bg-slate-100 text-slate-700',  label: 'Other' },
}

function fmt(iso: string, allDay: boolean) {
  if (allDay) return new Date(iso).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return new Date(iso).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: event }, { data: profile }, { data: rsvps }] = await Promise.all([
    supabase.from('events').select('*, squads(name), profiles!events_created_by_fkey(full_name)').eq('id', id).single(),
    supabase.from('profiles').select('id, role, club_id').eq('id', user!.id).single(),
    supabase.from('event_rsvps').select('*, profiles(full_name)').eq('event_id', id),
  ])

  if (!event) notFound()

  const isCoachOrAdmin = profile?.role === 'club_admin' || profile?.role === 'coach'
  const style = TYPE_STYLES[event.event_type] ?? TYPE_STYLES.other
  const myRsvp = rsvps?.find(r => r.user_id === user!.id)
  const going = rsvps?.filter(r => r.status === 'going') ?? []
  const notGoing = rsvps?.filter(r => r.status === 'not_going') ?? []

  // Load squad athletes for roster if coach/admin
  let squadAthletes: { id: string; full_name: string; ftem_phase: string }[] = []
  let rosterEntries: { athlete_id: string; status: string; position: string | null; note: string | null }[] = []

  if (isCoachOrAdmin && event.squad_id) {
    const [{ data: athletes }, { data: roster }] = await Promise.all([
      supabase.from('athletes').select('id, full_name, ftem_phase').eq('squad_id', event.squad_id).eq('is_active', true).order('full_name'),
      supabase.from('event_roster').select('*').eq('event_id', id),
    ])
    squadAthletes = athletes ?? []
    rosterEntries = roster ?? []
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/calendar" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to calendar
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={style.color}>{style.label}</Badge>
              {event.is_cancelled && <Badge variant="destructive">Cancelled</Badge>}
              {/* @ts-ignore joined */}
              {event.squads?.name && <Badge variant="default">{(event as any).squads.name}</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          </div>
          <RsvpButton eventId={id} userId={user!.id} currentStatus={myRsvp?.status ?? null} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {fmt(event.starts_at, event.is_all_day)}
            {!event.is_all_day && ` – ${new Date(event.ends_at).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" />
              {event.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-slate-400" />
            {going.length} going · {notGoing.length} not going
          </span>
        </div>

        {event.description && (
          <p className="mt-4 text-sm text-slate-600 rounded-lg bg-slate-50 px-4 py-3">{event.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* RSVPs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" /> Responses ({rsvps?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!rsvps?.length ? (
              <p className="text-sm text-slate-400">No responses yet.</p>
            ) : (
              <div className="space-y-2">
                {rsvps.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    {/* @ts-ignore joined */}
                    <span className="text-slate-700">{r.profiles?.full_name ?? 'Unknown'}</span>
                    <Badge className={r.status === 'going' ? 'bg-emerald-100 text-emerald-700' : r.status === 'not_going' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}>
                      {r.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roster (coach/admin only, squad events only) */}
        {isCoachOrAdmin && event.squad_id && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Match Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <RosterManager
                eventId={id}
                athletes={squadAthletes}
                initialRoster={rosterEntries as any}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
