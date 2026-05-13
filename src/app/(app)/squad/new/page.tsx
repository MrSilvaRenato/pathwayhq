'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewSquadPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    sport: 'soccer',
    age_group: '',
  })

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
      setError('Could not load your profile.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('squads').insert({
      club_id: profile.club_id,
      name: form.name,
      sport: form.sport,
      age_group: form.age_group || null,
      coach_id: profile.id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/squad')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <Link href="/squad" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to squads
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New squad</h1>
        <p className="mt-1 text-sm text-slate-500">Group athletes into training squads.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Squad details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Squad name"
              placeholder="U12 Boys, Senior Women, Development Squad..."
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />

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
                id="age_group"
                label="Age group (optional)"
                placeholder="U12, U15, Senior..."
                value={form.age_group}
                onChange={(e) => update('age_group', e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading}>Create squad</Button>
              <Link href="/squad"><Button type="button" variant="secondary">Cancel</Button></Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
