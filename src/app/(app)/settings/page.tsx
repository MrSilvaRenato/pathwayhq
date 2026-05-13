import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditProfileForm } from '@/components/settings/edit-profile-form'
import { EditClubForm } from '@/components/settings/edit-club-form'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*, clubs(*)').single()

  const club = (profile as any)?.clubs ?? null
  const isAdmin = profile?.role === 'club_admin'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">Manage your account and club details.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
          </CardHeader>
          <CardContent>
            <EditProfileForm
              profileId={profile?.id ?? ''}
              initialName={profile?.full_name ?? ''}
              email={profile?.email ?? ''}
              role={profile?.role ?? 'coach'}
            />
          </CardContent>
        </Card>

        {/* Club details — only admin can edit */}
        {club && (
          <Card>
            <CardHeader>
              <CardTitle>Club details</CardTitle>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                <EditClubForm
                  clubId={club.id}
                  initialName={club.name}
                  initialCity={club.city}
                  initialState={club.state}
                  initialSport={club.sport}
                  subscriptionTier={club.subscription_tier}
                />
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Club name</span><span className="font-medium">{club.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Sport</span><span className="font-medium capitalize">{club.sport}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">State</span><span className="font-medium">{club.state}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">City</span><span className="font-medium">{club.city}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Plan</span><span className="font-medium capitalize">{club.subscription_tier}</span></div>
                  <p className="text-xs text-slate-400 pt-1">Only club admins can edit club details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
