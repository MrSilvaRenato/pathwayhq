import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, CalendarDays, Trophy } from 'lucide-react'
import { FTEM_PHASES } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: athletes },
    { data: sessions },
    { data: milestones },
    { data: profile },
  ] = await Promise.all([
    supabase.from('athletes').select('*').eq('is_active', true),
    supabase.from('sessions').select('*').gte('date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]),
    supabase.from('milestones').select('*').gte('achieved_at', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]),
    supabase.from('profiles').select('*, clubs(name, sport)').single(),
  ])

  const ftemDistribution = (athletes ?? []).reduce<Record<string, number>>((acc, a) => {
    acc[a.ftem_phase] = (acc[a.ftem_phase] || 0) + 1
    return acc
  }, {})

  const stats = [
    { label: 'Active Athletes',  value: athletes?.length ?? 0,  icon: Users,        color: 'text-emerald-600' },
    { label: 'Sessions (30d)',   value: sessions?.length ?? 0,  icon: CalendarDays, color: 'text-blue-600' },
    { label: 'Milestones (30d)', value: milestones?.length ?? 0, icon: Trophy,       color: 'text-amber-600' },
    { label: 'FTEM Phases Active', value: Object.keys(ftemDistribution).length, icon: TrendingUp, color: 'text-purple-600' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {/* @ts-ignore clubs is joined */}
          {profile?.clubs?.name ?? 'Your Club'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Athlete development overview — Brisbane 2032
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg bg-slate-50 p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FTEM Distribution */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FTEM Phase Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(FTEM_PHASES).length === 0 ? (
              <p className="text-sm text-slate-400">No athletes added yet.</p>
            ) : (
              <div className="space-y-3">
                {(Object.keys(FTEM_PHASES) as Array<keyof typeof FTEM_PHASES>).map((phase) => {
                  const count = ftemDistribution[phase] ?? 0
                  const total = athletes?.length ?? 1
                  const pct = Math.round((count / total) * 100)
                  if (count === 0) return null
                  return (
                    <div key={phase} className="flex items-center gap-3">
                      <span className={`inline-flex w-16 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${FTEM_PHASES[phase].color}`}>
                        {phase}
                      </span>
                      <div className="flex-1 rounded-full bg-slate-100 h-2">
                        <div
                          className="h-2 rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm font-medium text-slate-700">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {!milestones?.length ? (
              <p className="text-sm text-slate-400">No milestones recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {milestones.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-start gap-3">
                    <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.title}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge className={FTEM_PHASES[m.ftem_phase as keyof typeof FTEM_PHASES]?.color}>
                          {m.ftem_phase}
                        </Badge>
                        <span className="text-xs text-slate-400">{m.achieved_at}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
