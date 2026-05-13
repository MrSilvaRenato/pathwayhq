'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Sport, AustralianState } from '@/types'

const SPORTS: { value: Sport; label: string }[] = [
  { value: 'soccer',     label: 'Soccer / Football' },
  { value: 'swimming',   label: 'Swimming' },
  { value: 'athletics',  label: 'Athletics' },
  { value: 'gymnastics', label: 'Gymnastics' },
  { value: 'rowing',     label: 'Rowing' },
  { value: 'cycling',    label: 'Cycling' },
  { value: 'hockey',     label: 'Hockey' },
  { value: 'triathlon',  label: 'Triathlon' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'netball',    label: 'Netball' },
  { value: 'rugby',      label: 'Rugby' },
  { value: 'other',      label: 'Other' },
]

const STATES: { value: AustralianState; label: string }[] = [
  { value: 'QLD', label: 'Queensland' },
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'WA',  label: 'Western Australia' },
  { value: 'SA',  label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'ACT' },
  { value: 'NT',  label: 'Northern Territory' },
]

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    clubName: '',
    sport: 'soccer' as Sport,
    state: 'QLD' as AustralianState,
    city: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Create club — no .select() to avoid RLS on read-back before auth
    const clubId = crypto.randomUUID()
    const { error: clubError } = await supabase
      .from('clubs')
      .insert({
        id: clubId,
        name: form.clubName,
        sport: form.sport,
        state: form.state,
        city: form.city,
        subscription_tier: 'free',
      })

    if (clubError) {
      setError('Failed to create club. Please try again.')
      setLoading(false)
      return
    }

    // 2. Sign up user with club_id in metadata
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role: 'club_admin',
          club_id: clubId,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">PathwayHQ</h1>
          <p className="text-sm text-slate-500">Start your club&apos;s free account</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Create your club</h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <Input id="fullName" label="Your full name" placeholder="Alex Smith"
              value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required />

            <Input id="email" type="email" label="Email address" placeholder="alex@yourclub.com.au"
              value={form.email} onChange={(e) => update('email', e.target.value)} required />

            <Input id="password" type="password" label="Password" placeholder="Min. 8 characters"
              value={form.password} onChange={(e) => update('password', e.target.value)}
              minLength={8} required />

            <hr className="border-slate-200" />

            <Input id="clubName" label="Club name" placeholder="North Brisbane FC"
              value={form.clubName} onChange={(e) => update('clubName', e.target.value)} required />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sport" className="text-sm font-medium text-slate-700">Sport</label>
                <select
                  id="sport"
                  value={form.sport}
                  onChange={(e) => update('sport', e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {SPORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="state" className="text-sm font-medium text-slate-700">State</label>
                <select
                  id="state"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input id="city" label="City / Suburb" placeholder="Brisbane"
              value={form.city} onChange={(e) => update('city', e.target.value)} required />

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create free account
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Free forever up to 15 athletes. No credit card required.
          </p>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
