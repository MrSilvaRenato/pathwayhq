'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, CheckCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  body: string | null
  type: string
  link: string | null
  is_read: boolean
  created_at: string
}

const TYPE_COLORS: Record<string, string> = {
  milestone:    'bg-amber-100 text-amber-700',
  phase_update: 'bg-emerald-100 text-emerald-700',
  session:      'bg-blue-100 text-blue-700',
  announcement: 'bg-purple-100 text-purple-700',
  info:         'bg-slate-100 text-slate-700',
}

export function NotificationBell() {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data ?? [])
    setLoading(false)
  }

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (!unreadIds.length) return
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) loadNotifications() }}
        className="relative flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-10 left-0 z-40 w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 transition-colors">
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && <p className="px-4 py-6 text-center text-sm text-slate-400">Loading...</p>}
              {!loading && notifications.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                >
                  {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                  {n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[n.type] ?? TYPE_COLORS.info}`}>
                        {n.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                    {n.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-slate-400 mt-1">{formatDate(n.created_at.split('T')[0])}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
