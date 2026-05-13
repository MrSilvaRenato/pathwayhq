import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FTEM_PHASES } from '@/types'
import { formatDate, getAge } from '@/lib/utils'
import { Trophy, TrendingUp, CalendarDays } from 'lucide-react'
import { FtemProgressBar } from '@/components/dashboard/ftem-progress-bar'

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: athlete },
    { data: history },
    { data: milestones },
    { data: attendance },
  ] = await Promise.all([
    supabase.from('athletes').select('*, squads(name)').eq('id', id).single(),
    supabase.from('ftem_history').select('*').eq('athlete_id', id).order('changed_at', { ascending: false }),
    supabase.from('milestones').select('*').eq('athlete_id', id).order('achieved_at', { ascending: false }),
    supabase.from('attendance').select('*, sessions(date, title)').eq('athlete_id', id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!athlete) notFound()

  const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
  const attendanceRate = attendance?.length
    ? Math.round((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100)
    : null

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start gap-5">
        <Avatar name={athlete.full_name} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{athlete.full_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">{getAge(athlete.date_of_birth)} years old</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm capitalize text-slate-500">{athlete.gender}</span>
            <span className="text-slate-300">·</span>
            {/* @ts-ignore joined */}
            <span className="text-sm text-slate-500">{athlete.squads?.name ?? 'No squad'}</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">Joined {formatDate(athlete.joined_club_at)}</span>
          </div>
          <div className="mt-3">
            <Badge className={phase?.color}>{athlete.ftem_phase} — {phase?.label}</Badge>
          </div>
        </div>
      </div>

      {/* FTEM Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Development Pathway
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FtemProgressBar currentPhase={athlete.ftem_phase} />
          <p className="mt-3 text-sm text-slate-600">{phase?.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Milestones ({milestones?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!milestones?.length ? (
              <p className="text-sm text-slate-400">No milestones recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                    <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.title}</p>
                      {m.description && <p className="mt-0.5 text-xs text-slate-500">{m.description}</p>}
                      <p className="mt-1 text-xs text-slate-400">{formatDate(m.achieved_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Recent Attendance
              {attendanceRate !== null && (
                <Badge variant={attendanceRate >= 75 ? 'success' : 'warning'} className="ml-auto">
                  {attendanceRate}%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!attendance?.length ? (
              <p className="text-sm text-slate-400">No sessions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {attendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    {/* @ts-ignore joined */}
                    <span className="text-slate-700">{a.sessions?.title}</span>
                    <Badge
                      variant={
                        a.status === 'present' ? 'success' :
                        a.status === 'excused' ? 'warning' : 'default'
                      }
                    >
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FTEM History */}
      {history && history.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Phase History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">{formatDate(h.changed_at)}</span>
                  {h.from_phase && (
                    <>
                      <Badge className={FTEM_PHASES[h.from_phase as keyof typeof FTEM_PHASES]?.color}>
                        {h.from_phase}
                      </Badge>
                      <span className="text-slate-400">→</span>
                    </>
                  )}
                  <Badge className={FTEM_PHASES[h.to_phase as keyof typeof FTEM_PHASES]?.color}>
                    {h.to_phase}
                  </Badge>
                  {h.note && <span className="text-slate-500">{h.note}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
