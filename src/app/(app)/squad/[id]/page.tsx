import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FTEM_PHASES } from '@/types'
import { getAge, formatDate } from '@/lib/utils'
import { ArrowLeft, CalendarDays, Plus, Users } from 'lucide-react'
import { SessionForm } from '@/components/dashboard/session-form'

export default async function SquadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: squad },
    { data: athletes },
    { data: sessions },
  ] = await Promise.all([
    supabase.from('squads').select('*, profiles(full_name)').eq('id', id).single(),
    supabase.from('athletes').select('*').eq('squad_id', id).eq('is_active', true).order('full_name'),
    supabase.from('sessions').select('*, attendance(athlete_id, status)').eq('squad_id', id).order('date', { ascending: false }).limit(10),
  ])

  if (!squad) notFound()

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/squad" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to squads
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{squad.name}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
              <span className="capitalize">{squad.sport}</span>
              {squad.age_group && <><span>·</span><span>{squad.age_group}</span></>}
              <span>·</span>
              <span>{athletes?.length ?? 0} athletes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Athletes */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                Athletes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!athletes?.length ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400">No athletes in this squad.</p>
                  <Link href="/athletes/new" className="mt-2 inline-block text-sm text-emerald-600 hover:underline">
                    Add an athlete
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {athletes.map((athlete) => {
                    const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
                    return (
                      <Link key={athlete.id} href={`/athletes/${athlete.id}`}>
                        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                          <Avatar name={athlete.full_name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{athlete.full_name}</p>
                            <p className="text-xs text-slate-400">{getAge(athlete.date_of_birth)} yrs</p>
                          </div>
                          <Badge className={phase?.color}>{athlete.ftem_phase}</Badge>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sessions */}
        <div className="col-span-2 space-y-6">
          {/* Log new session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" />
                Log a session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionForm squadId={id} athletes={athletes ?? []} />
            </CardContent>
          </Card>

          {/* Past sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                Recent sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!sessions?.length ? (
                <p className="text-sm text-slate-400">No sessions logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const present = session.attendance?.filter((a: { status: string }) => a.status === 'present').length ?? 0
                    const total = session.attendance?.length ?? 0
                    return (
                      <div key={session.id} className="rounded-lg border border-slate-100 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800">{session.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{formatDate(session.date)} · {session.duration_minutes} min</p>
                          </div>
                          <Badge variant={present === total && total > 0 ? 'success' : 'default'}>
                            {present}/{total} present
                          </Badge>
                        </div>
                        {session.notes && <p className="mt-2 text-sm text-slate-500">{session.notes}</p>}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
