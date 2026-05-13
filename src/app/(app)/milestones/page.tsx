import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { FTEM_PHASES } from '@/types'
import { formatDate } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import { AddMilestoneForm } from '@/components/dashboard/add-milestone-form'

export default async function MilestonesPage() {
  const supabase = await createClient()

  const [{ data: milestones }, { data: athletes }] = await Promise.all([
    supabase
      .from('milestones')
      .select('*, athletes(full_name)')
      .order('achieved_at', { ascending: false })
      .limit(50),
    supabase
      .from('athletes')
      .select('id, full_name, ftem_phase')
      .eq('is_active', true)
      .order('full_name'),
  ])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Milestones</h1>
        <p className="mt-1 text-sm text-slate-500">Record and celebrate athlete achievements.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Add milestone */}
        <div className="col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold text-slate-800">Record a milestone</h2>
              <AddMilestoneForm athletes={athletes ?? []} />
            </CardContent>
          </Card>
        </div>

        {/* Milestones feed */}
        <div className="col-span-2">
          {!milestones?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
              <Trophy className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">No milestones yet</p>
              <p className="mt-1 text-xs text-slate-400">Record your first athlete achievement.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((m) => {
                const phase = FTEM_PHASES[m.ftem_phase as keyof typeof FTEM_PHASES]
                return (
                  <Card key={m.id}>
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="rounded-lg bg-amber-50 p-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-800">{m.title}</p>
                            {m.description && (
                              <p className="mt-0.5 text-sm text-slate-500">{m.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={phase?.color}>{m.ftem_phase}</Badge>
                            {m.is_shared_with_parent && (
                              <Badge variant="success">Shared</Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          {/* @ts-ignore joined */}
                          {m.athletes?.full_name && (
                            <div className="flex items-center gap-1.5">
                              {/* @ts-ignore joined */}
                              <Avatar name={m.athletes.full_name} size="sm" />
                              {/* @ts-ignore joined */}
                              <span className="text-sm text-slate-600">{m.athletes.full_name}</span>
                            </div>
                          )}
                          <span className="text-xs text-slate-400">{formatDate(m.achieved_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
