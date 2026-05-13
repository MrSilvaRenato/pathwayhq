import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FTEM_PHASES } from '@/types'
import { formatDate, getAge } from '@/lib/utils'
import { Trophy, TrendingUp, CalendarDays, StickyNote, UserCheck, ArrowLeft, CheckSquare, Heart } from 'lucide-react'
import { FtemProgressBar } from '@/components/dashboard/ftem-progress-bar'
import { UpdateFtemForm } from '@/components/dashboard/update-ftem-form'
import { LinkParentForm } from '@/components/dashboard/link-parent-form'
import { CoachNotes } from '@/components/dashboard/coach-notes'
import { ClaimAthleteForm } from '@/components/dashboard/claim-athlete-form'
import { GoalsPanel } from '@/components/athlete/goals-panel'
import { SPORTS } from '@/types'
import { ShieldCheck, ShieldAlert } from 'lucide-react'

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: athlete },
    { data: history },
    { data: milestones },
    { data: attendance },
    { data: notes },
    { data: profile },
    { data: claimToken },
    { data: goals },
    { data: recentWellness },
  ] = await Promise.all([
    supabase.from('athletes').select('*, squads(name), profiles!athletes_parent_id_fkey(full_name)').eq('id', id).single(),
    supabase.from('ftem_history').select('*').eq('athlete_id', id).order('changed_at', { ascending: false }),
    supabase.from('milestones').select('*').eq('athlete_id', id).order('achieved_at', { ascending: false }),
    supabase.from('attendance').select('*, sessions(date, title)').eq('athlete_id', id).order('created_at', { ascending: false }).limit(10),
    supabase.from('coach_notes').select('*').eq('athlete_id', id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, role, club_id').eq('id', user!.id).single(),
    supabase.from('athlete_claim_tokens').select('claimed_at, email').eq('athlete_id', id).maybeSingle(),
    supabase.from('goals').select('*').eq('athlete_id', id).order('created_at', { ascending: false }),
    supabase.from('wellness_logs').select('*').eq('athlete_id', id).order('logged_at', { ascending: false }).limit(7),
  ])

  if (!athlete) notFound()

  const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
  const attendanceRate = attendance?.length
    ? Math.round((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100)
    : null
  const isCoachOrAdmin = profile?.role === 'club_admin' || profile?.role === 'coach'
  const parentName = (athlete as any).profiles?.full_name ?? null
  const sportMeta = SPORTS.find(s => s.value === athlete.sport)
  const isClaimed = !!claimToken?.claimed_at
  const isVerified = (athlete as any).ftem_verified ?? false

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <Link href="/athletes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to athletes
      </Link>

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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={phase?.color}>{athlete.ftem_phase} — {phase?.label}</Badge>
            {sportMeta && <span className="text-sm text-slate-500">{sportMeta.emoji} {sportMeta.label}{sportMeta.in2032 ? ' ★' : ''}</span>}
            {isVerified
              ? <span className="flex items-center gap-1 text-xs text-emerald-600"><ShieldCheck className="h-3 w-3" /> Coach-verified</span>
              : <span className="flex items-center gap-1 text-xs text-slate-400"><ShieldAlert className="h-3 w-3" /> Unverified phase</span>
            }
            {parentName && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <UserCheck className="h-3 w-3 text-emerald-500" />
                {parentName}
              </span>
            )}
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

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: actions */}
        {isCoachOrAdmin && (
          <div className="col-span-1 space-y-4">
            {/* Update FTEM */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Update phase</CardTitle>
              </CardHeader>
              <CardContent>
                <UpdateFtemForm athleteId={athlete.id} currentPhase={athlete.ftem_phase} />
              </CardContent>
            </Card>

            {/* Link parent */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Parent account</CardTitle>
              </CardHeader>
              <CardContent>
                <LinkParentForm
                  athleteId={athlete.id}
                  currentParentId={athlete.parent_id}
                  currentParentName={parentName}
                />
              </CardContent>
            </Card>

            {/* Athlete account claim */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Athlete account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3">
                  Give {athlete.full_name} a login so they can see their own progress.
                </p>
                <ClaimAthleteForm
                  athleteId={athlete.id}
                  clubId={profile!.club_id!}
                  athleteName={athlete.full_name}
                  alreadyClaimed={isClaimed}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right column: data */}
        <div className={`space-y-6 ${isCoachOrAdmin ? 'col-span-2' : 'col-span-3'}`}>
          {/* Milestones + Attendance */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Milestones ({milestones?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!milestones?.length ? (
                  <p className="text-sm text-slate-400">No milestones yet.</p>
                ) : (
                  <div className="space-y-2">
                    {milestones.map((m) => (
                      <div key={m.id} className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5">
                        <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{m.title}</p>
                          {m.description && <p className="text-xs text-slate-500">{m.description}</p>}
                          <p className="mt-0.5 text-xs text-slate-400">{formatDate(m.achieved_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                  Attendance
                  {attendanceRate !== null && (
                    <Badge variant={attendanceRate >= 75 ? 'success' : 'warning'} className="ml-auto">
                      {attendanceRate}%
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!attendance?.length ? (
                  <p className="text-sm text-slate-400">No sessions yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {attendance.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        {/* @ts-ignore joined */}
                        <span className="text-slate-700 truncate">{a.sessions?.title}</span>
                        <Badge
                          variant={a.status === 'present' ? 'success' : a.status === 'excused' ? 'warning' : 'default'}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Phase History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center gap-3 text-sm">
                      <span className="text-xs text-slate-400 shrink-0">{formatDate(h.changed_at.split('T')[0])}</span>
                      {h.from_phase && (
                        <>
                          <Badge className={FTEM_PHASES[h.from_phase as keyof typeof FTEM_PHASES]?.color}>
                            {h.from_phase}
                          </Badge>
                          <span className="text-slate-300">→</span>
                        </>
                      )}
                      <Badge className={FTEM_PHASES[h.to_phase as keyof typeof FTEM_PHASES]?.color}>
                        {h.to_phase}
                      </Badge>
                      {h.note && <span className="text-slate-500 text-xs">{h.note}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckSquare className="h-4 w-4 text-blue-500" />
                Goals ({(goals ?? []).filter(g => !g.completed_at).length} active)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoalsPanel
                athleteId={athlete.id}
                currentPhase={athlete.ftem_phase as any}
                goals={goals ?? []}
                canAdd={isCoachOrAdmin}
                clubId={profile?.club_id}
                userId={profile?.id}
              />
            </CardContent>
          </Card>

          {/* Wellness trend (coach view) */}
          {isCoachOrAdmin && !!recentWellness?.length && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Recent wellness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-1.5 text-left font-medium">Date</th>
                        <th className="pb-1.5 text-center font-medium">RPE</th>
                        <th className="pb-1.5 text-center font-medium">Energy</th>
                        <th className="pb-1.5 text-center font-medium">Mood</th>
                        <th className="pb-1.5 text-center font-medium">Sleep</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentWellness.map(w => (
                        <tr key={w.id} className="border-b border-slate-50">
                          <td className="py-1.5 text-slate-400">{new Date(w.logged_at + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</td>
                          <td className="py-1.5 text-center">
                            <span className={`font-medium ${(w.rpe ?? 0) >= 8 ? 'text-red-500' : (w.rpe ?? 0) >= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {w.rpe ?? '—'}
                            </span>
                          </td>
                          <td className="py-1.5 text-center">{['😴','😪','😐','😊','⚡'][((w.energy ?? 1) - 1)] ?? '—'}</td>
                          <td className="py-1.5 text-center">{['😞','😕','😐','🙂','😄'][((w.mood ?? 1) - 1)] ?? '—'}</td>
                          <td className="py-1.5 text-center">{w.sleep_hours ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coach Notes */}
          {isCoachOrAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <StickyNote className="h-4 w-4 text-slate-500" />
                  Coach notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CoachNotes
                  athleteId={athlete.id}
                  coachId={profile!.id}
                  initialNotes={(notes ?? []) as any}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
