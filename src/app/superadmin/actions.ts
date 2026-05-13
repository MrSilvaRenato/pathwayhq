'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { SubscriptionTier } from '@/types'

const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)

export async function setClubTier(clubId: string, tier: SubscriptionTier) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !SUPERADMIN_EMAILS.includes(user.email ?? '')) {
    throw new Error('Unauthorized')
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('clubs')
    .update({ subscription_tier: tier })
    .eq('id', clubId)

  if (error) throw new Error(error.message)
  revalidatePath('/superadmin')
}
