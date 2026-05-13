'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FTEM_PHASES, type FtemPhase, type Sport } from '@/types'
import { ArrowLeft } from 'lucide-react'

const FTEM_PHASE_KEYS = Object.keys(FTEM_PHASES) as FtemPhase[]

export default function NewAthletePage() {
  const router = useRouter()
  const supabase = createClient()

  const [squads, setSquads] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    sport: 'soccer' as Sport,
    squad_id: '',
    ftem_phase: 'F1' as FtemPhase,
    joined_club_at: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    async function loadSquads() {
      const { data } = await supabase.from('squads').select('id, name').order('name')
      setSquads(data ?? [])
    }
    loadSquads()
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: profile } = await supabase
      .from('profiles')
      .select('club_id, id')
      .single()

    if (!profile) {
      setError('Could not load your profile. Please refresh.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('athletes').insert({
      club_id: profile.club_id,
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      sport: form.sport,
      squad_id: form.squad_id || null,
      ftem_phase: form.ftem_phase,
      ftem_updated_by: profile.id,
      joined_club_at: form.joined_club_at,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Log initial FTEM phase in history
    const { data: newAthlete } = await supabase
      .from('athletes')
      .select('id')
      .eq('club_id', profile.club_id)
      .eq('full_name', form.full_name)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (newAthlete) {
      await supabase.from('ftem_history').insert({
        athlete_id: newAthlete.id,
        from_phase: null,
        to_phase: form.ftem_phase,
        changed_by: profile.id,
        note: 'Initial phase on registration',
      })
    }

    router.push('/athletes')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/athletes"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to athletes
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add athlete</h1>
        <p className="mt-1 text-sm text-slate-500">Register a new athlete and assign their starting FTEM phase.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="full_name"
              label="Full name"
              placeholder="Jamie Smith"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="date_of_birth"
                type="date"
                label="Date of birth"
                value={form.date_of_birth}
                onChange={(e) => update('date_of_birth', e.target.value)}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gender" className="text-sm font-medium text-slate-700">Gender</label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sport" className="text-sm font-medium text-slate-700">Sport</label>
                <select
                  id="sport"
                  value={form.sport}
                  onChange={(e) => update('sport', e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="soccer">Soccer / Football</option>
                  <option value="swimming">Swimming</option>
                  <option value="athletics">Athletics</option>
                  <option value="gymnastics">Gymnastics</option>
                  <option value="rowing">Rowing</option>
                  <option value="cycling">Cycling</option>
                  <option value="hockey">Hockey</option>
                  <option value="triathlon">Triathlon</option>
                  <option value="basketball">Basketball</option>
                  <option value="netball">Netball</option>
                  <option value="rugby">Rugby</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Input
                id="joined_club_at"
                type="date"
                label="Joined club"
                value={form.joined_club_at}
                onChange={(e) => update('joined_club_at', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Squad & FTEM */}
        <Card>
          <CardHeader>
            <CardTitle>Development pathway</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="squad_id" className="text-sm font-medium text-slate-700">
                Squad <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <select
                id="squad_id"
                value={form.squad_id}
                onChange={(e) => update('squad_id', e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">No squad assigned</option>
                {squads.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {squads.length === 0 && (
                <p className="text-xs text-slate-400">
                  No squads yet.{' '}
                  <Link href="/squad/new" className="text-emerald-600 hover:underline">Create a squad first.</Link>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ftem_phase" className="text-sm font-medium text-slate-700">
                Starting FTEM phase
              </label>
              <select
                id="ftem_phase"
                value={form.ftem_phase}
                onChange={(e) => update('ftem_phase', e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {FTEM_PHASE_KEYS.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase} — {FTEM_PHASES[phase].label}: {FTEM_PHASES[phase].description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400">
                Based on the AIS FTEM framework. You can update this as the athlete develops.
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Add athlete
          </Button>
          <Link href="/athletes">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
