import { createAdminClient } from '@/lib/supabase/admin'
import { SPORTS, SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/types'
import { Shield, Users, Building2, Dumbbell } from 'lucide-react'
import { setClubTier } from './actions'
import { formatDate } from '@/lib/utils'

const TIER_COLORS: Record<string, string> = {
  free:    'bg-slate-100 text-slate-600',
  starter: 'bg-blue-100 text-blue-700',
  growth:  'bg-emerald-100 text-emerald-700',
  elite:   'bg-purple-100 text-purple-700',
}

export default async function SuperadminPage() {
  const admin = createAdminClient()

  const [{ data: clubStats }, { count: totalMembers }, { count: totalAthletes }] =
    await Promise.all([
      admin.rpc('club_stats'),
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin.from('athletes').select('*', { count: 'exact', head: true }),
    ])

  const clubs = (clubStats ?? []) as {
    id: string
    name: string
    sport: string
    state: string
    city: string
    subscription_tier: string
    created_at: string
    member_count: number
    athlete_count: number
  }[]

  const totalClubs = clubs.length

  const sportMeta = (val: string) => SPORTS.find(s => s.value === val)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PathwayHQ Admin</h1>
            <p className="text-sm text-slate-500">Platform overview — all clubs and members</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-3 gap-5">
          <StatCard icon={<Building2 className="h-5 w-5 text-emerald-600" />} label="Total clubs" value={totalClubs} color="bg-emerald-50" />
          <StatCard icon={<Users className="h-5 w-5 text-blue-600" />} label="Total members" value={totalMembers ?? 0} color="bg-blue-50" />
          <StatCard icon={<Dumbbell className="h-5 w-5 text-purple-600" />} label="Total athletes" value={totalAthletes ?? 0} color="bg-purple-50" />
        </div>

        {/* Clubs table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-800">All clubs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Club</th>
                  <th className="px-4 py-3">Sport</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Athletes</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clubs.map(club => {
                  const meta = sportMeta(club.sport)
                  return (
                    <tr key={club.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-800">{club.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {meta ? `${meta.emoji} ${meta.label}` : club.sport}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{club.city}, {club.state}</td>
                      <td className="px-4 py-3 text-slate-600">{club.member_count}</td>
                      <td className="px-4 py-3 text-slate-600">{club.athlete_count}</td>
                      <td className="px-4 py-3">
                        <TierSelect clubId={club.id} current={club.subscription_tier as SubscriptionTier} />
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatDate(club.created_at.split('T')[0])}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {clubs.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-slate-400">No clubs yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  )
}

function TierSelect({ clubId, current }: { clubId: string; current: SubscriptionTier }) {
  const tiers = Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, { label: string }][]

  return (
    <form
      action={async (fd: FormData) => {
        'use server'
        const tier = fd.get('tier') as SubscriptionTier
        await setClubTier(clubId, tier)
      }}
      className="flex items-center gap-2"
    >
      <select
        name="tier"
        defaultValue={current}
        className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${TIER_COLORS[current]}`}
      >
        {tiers.map(([val, { label }]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        Save
      </button>
    </form>
  )
}
