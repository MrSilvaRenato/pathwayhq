import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { InviteForm } from '@/components/admin/invite-form'
import { RemoveMemberButton } from '@/components/admin/remove-member-button'
import { Shield, Users, Mail } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clubs(name)')
    .single()

  if (!profile || profile.role !== 'club_admin') {
    redirect('/dashboard')
  }

  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('club_id', profile.club_id)
      .order('created_at'),
    supabase
      .from('invites')
      .select('id, email, role, expires_at')
      .eq('club_id', profile.club_id)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
  ])

  const roleColors: Record<string, string> = {
    club_admin: 'bg-purple-100 text-purple-700',
    coach: 'bg-blue-100 text-blue-700',
    parent: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Club Admin</h1>
        </div>
        {/* @ts-ignore joined */}
        <p className="mt-1 text-sm text-slate-500">Manage members and access for {(profile as any)?.clubs?.name}.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Invite form */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Invite someone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InviteForm clubId={profile.club_id!} invitedBy={profile.id} />
            </CardContent>
          </Card>

          {/* Pending invites */}
          {!!invites?.length && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Pending invites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-700">{inv.email}</p>
                      <p className="text-xs text-slate-400 capitalize">{inv.role} · expires {formatDate(inv.expires_at.split('T')[0])}</p>
                    </div>
                    <Badge className={roleColors[inv.role]}>{inv.role}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Members table */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members ({members?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {members?.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {m.full_name}
                        {m.id === profile.id && (
                          <span className="ml-2 text-xs text-slate-400">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={roleColors[m.role]}>
                      {m.role.replace('_', ' ')}
                    </Badge>
                    {m.id !== profile.id && (
                      <RemoveMemberButton memberId={m.id} memberName={m.full_name} />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
