'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FTEM_PHASES, SPORTS } from '@/types'
import Link from 'next/link'

type State = 'loading' | 'valid' | 'invalid' | 'expired' | 'already_claimed'

interface ClaimToken {
  id: string
  athlete_id: string
  email: string
  club_id: string
  token: string
  expires_at: string
  claimed_at: string | null
  athletes: { full_name: string; ftem_phase: string; sport: string; date_of_birth: string }
  clubs: { name: string }
}

export default function ClaimAccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()

  const [state, setState] = useState<State>('loading')
  const [claim, setClaim] = useState<ClaimToken | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setState('invalid'); return }
    async function load() {
      const { data } = await supabase
        .from('athlete_claim_tokens')
        .select('*, athletes(full_name, ftem_phase, sport, date_of_birth), clubs(name)')
        .eq('token', token)
        .single()

      if (!data) { setState('invalid'); return }
      if (data.claimed_at) { setState('already_claimed'); return }
      if (new Date(data.expires_at) < new Date()) { setState('expired'); return }
      setClaim(data as any)
      setState('valid')
    }
    load()
  }, [token])

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!claim) return
    setLoading(true); setError('')

    const { error: authError } = await supabase.auth.signUp({
      email: claim.email,
      password,
      options: {
        data: {
          full_name: (claim as any).athletes?.full_name,
          role: 'athlete',
          club_id: claim.club_id,
          athlete_id: claim.athlete_id,
        },
      },
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    // Mark token as claimed
    await supabase
      .from('athlete_claim_tokens')
      .update({ claimed_at: new Date().toISOString() })
      .eq('id', claim.id)

    router.push('/athlete')
    router.refresh()
  }

  const athlete = (claim as any)?.athletes
  const club = (claim as any)?.clubs
  const phase = athlete ? FTEM_PHASES[athlete.ftem_phase as keyof typeof FTEM_PHASES] : null
  const sportMeta = athlete ? SPORTS.find(s => s.value === athlete.sport) : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">PathwayHQ</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {state === 'loading' && <p className="text-center text-sm text-slate-500">Checking your link...</p>}

          {state === 'invalid' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <XCircle className="h-10 w-10 text-red-400" />
              <h2 className="font-semibold text-slate-800">Invalid link</h2>
              <p className="text-sm text-slate-500">This link is invalid or has already been used.</p>
              <Link href="/auth/login" className="text-sm text-emerald-600 hover:underline">Go to login</Link>
            </div>
          )}

          {state === 'expired' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <XCircle className="h-10 w-10 text-amber-400" />
              <h2 className="font-semibold text-slate-800">Link expired</h2>
              <p className="text-sm text-slate-500">Ask your coach to generate a new link.</p>
            </div>
          )}

          {state === 'already_claimed' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
              <h2 className="font-semibold text-slate-800">Already claimed</h2>
              <p className="text-sm text-slate-500">This profile has already been claimed.</p>
              <Link href="/auth/login" className="text-sm text-emerald-600 hover:underline">Sign in instead</Link>
            </div>
          )}

          {state === 'valid' && claim && (
            <>
              <div className="mb-6 text-center">
                <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
                <h2 className="text-lg font-semibold text-slate-900">Claim your profile</h2>
                <p className="mt-1 text-sm text-slate-500">
                  <strong>{club?.name}</strong> has added you as an athlete.
                </p>
                <p className="mt-1 text-xs text-slate-400">{claim.email}</p>
              </div>

              {/* Athlete preview */}
              <div className="mb-6 rounded-lg bg-slate-50 border border-slate-100 p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-800">{athlete?.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{sportMeta?.emoji} {sportMeta?.label ?? athlete?.sport}</span>
                  <span>·</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${phase?.color}`}>
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {athlete?.ftem_phase} — {phase?.label}
                  </span>
                </div>
                {sportMeta?.in2032 && (
                  <p className="text-xs text-emerald-600 font-medium">★ Brisbane 2032 Olympic sport</p>
                )}
              </div>

              <form onSubmit={handleClaim} className="space-y-4">
                <Input
                  type="password"
                  label="Create a password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Claim my profile
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
