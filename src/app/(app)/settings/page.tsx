import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*, clubs(*)').single()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your club and account.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Club details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {/* @ts-ignore joined */}
            <div className="flex justify-between"><span className="text-slate-500">Club name</span><span className="font-medium">{(profile as any)?.clubs?.name}</span></div>
            {/* @ts-ignore joined */}
            <div className="flex justify-between"><span className="text-slate-500">Sport</span><span className="font-medium capitalize">{(profile as any)?.clubs?.sport}</span></div>
            {/* @ts-ignore joined */}
            <div className="flex justify-between"><span className="text-slate-500">State</span><span className="font-medium">{(profile as any)?.clubs?.state}</span></div>
            {/* @ts-ignore joined */}
            <div className="flex justify-between"><span className="text-slate-500">City</span><span className="font-medium">{(profile as any)?.clubs?.city}</span></div>
            {/* @ts-ignore joined */}
            <div className="flex justify-between"><span className="text-slate-500">Plan</span><span className="font-medium capitalize">{(profile as any)?.clubs?.subscription_tier}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-medium">{profile?.full_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium">{profile?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="font-medium capitalize">{profile?.role?.replace('_', ' ')}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
