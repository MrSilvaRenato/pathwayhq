// ─── User Roles ───────────────────────────────────────────────────────────────

export type UserRole = 'club_admin' | 'coach' | 'parent'

// ─── FTEM Framework ───────────────────────────────────────────────────────────
// Australia's official AIS athlete development framework
// F1-F3: Foundations, T4-T6: Talent, E7-E9: Elite, M10: Mastery

export type FtemPhase =
  | 'F1' | 'F2' | 'F3'
  | 'T4' | 'T5' | 'T6'
  | 'E7' | 'E8' | 'E9'
  | 'M10'

export const FTEM_PHASES: Record<FtemPhase, { label: string; description: string; color: string }> = {
  F1: { label: 'Foundation 1', description: 'Learning fundamental movement skills', color: 'bg-emerald-100 text-emerald-800' },
  F2: { label: 'Foundation 2', description: 'Developing sport-specific skills', color: 'bg-emerald-200 text-emerald-800' },
  F3: { label: 'Foundation 3', description: 'Building sport competency', color: 'bg-emerald-300 text-emerald-900' },
  T4: { label: 'Talent 4', description: 'Entering structured training', color: 'bg-blue-100 text-blue-800' },
  T5: { label: 'Talent 5', description: 'Performance development', color: 'bg-blue-200 text-blue-800' },
  T6: { label: 'Talent 6', description: 'High performance preparation', color: 'bg-blue-300 text-blue-900' },
  E7: { label: 'Elite 7', description: 'Competing at elite level', color: 'bg-purple-100 text-purple-800' },
  E8: { label: 'Elite 8', description: 'Consistent elite performance', color: 'bg-purple-200 text-purple-800' },
  E9: { label: 'Elite 9', description: 'World-class performance', color: 'bg-purple-300 text-purple-900' },
  M10: { label: 'Mastery', description: 'Olympic / World Championship level', color: 'bg-amber-200 text-amber-900' },
}

// ─── Club ─────────────────────────────────────────────────────────────────────

export interface Club {
  id: string
  name: string
  sport: Sport
  state: AustralianState
  city: string
  logo_url?: string
  subscription_tier: SubscriptionTier
  created_at: string
}

// ─── Profile (extends Supabase auth.users) ────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  club_id: string
  avatar_url?: string
  created_at: string
}

// ─── Athlete ──────────────────────────────────────────────────────────────────

export interface Athlete {
  id: string
  club_id: string
  full_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  sport: Sport
  squad_id?: string
  ftem_phase: FtemPhase
  ftem_updated_at: string
  ftem_updated_by: string
  joined_club_at: string
  is_active: boolean
  parent_id?: string
  created_at: string
}

// ─── Squad ────────────────────────────────────────────────────────────────────

export interface Squad {
  id: string
  club_id: string
  name: string
  sport: Sport
  coach_id: string
  age_group?: string
  created_at: string
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  squad_id: string
  club_id: string
  coach_id: string
  date: string
  duration_minutes: number
  title: string
  notes?: string
  ftem_focus?: FtemPhase
  created_at: string
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface Attendance {
  id: string
  session_id: string
  athlete_id: string
  status: 'present' | 'absent' | 'late' | 'excused'
  created_at: string
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string
  athlete_id: string
  club_id: string
  recorded_by: string
  title: string
  description?: string
  achieved_at: string
  ftem_phase: FtemPhase
  is_shared_with_parent: boolean
  created_at: string
}

// ─── Coach Note ───────────────────────────────────────────────────────────────

export interface CoachNote {
  id: string
  athlete_id: string
  coach_id: string
  content: string
  is_private: boolean
  created_at: string
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type Sport =
  | 'soccer'
  | 'swimming'
  | 'athletics'
  | 'gymnastics'
  | 'rowing'
  | 'cycling'
  | 'hockey'
  | 'triathlon'
  | 'basketball'
  | 'netball'
  | 'rugby'
  | 'other'

export type AustralianState = 'QLD' | 'NSW' | 'VIC' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT'

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'elite'

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, { label: string; price: number; athlete_limit: number }> = {
  free:    { label: 'Free',    price: 0,   athlete_limit: 15  },
  starter: { label: 'Starter', price: 79,  athlete_limit: 75  },
  growth:  { label: 'Growth',  price: 199, athlete_limit: 300 },
  elite:   { label: 'Elite',   price: 399, athlete_limit: 9999 },
}
