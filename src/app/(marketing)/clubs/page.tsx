'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SPORTS, type Sport } from '@/types'
import { Zap, Search, MapPin, Users, ArrowRight, Filter } from 'lucide-react'

type AustralianState = 'QLD' | 'NSW' | 'VIC' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT'

const AU_STATES: AustralianState[] = ['QLD', 'NSW', 'VIC', 'WA', 'SA', 'TAS', 'ACT', 'NT']

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  elite: 'Elite',
}

const TIER_COLORS: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600',
  starter: 'bg-blue-100 text-blue-700',
  growth: 'bg-emerald-100 text-emerald-700',
  elite: 'bg-purple-100 text-purple-700',
}

interface ClubRow {
  id: string
  name: string
  sport: string
  state: string
  city: string
  subscription_tier: string
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<ClubRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sport, setSport] = useState<Sport | ''>('')
  const [state, setState] = useState<AustralianState | ''>('')

  const supabase = createClient()

  const fetchClubs = useCallback(async () => {
    setLoading(true)
    let req = supabase
      .from('clubs')
      .select('id, name, sport, state, city, subscription_tier')
      .order('name')

    if (sport) req = req.eq('sport', sport)
    if (state) req = req.eq('state', state)
    if (query.trim()) req = req.ilike('name', `%${query.trim()}%`)

    const { data } = await req
    setClubs(data ?? [])
    setLoading(false)
  }, [sport, state, query]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(fetchClubs, 300)
    return () => clearTimeout(timer)
  }, [fetchClubs])

  const sportMeta = (val: string) => SPORTS.find(s => s.value === val)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">PathwayHQ</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Find your club</h1>
          <p className="mt-3 text-lg text-slate-300">
            Search Australian clubs on PathwayHQ by sport, state, or name.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex items-center gap-2 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur-sm">
            <Search className="ml-2 h-4 w-4 shrink-0 text-slate-300" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Filters + results */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Filter row */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />

          <select
            value={sport}
            onChange={e => setSport(e.target.value as Sport | '')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All sports</option>
            {SPORTS.map(s => (
              <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
            ))}
          </select>

          <select
            value={state}
            onChange={e => setState(e.target.value as AustralianState | '')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All states</option>
            {AU_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {(sport || state || query) && (
            <button
              onClick={() => { setQuery(''); setSport(''); setState('') }}
              className="text-sm text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-slate-400">
            {loading ? 'Searching…' : `${clubs.length} club${clubs.length !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {/* Club cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <p className="text-slate-500">No clubs match your search.</p>
            <p className="mt-1 text-sm text-slate-400">Try a different sport or state, or start your own club.</p>
            <Link
              href="/auth/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Start a club — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map(club => {
              const meta = sportMeta(club.sport)
              return (
                <div
                  key={club.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xl">
                        {meta?.emoji ?? '🏅'}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIER_COLORS[club.subscription_tier] ?? TIER_COLORS.free}`}>
                        {TIER_LABELS[club.subscription_tier] ?? club.subscription_tier}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{club.name}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{meta?.label ?? club.sport}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {club.city}, {club.state}
                    </p>
                  </div>
                  <Link
                    href={`/auth/signup?club_id=${club.id}`}
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Join this club
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-slate-50 px-6 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Can&apos;t find your club?</h2>
        <p className="mt-2 text-sm text-slate-500">Create it in under a minute — free for up to 15 athletes.</p>
        <Link
          href="/auth/signup"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Create your club
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
