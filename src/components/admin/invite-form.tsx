'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserRole } from '@/types'

interface Props {
  clubId: string
  invitedBy: string
}

export function InviteForm({ clubId, invitedBy }: Props) {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('coach')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: existing } = await supabase
      .from('invites')
      .select('id')
      .eq('club_id', clubId)
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      setError('An invite for this email already exists.')
      setLoading(false)
      return
    }

    const token = crypto.randomUUID()
    const { error: inviteError } = await supabase.from('invites').insert({
      club_id: clubId,
      invited_by: invitedBy,
      email,
      role,
      token,
    })

    if (inviteError) {
      setError(inviteError.message)
      setLoading(false)
      return
    }

    const inviteLink = `${window.location.origin}/auth/invite?token=${token}`
    setSuccess(inviteLink)
    setEmail('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        label="Email address"
        placeholder="coach@club.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="coach">Coach</option>
          <option value="parent">Parent</option>
          <option value="club_admin">Club Admin</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {success && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 break-all">
          <p className="font-semibold mb-1">Invite link (share this):</p>
          <p className="font-mono">{success}</p>
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Generate invite link
      </Button>
    </form>
  )
}
