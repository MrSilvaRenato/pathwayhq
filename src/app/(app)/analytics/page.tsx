import { createClient } from '@/lib/supabase/server'
import { FTEM_PHASES } from '@/types'
import { FtemDistributionChart } from '@/components/analytics/ftem-distribution-chart'
import { AttendanceTrendChart } from '@/components/analytics/attendance-trend-chart'
import { RetentionRiskList } from '@/components/analytics/retention-risk-list'
import { PhaseProgressionChart } from '@/components/analytics/phase-progression-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, CalendarDays, AlertTriangle } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [
    { data: athletes },
    { data: sessions },
    { data: attendance },
    { data: ftemHistory },
  ] = await Promise.all([
    supabase.from('athletes').select('id, full_name, ftem_phase, date_of_birth, is_active, created_at').eq('is_active', true),
    supabase.from('sessions').select('id, date, squad_id, duration_minutes').order('date'),
    supabase.from('attendance').select('athlete_id, session_id, status, sessions(date)').order('created_at'),
    supabase.from('ftem_history').select('athlete_id, from_phase, to_phase, changed_at').order('changed_at'),
  ])

  // ── FTEM distribution ──────────────────────────────────────────────────────
  const ftemDist = Object.keys(FTEM_PHASES).map((phase) => ({
    phase,
    count: (athletes ?? []).filter((a) => a.ftem_phase === phase).length,
    color: phase.startsWith('F') ? '#10b981' : phase.startsWith('T') ? '#3b82f6' : phase.startsWith('E') ? '#8b5cf6' : '#f59e0b',
  })).filter(d => d.count > 0)

  // ── Sessions per week (last 12 weeks) ──────────────────────────────────────
  const now = new Date()
  const weeklyData: { week: string; sessions: number; avgAttendance: number }[] = []
  for (let w = 11; w >= 0; w--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - w * 7 - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const weekSessions = (sessions ?? []).filter((s) => {
      const d = new Date(s.date)
      return d >= weekStart && d < weekEnd
    })

    const sessionIds = weekSessions.map((s) => s.id)
    const weekAttendance = (attendance ?? []).filter((a) =>
      sessionIds.includes(a.session_id) && a.status === 'present'
    )
    const totalSlots = (attendance ?? []).filter((a) => sessionIds.includes(a.session_id))

    weeklyData.push({
      week: weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      sessions: weekSessions.length,
      avgAttendance: totalSlots.length > 0 ? Math.round((weekAttendance.length / totalSlots.length) * 100) : 0,
    })
  }

  // ── Retention risk: athletes with <50% attendance in last 30 days ──────────
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]
  const recentSessions = (sessions ?? []).filter((s) => s.date >= thirtyDaysAgo)
  const recentSessionIds = new Set(recentSessions.map((s) => s.id))

  const athleteRisk = (athletes ?? []).map((athlete) => {
    const athleteAttendance = (attendance ?? []).filter((a) => recentSessionIds.has(a.session_id) && a.athlete_id === athlete.id)
    const present = athleteAttendance.filter((a) => a.status === 'present').length
    const total = athleteAttendance.length
    const rate = total > 0 ? Math.round((present / total) * 100) : null
    return { ...athlete, attendanceRate: rate, sessionsTotal: total }
  }).filter((a) => a.attendanceRate !== null && a.attendanceRate < 60 && a.sessionsTotal >= 2)
    .sort((a, b) => (a.attendanceRate ?? 100) - (b.attendanceRate ?? 100))

  // ── Phase progression (promotions per month, last 6 months) ───────────────
  const progressionByMonth: { month: string; promotions: number }[] = []
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const label = d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
    const monthStart = d.toISOString()
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString()
    const count = (ftemHistory ?? []).filter((h) =>
      h.from_phase !== null && h.changed_at >= monthStart && h.changed_at < monthEnd
    ).length
    progressionByMonth.push({ month: label, promotions: count })
  }

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalAthletes = athletes?.length ?? 0
  const totalSessions30d = recentSessions.length
  const overallAttendance = (() => {
    const recent = (attendance ?? []).filter((a) => recentSessionIds.has(a.session_id))
    const present = recent.filter((a) => a.status === 'present').length
    return recent.length > 0 ? Math.round((present / recent.length) * 100) : 0
  })()
  const atRiskCount = athleteRisk.length

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Club-wide development intelligence.</p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {[
          { label: 'Active athletes', value: totalAthletes, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sessions (30d)', value: totalSessions30d, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg attendance (30d)', value: `${overallAttendance}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'At-risk athletes', value: atRiskCount, icon: AlertTriangle, color: atRiskCount > 0 ? 'text-red-500' : 'text-slate-400', bg: atRiskCount > 0 ? 'bg-red-50' : 'bg-slate-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-2 ${stat.bg} ${stat.color}`}>
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

      {/* Charts row 1 */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              FTEM Phase Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FtemDistributionChart data={ftemDist} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Weekly Sessions &amp; Attendance (12 weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTrendChart data={weeklyData} />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Phase Progressions per Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhaseProgressionChart data={progressionByMonth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              Retention Risk — Low Attendance (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RetentionRiskList athletes={athleteRisk} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
