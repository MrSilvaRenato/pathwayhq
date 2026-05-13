import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FTEM_PHASES } from '@/types'
import { formatDate, getAge } from '@/lib/utils'
import { Trophy, TrendingUp, CalendarDays, Star } from 'lucide-react'
import { FtemProgressBar } from '@/components/dashboard/ftem-progress-bar'

export default async function ParentPortalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: athletes },
    { data: milestones },
  ] = await Promise.all([
    supabase.from('athletes').select('*, squads(name)').eq('parent_id', user.id).eq('is_active', true),
    supabase.from('milestones').select('*').eq('is_shared_with_parent', true).order('achieved_at', { ascending: false }).limit(20),
  ])

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Your Athlete&apos;s Progress</h1>
        <p className="mt-1 text-sm text-slate-500">Track development, milestones, and pathway progress</p>
      </div>

      {athletes.map((athlete) => {
        const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
        const athleteMilestones = milestones?.filter((m) => m.athlete_id === athlete.id) ?? []

        return (
          <div key={athlete.id} className="mb-10">
            {/* Athlete header */}
            <div className="mb-4 flex items-center gap-4">
              <Avatar name={athlete.full_name} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{athlete.full_name}</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <span>{getAge(athlete.date_of_birth)} years old</span>
                  <span>·</span>
                  {/* @ts-ignore joined */}
                  <span>{athlete.squads?.name ?? 'No squad assigned'}</span>
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
                  <div className="flex items-center gap-2">
                    <Badge className={phase?.color}>{athlete.ftem_phase} — {phase?.label}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{phase?.description}</p>
                  {athlete.ftem_phase.startsWith('F') && (
                    <p className="mt-2 text-xs text-slate-500">
                      Building fundamental skills on the pathway to Brisbane 2032.
                    </p>
                  )}
                  {athlete.ftem_phase.startsWith('T') && (
                    <p className="mt-2 text-xs text-slate-500">
                      In structured development — talent phase aligned with national standards.
                    </p>
                  )}
                  {(athlete.ftem_phase.startsWith('E') || athlete.ftem_phase === 'M10') && (
                    <p className="mt-2 text-xs text-emerald-700 font-medium">
                      Elite pathway — this athlete is tracking toward national competition level.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Milestones
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
                            {m.description && (
                              <p className="mt-0.5 text-xs text-slate-500">{m.description}</p>
                            )}
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
