import { createClient } from '@/lib/supabase/server'
import { Megaphone, Pin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CreateAnnouncementButton } from '@/components/announcements/create-announcement-button'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'Everyone',
  coaches: 'Coaches & Admins',
  parents: 'Parents & Athletes',
  athletes: 'Athletes only',
  squad: 'Squad',
}

export default async function AnnouncementsPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, club_id')
    .single()

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, profiles!announcements_author_id_fkey(full_name)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const isCoachOrAdmin = profile?.role === 'club_admin' || profile?.role === 'coach'

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">Club-wide updates and notices.</p>
        </div>
        {isCoachOrAdmin && (
          <CreateAnnouncementButton
            clubId={profile!.club_id!}
            createdBy={profile!.id}
          />
        )}
      </div>

      {!announcements?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-slate-600">No announcements yet</p>
          {isCoachOrAdmin && (
            <p className="mt-1 text-xs text-slate-400">Post your first announcement above.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={`rounded-xl border bg-white p-5 ${a.is_pinned ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {a.is_pinned && (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                    <Badge className="bg-slate-100 text-slate-600 text-xs">
                      {AUDIENCE_LABEL[a.audience] ?? a.audience}
                    </Badge>
                  </div>
                  <h2 className="font-semibold text-slate-900">{a.title}</h2>
                  {a.body && (
                    <p className="mt-1.5 text-sm text-slate-600 whitespace-pre-line">{a.body}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                {/* @ts-ignore joined */}
                <span>{a.profiles?.full_name ?? 'Coach'}</span>
                <span>·</span>
                <span>{timeAgo(a.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
