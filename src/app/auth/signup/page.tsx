'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Users, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SportSelect } from '@/components/ui/sport-select'
import { FTEM_PHASES, type Sport, type AustralianState, type FtemPhase } from '@/types'

const FTEM_KEYS = Object.keys(FTEM_PHASES) as FtemPhase[]

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

type SignupMode = 'choose' | 'club' | 'athlete'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<SignupMode>('choose')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Club admin form
  const [clubForm, setClubForm] = useState({
    fullName: '', email: '', password: '',
    clubName: '', sport: 'soccer' as Sport,
    state: 'QLD' as AustralianState, city: '',
  })

  // Independent athlete form
  const [athleteForm, setAthleteForm] = useState({
    fullName: '', email: '', password: '',
    dateOfBirth: '', gender: 'male',
    sport: 'soccer' as Sport,
    ftemPhase: 'F1' as FtemPhase,
    state: 'QLD' as AustralianState,
  })

  function updateClub(field: string, value: string) {
    setClubForm(p => ({ ...p, [field]: value }))
  }
  function updateAthlete(field: string, value: string) {
    setAthleteForm(p => ({ ...p, [field]: value }))
  }

  async function handleClubSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const clubId = crypto.randomUUID()
    const { error: clubError } = await supabase.from('clubs').insert({
      id: clubId, name: clubForm.clubName, sport: clubForm.sport,
      state: clubForm.state, city: clubForm.city, subscription_tier: 'free',
    })
    if (clubError) { setError('Failed to create club.'); setLoading(false); return }

    const { error: authError } = await supabase.auth.signUp({
      email: clubForm.email, password: clubForm.password,
      options: { data: { full_name: clubForm.fullName, role: 'club_admin', club_id: clubId } },
    })
    if (authError) { setError(authError.message); setLoading(false); return }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleAthleteSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    // Create the athlete record first
    const athleteId = crypto.randomUUID()
    const { error: athleteError } = await supabase.from('athletes').insert({
      id: athleteId,
      club_id: null,
      full_name: athleteForm.fullName,
      date_of_birth: athleteForm.dateOfBirth,
      gender: athleteForm.gender,
      sport: athleteForm.sport,
      ftem_phase: athleteForm.ftemPhase,
      joined_club_at: new Date().toISOString().split('T')[0],
    })
    if (athleteError) { setError('Failed to create athlete profile.'); setLoading(false); return }

    // Sign up with athlete role + athlete_id in metadata
    const { error: authError } = await supabase.auth.signUp({
      email: athleteForm.email, password: athleteForm.password,
      options: {
        data: {
          full_name: athleteForm.fullName,
          role: 'athlete',
          club_id: null,
          athlete_id: athleteId,
        },
      },
    })
    if (authError) { setError(authError.message); setLoading(false); return }

    // Log initial FTEM
    await supabase.from('ftem_history').insert({
      athlete_id: athleteId, from_phase: null,
      to_phase: athleteForm.ftemPhase, note: 'Initial phase on registration',
    })

    router.push('/athlete')
    router.refresh()
  }

  if (mode === 'choose') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">PathwayHQ</h1>
            <p className="text-sm text-slate-500">Australia&apos;s athlete development platform</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">How are you joining?</h2>
            <p className="mb-6 text-sm text-slate-500">Choose the option that fits you best.</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('club')}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 p-6 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <div className="rounded-lg bg-emerald-100 p-3">
                  <Users className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">I run a club</p>
                  <p className="mt-1 text-xs text-slate-500">Set up your club, manage athletes, coaches and parents.</p>
                </div>
              </button>

              <button
                onClick={() => setMode('athlete')}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 p-6 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <div className="rounded-lg bg-blue-100 p-3">
                  <User className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">I&apos;m an athlete</p>
                  <p className="mt-1 text-xs text-slate-500">Track your own development independently. Join a club later.</p>
                </div>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">PathwayHQ</h1>
          <p className="text-sm text-slate-500">
            {mode === 'club' ? 'Set up your club account' : 'Create your athlete profile'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <button
            onClick={() => { setMode('choose'); setError('') }}
            className="mb-4 text-xs text-slate-400 hover:text-slate-600"
          >
            ← Back
          </button>

          {mode === 'club' ? (
            <form onSubmit={handleClubSignup} className="space-y-4">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Your account</h2>
              <Input label="Your full name" placeholder="Alex Smith"
                value={clubForm.fullName} onChange={e => updateClub('fullName', e.target.value)} required />
              <Input type="email" label="Email" placeholder="alex@yourclub.com.au"
                value={clubForm.email} onChange={e => updateClub('email', e.target.value)} required />
              <Input type="password" label="Password" placeholder="Min. 8 characters"
                value={clubForm.password} onChange={e => updateClub('password', e.target.value)} minLength={8} required />

              <hr className="border-slate-200" />
              <h2 className="text-base font-semibold text-slate-900">Club details</h2>

              <Input label="Club name" placeholder="North Brisbane FC"
                value={clubForm.clubName} onChange={e => updateClub('clubName', e.target.value)} required />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Sport</label>
                <SportSelect value={clubForm.sport} onChange={v => updateClub('sport', v)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">State</label>
                  <select value={clubForm.state} onChange={e => updateClub('state', e.target.value)}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <Input label="City / Suburb" placeholder="Brisbane"
                  value={clubForm.city} onChange={e => updateClub('city', e.target.value)} required />
              </div>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <Button type="submit" className="w-full" size="lg" loading={loading}>Create club account</Button>
              <p className="text-center text-xs text-slate-400">Free forever up to 15 athletes.</p>
            </form>
          ) : (
            <form onSubmit={handleAthleteSignup} className="space-y-4">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Your profile</h2>
              <Input label="Full name" placeholder="Jamie Smith"
                value={athleteForm.fullName} onChange={e => updateAthlete('fullName', e.target.value)} required />
              <Input type="email" label="Email" placeholder="jamie@email.com"
                value={athleteForm.email} onChange={e => updateAthlete('email', e.target.value)} required />
              <Input type="password" label="Password" placeholder="Min. 8 characters"
                value={athleteForm.password} onChange={e => updateAthlete('password', e.target.value)} minLength={8} required />

              <hr className="border-slate-200" />
              <h2 className="text-base font-semibold text-slate-900">Athletic profile</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Date of birth"
                  value={athleteForm.dateOfBirth} onChange={e => updateAthlete('dateOfBirth', e.target.value)} required />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Gender</label>
                  <select value={athleteForm.gender} onChange={e => updateAthlete('gender', e.target.value)}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Sport <span className="text-xs text-emerald-600 font-normal">★ = Brisbane 2032 Olympic sport</span>
                </label>
                <SportSelect value={athleteForm.sport} onChange={v => updateAthlete('sport', v)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Current FTEM phase</label>
                <select value={athleteForm.ftemPhase} onChange={e => updateAthlete('ftemPhase', e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {FTEM_KEYS.map(p => (
                    <option key={p} value={p}>{p} — {FTEM_PHASES[p].label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">Not sure? Start at F1 — you can update it anytime.</p>
              </div>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <Button type="submit" className="w-full" size="lg" loading={loading}>Create athlete account</Button>
              <p className="text-center text-xs text-slate-400">Free. Join a club anytime later.</p>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
