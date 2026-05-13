'use client'

import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { FTEM_PHASES } from '@/types'
import { AlertTriangle } from 'lucide-react'

interface AthleteRisk {
  id: string
  full_name: string
  ftem_phase: string
  attendanceRate: number | null
  sessionsTotal: number
}

interface Props {
  athletes: AthleteRisk[]
}

export function RetentionRiskList({ athletes }: Props) {
  if (!athletes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-emerald-50 p-3">
          <AlertTriangle className="h-6 w-6 text-emerald-400" />
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600">No retention risks detected</p>
        <p className="mt-1 text-xs text-slate-400">All athletes with recent sessions have &gt;60% attendance.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {athletes.map((athlete) => {
        const phase = FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES]
        const rate = athlete.attendanceRate ?? 0
        const riskLevel = rate < 30 ? 'high' : rate < 50 ? 'medium' : 'low'
        return (
          <Link key={athlete.id} href={`/athletes/${athlete.id}`}>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar name={athlete.full_name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{athlete.full_name}</p>
                  <p className="text-xs text-slate-400">{athlete.sessionsTotal} sessions tracked</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={phase?.color}>{athlete.ftem_phase}</Badge>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-orange-100 text-orange-700'
                  }`}
                >
                  {rate}%
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
