import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Plus, Users } from 'lucide-react'

export default async function SquadPage() {
  const supabase = await createClient()

  const { data: squads } = await supabase
    .from('squads')
    .select('*, profiles(full_name)')
    .order('name')

  const squadIds = squads?.map((s) => s.id) ?? []
  const { data: athleteCounts } = await supabase
    .from('athletes')
    .select('squad_id')
    .in('squad_id', squadIds)
    .eq('is_active', true)

  const countMap = (athleteCounts ?? []).reduce<Record<string, number>>((acc, a) => {
    if (a.squad_id) acc[a.squad_id] = (acc[a.squad_id] || 0) + 1
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Squads</h1>
          <p className="mt-1 text-sm text-slate-500">{squads?.length ?? 0} squads</p>
        </div>
        <Link href="/squad/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New squad
          </Button>
        </Link>
      </div>

      {!squads?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
          <Users className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No squads yet</p>
          <p className="mt-1 text-xs text-slate-400">Create a squad to start organising your athletes.</p>
          <Link href="/squad/new" className="mt-4">
            <Button size="sm">Create first squad</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {squads.map((squad) => (
            <Link key={squad.id} href={`/squad/${squad.id}`}>
              <Card className="cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{squad.name}</h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
                      {squad.sport}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>{countMap[squad.id] ?? 0} athletes</span>
                  </div>
                  {squad.age_group && (
                    <p className="mt-1 text-xs text-slate-400">{squad.age_group}</p>
                  )}
                  {/* @ts-ignore joined */}
                  {squad.profiles?.full_name && (
                    <div className="mt-3 flex items-center gap-2">
                      {/* @ts-ignore joined */}
                      <Avatar name={squad.profiles.full_name} size="sm" />
                      {/* @ts-ignore joined */}
                      <span className="text-xs text-slate-500">{squad.profiles.full_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
