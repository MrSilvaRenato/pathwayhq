'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Check, X, HelpCircle } from 'lucide-react'

interface Props {
  eventId: string
  userId: string
  currentStatus: 'going' | 'not_going' | 'maybe' | null
}

const OPTIONS = [
  { value: 'going',     label: 'Going',     icon: Check,      active: 'bg-emerald-600 text-white hover:bg-emerald-700', inactive: 'text-slate-600 hover:bg-emerald-50' },
  { value: 'maybe',    label: 'Maybe',     icon: HelpCircle, active: 'bg-amber-500 text-white hover:bg-amber-600',    inactive: 'text-slate-600 hover:bg-amber-50' },
  { value: 'not_going', label: "Can't go",  icon: X,          active: 'bg-red-500 text-white hover:bg-red-600',       inactive: 'text-slate-600 hover:bg-red-50' },
] as const

export function RsvpButton({ eventId, userId, currentStatus }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleRsvp(newStatus: 'going' | 'not_going' | 'maybe') {
    setLoading(true)
    if (status === newStatus) {
      await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId)
      setStatus(null)
    } else {
      await supabase.from('event_rsvps').upsert({ event_id: eventId, user_id: userId, status: newStatus }, { onConflict: 'event_id,user_id' })
      setStatus(newStatus)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {OPTIONS.map(({ value, label, icon: Icon, active, inactive }) => (
        <button
          key={value}
          disabled={loading}
          onClick={() => handleRsvp(value)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${status === value ? active : inactive}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}
