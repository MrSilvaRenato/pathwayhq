import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FTEM_PHASES, SPORTS } from '@/types'
import { getAge } from '@/lib/utils'
import { UserPlus, ShieldCheck, ShieldAlert } from 'lucide-react'
import { AthletesFilter } from '@/components/athletes/athletes-filter'

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; phase?: string; sport?: string; squad?: string }>
}) {
  const { q, phase, sport, squad } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('athletes')
    .select('*, squads(name)')
    .eq('is_active', true)
    .order('full_name')

  if (phase) query = query.eq('ftem_phase', phase)
  if (sport) query = query.eq('sport', sport)
  if (squad) query = query.eq('squad_id', squad)

  const { data: allAthletes } = await query
  const { data: squads } = await supabase.from('squads').select('id, name').order('name')

  // Client-side text search (Supabase free tier doesn't have full-text search enabled by default)
  const athletes = q
    ? (allAthletes ?? []).filter(a => a.full_name.toLowerCase().includes(q.toLowerCase()))
    : (allAthletes ?? [])

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Athletes</h1>
          <p className="mt-1 text-sm text-slate-500">{athletes.length} athlete{athletes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/athletes/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add athlete
          </Button>
        </Link>
      </div>

      <AthletesFilter squads={squads ?? []} />

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Athlete</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Sport</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Squad</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">FTEM Phase</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Verified</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {athletes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    {q || phase || sport || squad ? 'No athletes match your filters.' : (
                      <>No athletes yet. <Link href="/athletes/new" className="text-emerald-600 hover:underline">Add your first athlete.</Link></>
                    )}
                  </td>
                </tr>
              )}
              {athletes.map((athlete) => {
                const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
                const sportMeta = SPORTS.find(s => s.value === athlete.sport)
                return (
                  <tr key={athlete.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={athlete.full_name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{athlete.full_name}</p>
                          <p className="text-xs text-slate-400 capitalize">{athlete.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{getAge(athlete.date_of_birth)} yrs</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {sportMeta ? `${sportMeta.emoji} ${sportMeta.label}` : athlete.sport}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {/* @ts-ignore joined */}
                      {athlete.squads?.name ?? <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={phase?.color}>{athlete.ftem_phase}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {(athlete as any).ftem_verified
                        ? <ShieldCheck className="h-4 w-4 text-emerald-500" title="Coach-verified" />
                        : <ShieldAlert className="h-4 w-4 text-slate-300" title="Unverified (self-reported)" />
                      }
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/athletes/${athlete.id}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
