import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FTEM_PHASES } from '@/types'
import { getAge } from '@/lib/utils'
import { UserPlus } from 'lucide-react'

export default async function AthletesPage() {
  const supabase = await createClient()

  const { data: athletes } = await supabase
    .from('athletes')
    .select('*, squads(name)')
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Athletes</h1>
          <p className="mt-1 text-sm text-slate-500">{athletes?.length ?? 0} active athletes</p>
        </div>
        <Link href="/athletes/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add athlete
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Athlete</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Squad</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">FTEM Phase</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Phase Description</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {athletes?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No athletes yet.{' '}
                    <Link href="/athletes/new" className="text-emerald-600 hover:underline">Add your first athlete.</Link>
                  </td>
                </tr>
              )}
              {athletes?.map((athlete) => {
                const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
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
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {getAge(athlete.date_of_birth)} yrs
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {/* @ts-ignore squads is joined */}
                      {athlete.squads?.name ?? <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={phase?.color}>{athlete.ftem_phase}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{phase?.description}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/athletes/${athlete.id}`}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
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
