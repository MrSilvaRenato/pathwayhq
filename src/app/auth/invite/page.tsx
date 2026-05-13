'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

type InviteState = 'loading' | 'valid' | 'invalid' | 'expired'

interface Invite {
  id: string
  email: string
  role: string
  club_id: string
  token: string
  expires_at: string
}

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()

  const [inviteState, setInviteState] = useState<InviteState>('loading')
  const [invite, setInvite] = useState<Invite | null>(null)
  const [clubName, setClubName] = useState('')
  const [form, setForm] = useState({ fullName: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setInviteState('invalid'); return }

    async function loadInvite() {
      const { data } = await supabase
        .from('invites')
        .select('*, clubs(name)')
        .eq('token', token)
        .is('accepted_at', null)
        .single()

      if (!data) { setInviteState('invalid'); return }
      if (new Date(data.expires_at) < new Date()) { setInviteState('expired'); return }

      setInvite(data)
      setClubName((data as any).clubs?.name ?? '')
      setInviteState('valid')
    }

    loadInvite()
  }, [token])

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault()
    if (!invite) return
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signUp({
      email: invite.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role: invite.role,
          club_id: invite.club_id,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Mark invite as accepted
    await supabase
      .from('invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id)

    router.push('/dashboard')
    router.refresh()
  }

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
          {inviteState === 'loading' && (
            <p className="text-center text-sm text-slate-500">Checking your invite...</p>
          )}

          {inviteState === 'invalid' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <XCircle className="h-10 w-10 text-red-400" />
              <h2 className="font-semibold text-slate-800">Invalid invite</h2>
              <p className="text-sm text-slate-500">This invite link is invalid or has already been used.</p>
              <Link href="/auth/login" className="text-sm text-emerald-600 hover:underline">Go to login</Link>
            </div>
          )}

          {inviteState === 'expired' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <XCircle className="h-10 w-10 text-amber-400" />
              <h2 className="font-semibold text-slate-800">Invite expired</h2>
              <p className="text-sm text-slate-500">This invite link has expired. Ask your club admin to send a new one.</p>
            </div>
          )}

          {inviteState === 'valid' && invite && (
            <>
              <div className="mb-6 text-center">
                <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
                <h2 className="text-lg font-semibold text-slate-900">You&apos;re invited!</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Join <strong>{clubName}</strong> as a{' '}
                  <span className="capitalize font-medium">{invite.role.replace('_', ' ')}</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">{invite.email}</p>
              </div>

              <form onSubmit={handleAccept} className="space-y-4">
                <Input
                  label="Your full name"
                  placeholder="Alex Smith"
                  value={form.fullName}
                  onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))}
                  required
                />
                <Input
                  type="password"
                  label="Create a password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  minLength={8}
                  required
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Create account &amp; join club
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
