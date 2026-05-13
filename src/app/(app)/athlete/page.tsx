import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FTEM_PHASES, SPORTS } from '@/types'
import { formatDate, getAge } from '@/lib/utils'
import { Trophy, TrendingUp, Target, Zap } from 'lucide-react'
import { FtemProgressBar } from '@/components/dashboard/ftem-progress-bar'
import { UpdateFtemForm } from '@/components/dashboard/update-ftem-form'
import { SelfMilestoneForm } from '@/components/athlete/self-milestone-form'

export default async function IndependentAthleteDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, athletes(*)')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'athlete') redirect('/dashboard')

  const athlete = (profile as any).athletes as {
    id: string; full_name: string; ftem_phase: string; sport: string
    date_of_birth: string; gender: string; joined_club_at: string
  } | null

  if (!athlete) redirect('/dashboard')

  const [{ data: milestones }, { data: history }] = await Promise.all([
    supabase.from('milestones').select('*').eq('athlete_id', athlete.id).order('achieved_at', { ascending: false }),
    supabase.from('ftem_history').select('*').eq('athlete_id', athlete.id).order('changed_at', { ascending: false }),
  ])

  const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
  const sportMeta = SPORTS.find(s => s.value === athlete.sport)
  const isOlympicSport = sportMeta?.in2032 ?? false
  const age = getAge(athlete.date_of_birth)
  const yearsTill2032 = 2032 - new Date().getFullYear()
  const ageAt2032 = age + yearsTill2032

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {sportMeta?.emoji} {sportMeta?.label ?? athlete.sport}
          {isOlympicSport && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <Zap className="h-3 w-3" /> Brisbane 2032 Olympic sport
            </span>
          )}
        </p>
      </div>

      {/* Olympics callout */}
      {isOlympicSport && ageAt2032 >= 16 && ageAt2032 <= 35 && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">You&apos;re in the Brisbane 2032 generation</p>
              <p className="mt-0.5 text-sm text-white/80">
                You&apos;ll be {ageAt2032} years old at the 2032 Brisbane Olympics — prime athletic age for {sportMeta?.label}.
                You&apos;re {yearsTill2032} years away.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: update phase */}
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Update my phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateFtemForm athleteId={athlete.id} currentPhase={athlete.ftem_phase as any} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Record a milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SelfMilestoneForm athleteId={athlete.id} currentPhase={athlete.ftem_phase as any} />
            </CardContent>
          </Card>
        </div>

        {/* Right: progress */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Development Pathway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FtemProgressBar currentPhase={athlete.ftem_phase as any} />
              <div className="mt-4 rounded-lg bg-emerald-50 p-4">
                <Badge className={phase?.color}>{athlete.ftem_phase} — {phase?.label}</Badge>
                <p className="mt-2 text-sm text-slate-700">{phase?.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Phase history */}
          {!!history?.length && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Phase History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center gap-3 text-sm">
                      <span className="text-xs text-slate-400 shrink-0">{formatDate(h.changed_at.split('T')[0])}</span>
                      {h.from_phase && (
                        <>
                          <Badge className={FTEM_PHASES[h.from_phase as keyof typeof FTEM_PHASES]?.color}>{h.from_phase}</Badge>
                          <span className="text-slate-300">→</span>
                        </>
                      )}
                      <Badge className={FTEM_PHASES[h.to_phase as keyof typeof FTEM_PHASES]?.color}>{h.to_phase}</Badge>
                      {h.note && <span className="text-xs text-slate-500">{h.note}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-amber-500" />
                My Milestones ({milestones?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!milestones?.length ? (
                <p className="text-sm text-slate-400">No milestones yet — record your first achievement.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {milestones.map((m) => (
                    <div key={m.id} className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                      <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                      {m.description && <p className="mt-0.5 text-xs text-slate-500">{m.description}</p>}
                      <p className="mt-1.5 text-xs text-slate-400">{formatDate(m.achieved_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
