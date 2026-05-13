import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FTEM_PHASES } from '@/types'
import { formatDate, getAge } from '@/lib/utils'
import { Trophy, TrendingUp, CalendarDays, Star, CheckSquare, Heart } from 'lucide-react'
import { FtemProgressBar } from '@/components/dashboard/ftem-progress-bar'

export default async function ParentPortalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: athletes } = await supabase
    .from('athletes')
    .select('*, squads(name)')
    .eq('parent_id', user.id)
    .eq('is_active', true)

  if (!athletes?.length) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Star className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">No athletes linked yet</h2>
          <p className="mt-2 text-sm text-slate-500">Ask your club coach to link your child&apos;s profile to your account.</p>
        </div>
      </div>
    )
  }

  const athleteIds = athletes.map(a => a.id)

  const [{ data: milestones }, { data: goals }, { data: recentWellness }] = await Promise.all([
    supabase.from('milestones').select('*').in('athlete_id', athleteIds).eq('is_shared_with_parent', true).order('achieved_at', { ascending: false }),
    supabase.from('goals').select('*').in('athlete_id', athleteIds).eq('is_private', false).order('created_at', { ascending: false }),
    supabase.from('wellness_logs').select('*').in('athlete_id', athleteIds).order('logged_at', { ascending: false }).limit(14),
  ])

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Your Athlete&apos;s Progress</h1>
        <p className="mt-1 text-sm text-slate-500">Track development, milestones, goals and wellness</p>
      </div>

      {athletes.map((athlete) => {
        const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
        const athleteMilestones = milestones?.filter(m => m.athlete_id === athlete.id) ?? []
        const athleteGoals = goals?.filter(g => g.athlete_id === athlete.id) ?? []
        const athleteWellness = recentWellness?.filter(w => w.athlete_id === athlete.id) ?? []

        return (
          <div key={athlete.id} className="mb-12">
            {/* Athlete header */}
            <div className="mb-4 flex items-center gap-4">
              <Avatar name={athlete.full_name} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{athlete.full_name}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <span>{getAge(athlete.date_of_birth)} years old</span>
                  <span>·</span>
                  {/* @ts-ignore joined */}
                  <span>{(athlete as any).squads?.name ?? 'No squad assigned'}</span>
                </div>
              </div>
            </div>

            {/* FTEM Pathway */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Development Pathway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FtemProgressBar currentPhase={athlete.ftem_phase} />
                <div className="mt-4 rounded-lg bg-emerald-50 p-4">
                  <Badge className={phase?.color}>{athlete.ftem_phase} — {phase?.label}</Badge>
                  <p className="mt-2 text-sm text-slate-700">{phase?.description}</p>
                  {(athlete.ftem_phase.startsWith('E') || athlete.ftem_phase === 'M10') && (
                    <p className="mt-2 text-xs text-emerald-700 font-medium">
                      Elite pathway — tracking toward national competition level.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckSquare className="h-4 w-4 text-blue-500" />
                    Goals ({athleteGoals.filter(g => !g.completed_at).length} active)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!athleteGoals.filter(g => !g.completed_at).length ? (
                    <p className="text-sm text-slate-400">No goals set yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {athleteGoals.filter(g => !g.completed_at).map(g => (
                        <div key={g.id} className="rounded-lg bg-blue-50 p-2.5">
                          <p className="text-sm font-medium text-slate-800">{g.title}</p>
                          {g.target_date && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Due {new Date(g.target_date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Wellness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-rose-500" />
                    Recent wellness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!athleteWellness.length ? (
                    <p className="text-sm text-slate-400">No wellness logs yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {athleteWellness.slice(0, 5).map(w => (
                        <div key={w.id} className="flex items-center justify-between text-xs text-slate-600">
                          <span className="text-slate-400">{new Date(w.logged_at + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>
                          <div className="flex items-center gap-2">
                            {w.rpe != null && <span className={`font-medium ${w.rpe >= 8 ? 'text-red-500' : w.rpe >= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>RPE {w.rpe}</span>}
                            {w.energy != null && <span>{['😴','😪','😐','😊','⚡'][w.energy - 1]}</span>}
                            {w.mood != null && <span>{['😞','😕','😐','🙂','😄'][w.mood - 1]}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Milestones ({athleteMilestones.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!athleteMilestones.length ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    Milestones will appear here as your child progresses.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {athleteMilestones.map((m) => (
                      <div key={m.id} className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                        <div className="flex items-start gap-2">
                          <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                            {m.description && <p className="mt-0.5 text-xs text-slate-500">{m.description}</p>}
                            <p className="mt-1.5 text-xs text-slate-400">{formatDate(m.achieved_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
