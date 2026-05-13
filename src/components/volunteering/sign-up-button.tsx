'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Props {
  shiftId: string
  userId: string
  userName: string
  isSigned: boolean
  isFull: boolean
}

export function SignUpButton({ shiftId, userId, userName, isSigned, isFull }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [signed, setSigned] = useState(isSigned)

  async function toggle() {
    setLoading(true)
    if (signed) {
      await supabase.from('volunteer_signups').delete().eq('shift_id', shiftId).eq('user_id', userId)
      setSigned(false)
    } else {
      await supabase.from('volunteer_signups').insert({ shift_id: shiftId, user_id: userId, full_name: userName, email: '' })
      setSigned(true)
    }
    setLoading(false)
    router.refresh()
  }

  if (isFull && !signed) {
    return <span className="text-xs text-slate-400 shrink-0">Full</span>
  }

  return (
    <Button
      variant={signed ? 'secondary' : 'default'}
      loading={loading}
      onClick={toggle}
      className="shrink-0 text-xs px-3 py-1.5 h-auto"
    >
      {signed ? 'Cancel' : 'Sign up'}
    </Button>
  )
}
