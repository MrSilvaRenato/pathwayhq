'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Props {
  memberId: string
  memberName: string
}

export function RemoveMemberButton({ memberId, memberName }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRemove() {
    setLoading(true)
    await supabase.from('profiles').update({ club_id: null }).eq('id', memberId)
    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Remove {memberName}?</span>
        <Button size="sm" variant="danger" loading={loading} onClick={handleRemove}>
          Yes
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          No
        </Button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-slate-400 hover:text-red-500 transition-colors"
      title={`Remove ${memberName}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
