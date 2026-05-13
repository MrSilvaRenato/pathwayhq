'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { FTEM_PHASES, SPORTS, type FtemPhase } from '@/types'
import { Search, X } from 'lucide-react'
import { useCallback } from 'react'

interface Props {
  squads: { id: string; name: string }[]
}

const OLYMPIC_SPORTS = SPORTS.filter(s => s.in2032).slice(0, 20)

export function AthletesFilter({ squads }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const phase = searchParams.get('phase') ?? ''
  const sport = searchParams.get('sport') ?? ''
  const squad = searchParams.get('squad') ?? ''

  const hasFilters = q || phase || sport || squad

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  function clearAll() {
    router.push(pathname)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search athletes..."
          value={q}
          onChange={e => update('q', e.target.value)}
          className="h-10 w-56 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Phase filter */}
      <select
        value={phase}
        onChange={e => update('phase', e.target.value)}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">All phases</option>
        {(Object.keys(FTEM_PHASES) as FtemPhase[]).map(p => (
          <option key={p} value={p}>{p} — {FTEM_PHASES[p].label}</option>
        ))}
      </select>

      {/* Sport filter */}
      <select
        value={sport}
        onChange={e => update('sport', e.target.value)}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">All sports</option>
        {SPORTS.map(s => (
          <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
        ))}
      </select>

      {/* Squad filter */}
      {squads.length > 0 && (
        <select
          value={squad}
          onChange={e => update('squad', e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All squads</option>
          {squads.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  )
}
