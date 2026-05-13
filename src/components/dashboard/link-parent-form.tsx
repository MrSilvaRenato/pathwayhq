'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserCheck } from 'lucide-react'

interface Props {
  athleteId: string
  currentParentId: string | null
  currentParentName?: string
}

export function LinkParentForm({ athleteId, currentParentId, currentParentName }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Find profile by email within the same club
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (!profile) {
      setError('No account found with that email. Make sure they have accepted their invite first.')
      setLoading(false)
      return
    }

    if (profile.role !== 'parent') {
      setError(`${profile.full_name} has role "${profile.role}", not "parent". Only parent accounts can be linked to athletes.`)
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('athletes')
      .update({ parent_id: profile.id })
      .eq('id', athleteId)

    if (updateError) { setError(updateError.message); setLoading(false); return }

    setSuccess(`${profile.full_name} linked as parent.`)
    setEmail('')
    setLoading(false)
    router.refresh()
  }

  async function handleUnlink() {
    setLoading(true)
    await supabase.from('athletes').update({ parent_id: null }).eq('id', athleteId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {currentParentId && currentParentName && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">{currentParentName}</span>
          </div>
          <button
            onClick={handleUnlink}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Unlink
          </button>
        </div>
      )}

      {!currentParentId && (
        <form onSubmit={handleLink} className="space-y-2">
          <Input
            type="email"
            label="Parent email address"
            placeholder="parent@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button type="submit" loading={loading} size="sm" className="w-full">
            Link parent
          </Button>
        </form>
      )}
    </div>
  )
}
