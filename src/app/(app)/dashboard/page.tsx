import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, TrendingUp, CalendarDays, Trophy, Megaphone, Heart, AlertTriangle, ArrowRight, Calendar } from 'lucide-react'
import { FTEM_PHASES } from '@/types'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function fmtEventDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const sevenDaysAhead = new Date(Date.now() + 7 * 86400000).toISOString()

  const [
    { data: athletes },
    { data: sessions },
    { data: milestones },
    { data: profile },
    { data: upcomingEvents },
    { data: announcements },
    { data: recentWellness },
  ] = await Promise.all([
    supabase.from('athletes').select('id, ftem_phase, full_name').eq('is_active', true),
    supabase.from('sessions').select('id').gte('date', thirtyDaysAgo),
    supabase.from('milestones').select('id, title, ftem_phase, achieved_at, athlete_id').gte('achieved_at', thirtyDaysAgo).order('achieved_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('*, clubs(name, sport)').single(),
    supabase.from('events').select('id, title, event_type, starts_at, is_all_day, location').eq('is_cancelled', false).gte('starts_at', new Date().toISOString()).lte('starts_at', sevenDaysAhead).order('starts_at').limit(4),
    supabase.from('announcements').select('id, title, created_at, is_pinned').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(3),
    supabase.from('wellness_logs').select('athlete_id, rpe, logged_at').eq('logged_at', today),
  ])

  const ftemDistribution = (athletes ?? []).reduce<Record<string, number>>((acc, a) => {
    acc[a.ftem_phase] = (acc[a.ftem_phase] || 0) + 1
    return acc
  }, {})

  // Athletes with high RPE today (≥8) = potential overload flag
  const highRpeToday = (recentWellness ?? []).filter(w => (w.rpe ?? 0) >= 8)
  const loggedWellnessIds = new Set((recentWellness ?? []).map(w => w.athlete_id))
  const notLoggedCount = (athletes?.length ?? 0) - loggedWellnessIds.size

  const EVENT_TYPE_COLOR: Record<string, string> = {
    training: 'bg-blue-100 text-blue-700',
    match: 'bg-red-100 text-red-700',
    trial: 'bg-purple-100 text-purple-700',
    tournament: 'bg-amber-100 text-amber-700',
    social: 'bg-emerald-100 text-emerald-700',
    meeting: 'bg-slate-100 text-slate-600',
  }

  const stats = [
    { label: 'Active Athletes',   value: athletes?.length ?? 0,   icon: Users,        color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/athletes' },
    { label: 'Sessions (30d)',    value: sessions?.length ?? 0,   icon: CalendarDays, color: 'text-blue-600',    bg: 'bg-blue-50',    href: '/squad' },
    { label: 'Milestones (30d)', value: milestones?.length ?? 0,  icon: Trophy,       color: 'text-amber-600',   bg: 'bg-amber-50',   href: '/milestones' },
    { label: 'FTEM Phases',      value: Object.keys(ftemDistribution).length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', href: '/analytics' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {(profile as any)?.clubs?.name ?? profile?.full_name ?? 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Athlete development overview · Brisbane 2032</p>
        </div>
        <div className="text-right text-sm text-slate-400">
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Alert strip */}
      {highRpeToday.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-medium">{highRpeToday.length} athlete{highRpeToday.length > 1 ? 's' : ''}</span> reported high RPE (≥8) today — monitor for overload.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-lg ${stat.bg} p-2.5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* FTEM Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">FTEM Phase Distribution</CardTitle>
              <Link href="/analytics" className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600">
                Full analytics <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {!athletes?.length ? (
                <p className="text-sm text-slate-400">No athletes yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {(Object.keys(FTEM_PHASES) as Array<keyof typeof FTEM_PHASES>).map((phase) => {
                    const count = ftemDistribution[phase] ?? 0
                    if (count === 0) return null
                    const pct = Math.round((count / (athletes?.length ?? 1)) * 100)
                    return (
                      <div key={phase} className="flex items-center gap-3">
                        <span className={`inline-flex w-14 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${FTEM_PHASES[phase].color}`}>
                          {phase}
                        </span>
                        <div className="flex-1 rounded-full bg-slate-100 h-2">
                          <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-sm font-medium text-slate-700">{count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" /> Upcoming (7 days)
              </CardTitle>
              <Link href="/calendar" className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600">
                Calendar <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {!upcomingEvents?.length ? (
                <p className="text-sm text-slate-400">No events in the next 7 days.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(e => (
                    <Link key={e.id} href={`/calendar/${e.id}`}>
                      <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
                        <Badge className={EVENT_TYPE_COLOR[e.event_type] ?? 'bg-slate-100 text-slate-600'}>
                          {e.event_type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{e.title}</p>
                          <p className="text-xs text-slate-400">{fmtEventDate(e.starts_at)}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent milestones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" /> Recent Milestones (30d)
              </CardTitle>
              <Link href="/milestones" className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {!milestones?.length ? (
                <p className="text-sm text-slate-400">No milestones this month.</p>
              ) : (
                <div className="space-y-2.5">
                  {milestones.map(m => (
                    <div key={m.id} className="flex items-start gap-3">
                      <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{m.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Badge className={FTEM_PHASES[m.ftem_phase as keyof typeof FTEM_PHASES]?.color ?? ''}>{m.ftem_phase}</Badge>
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

        {/* Right column */}
        <div className="col-span-1 space-y-6">
          {/* Wellness pulse */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" /> Today&apos;s Wellness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Logged today</span>
                  <span className="font-semibold text-slate-800">{loggedWellnessIds.size} / {athletes?.length ?? 0}</span>
                </div>
                {notLoggedCount > 0 && (
                  <p className="text-xs text-slate-400">{notLoggedCount} athlete{notLoggedCount > 1 ? 's' : ''} haven&apos;t logged yet</p>
                )}
                {highRpeToday.length > 0 && (
                  <div className="mt-2 rounded-lg bg-red-50 px-3 py-2">
                    <p className="text-xs font-medium text-red-600">{highRpeToday.length} high RPE today</p>
                  </div>
                )}
                {loggedWellnessIds.size > 0 && highRpeToday.length === 0 && (
                  <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2">
                    <p className="text-xs font-medium text-emerald-600">All logged athletes within normal load</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-slate-400" /> Announcements
              </CardTitle>
              <Link href="/announcements" className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {!announcements?.length ? (
                <p className="text-sm text-slate-400">No announcements yet.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map(a => (
                    <div key={a.id}>
                      <div className="flex items-start gap-2">
                        {a.is_pinned && <span className="mt-0.5 text-xs text-amber-500">📌</span>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                          <p className="text-xs text-slate-400">{timeAgo(a.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {[
                  { href: '/athletes/new', label: 'Add athlete', icon: Users },
                  { href: '/calendar', label: 'Create event', icon: Calendar },
                  { href: '/announcements', label: 'Post announcement', icon: Megaphone },
                  { href: '/analytics', label: 'View analytics', icon: TrendingUp },
                ].map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
