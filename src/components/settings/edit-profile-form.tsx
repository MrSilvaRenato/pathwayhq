'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserRole } from '@/types'

interface Props {
  profileId: string
  initialName: string
  email: string
  role: UserRole
}

const ROLE_LABELS: Record<UserRole, string> = {
  club_admin: 'Club Admin',
  coach: 'Coach',
  parent: 'Parent',
  athlete: 'Athlete',
}

export function EditProfileForm({ profileId, initialName, email, role }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')

    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('id', profileId)

    if (err) { setError(err.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <p className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{email}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Role</label>
          <p className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{ROLE_LABELS[role]}</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">Profile updated.</p>}

      <Button type="submit" loading={loading} disabled={name.trim() === initialName}>
        Save changes
      </Button>
    </form>
  )
}
