'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Copy, Check } from 'lucide-react'

interface Props {
  athleteId: string
  clubId: string
  athleteName: string
  alreadyClaimed: boolean
}

export function ClaimAthleteForm({ athleteId, clubId, athleteName, alreadyClaimed }: Props) {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    // Upsert claim token (one per athlete)
    const token = crypto.randomUUID()
    const { error: err } = await supabase
      .from('athlete_claim_tokens')
      .upsert({ athlete_id: athleteId, club_id: clubId, email, token, claimed_at: null },
        { onConflict: 'athlete_id' })

    if (err) { setError(err.message); setLoading(false); return }

    setLink(`${window.location.origin}/auth/claim?token=${token}`)
    setLoading(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (alreadyClaimed) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <Check className="h-4 w-4" />
        {athleteName} has claimed their account
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!link ? (
        <form onSubmit={handleGenerate} className="space-y-2">
          <Input
            type="email"
            label={`${athleteName}'s email`}
            placeholder="athlete@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" size="sm" loading={loading} className="w-full">
            <UserPlus className="mr-2 h-3.5 w-3.5" />
            Generate claim link
          </Button>
        </form>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Share this link with {athleteName}:</p>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <p className="flex-1 text-xs font-mono text-slate-600 truncate">{link}</p>
            <button onClick={copyLink} className="shrink-0 text-slate-400 hover:text-emerald-600 transition-colors">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400">Link expires in 30 days. Athlete creates their own password.</p>
          <button onClick={() => setLink('')} className="text-xs text-slate-400 hover:text-slate-600">
            Generate new link
          </button>
        </div>
      )}
    </div>
  )
}
