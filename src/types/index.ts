// ─── User Roles ───────────────────────────────────────────────────────────────

export type UserRole = 'club_admin' | 'coach' | 'parent' | 'athlete'

// ─── FTEM Framework ───────────────────────────────────────────────────────────

export type FtemPhase =
  | 'F1' | 'F2' | 'F3'
  | 'T4' | 'T5' | 'T6'
  | 'E7' | 'E8' | 'E9'
  | 'M10'

export const FTEM_PHASES: Record<FtemPhase, { label: string; description: string; color: string }> = {
  F1:  { label: 'Foundation 1', description: 'Learning fundamental movement skills',  color: 'bg-emerald-100 text-emerald-800' },
  F2:  { label: 'Foundation 2', description: 'Developing sport-specific skills',      color: 'bg-emerald-200 text-emerald-800' },
  F3:  { label: 'Foundation 3', description: 'Building sport competency',             color: 'bg-emerald-300 text-emerald-900' },
  T4:  { label: 'Talent 4',     description: 'Entering structured training',          color: 'bg-blue-100 text-blue-800' },
  T5:  { label: 'Talent 5',     description: 'Performance development',               color: 'bg-blue-200 text-blue-800' },
  T6:  { label: 'Talent 6',     description: 'High performance preparation',          color: 'bg-blue-300 text-blue-900' },
  E7:  { label: 'Elite 7',      description: 'Competing at elite level',              color: 'bg-purple-100 text-purple-800' },
  E8:  { label: 'Elite 8',      description: 'Consistent elite performance',          color: 'bg-purple-200 text-purple-800' },
  E9:  { label: 'Elite 9',      description: 'World-class performance',               color: 'bg-purple-300 text-purple-900' },
  M10: { label: 'Mastery',      description: 'Olympic / World Championship level',    color: 'bg-amber-200 text-amber-900' },
}

// ─── Sports ───────────────────────────────────────────────────────────────────

export type Sport =
  // Aquatics
  | 'swimming' | 'diving' | 'water_polo' | 'artistic_swimming' | 'marathon_swimming'
  // Athletics
  | 'athletics' | 'road_running' | 'race_walking'
  // Team sports
  | 'soccer' | 'basketball' | 'basketball_3x3' | 'volleyball' | 'beach_volleyball'
  | 'hockey' | 'handball' | 'rugby_sevens' | 'baseball' | 'softball'
  | 'cricket' | 'flag_football' | 'lacrosse'
  // Racquet
  | 'tennis' | 'table_tennis' | 'badminton' | 'squash'
  // Combat
  | 'boxing' | 'judo' | 'taekwondo' | 'wrestling' | 'fencing' | 'karate'
  // Gymnastics
  | 'artistic_gymnastics' | 'rhythmic_gymnastics' | 'trampoline' | 'acrobatic_gymnastics' | 'parkour'
  // Cycling
  | 'cycling_road' | 'cycling_track' | 'cycling_mountain' | 'cycling_bmx' | 'cycling_bmx_freestyle'
  // Water / paddle
  | 'rowing' | 'canoe_sprint' | 'canoe_slalom' | 'sailing' | 'surfing' | 'kayaking'
  // Multi-sport
  | 'triathlon' | 'modern_pentathlon'
  // Other Olympic
  | 'equestrian' | 'archery' | 'shooting' | 'weightlifting' | 'golf'
  | 'sport_climbing' | 'skateboarding' | 'breaking'
  // Australian popular
  | 'netball' | 'afl' | 'rugby_league' | 'touch_football'
  | 'other'

export interface SportMeta {
  value: Sport
  label: string
  category: string
  in2032: boolean
  emoji: string
}

export const SPORTS: SportMeta[] = [
  // Aquatics
  { value: 'swimming',             label: 'Swimming',              category: 'Aquatics',     in2032: true,  emoji: '🏊' },
  { value: 'diving',               label: 'Diving',                category: 'Aquatics',     in2032: true,  emoji: '🤿' },
  { value: 'water_polo',           label: 'Water Polo',            category: 'Aquatics',     in2032: true,  emoji: '🤽' },
  { value: 'artistic_swimming',    label: 'Artistic Swimming',     category: 'Aquatics',     in2032: true,  emoji: '🏊' },
  { value: 'marathon_swimming',    label: 'Marathon Swimming',     category: 'Aquatics',     in2032: true,  emoji: '🏊' },
  // Athletics
  { value: 'athletics',            label: 'Athletics',             category: 'Athletics',    in2032: true,  emoji: '🏃' },
  { value: 'road_running',         label: 'Road Running',          category: 'Athletics',    in2032: true,  emoji: '🏃' },
  { value: 'race_walking',         label: 'Race Walking',          category: 'Athletics',    in2032: true,  emoji: '🚶' },
  // Team sports
  { value: 'soccer',               label: 'Soccer / Football',     category: 'Team Sports',  in2032: true,  emoji: '⚽' },
  { value: 'basketball',           label: 'Basketball',            category: 'Team Sports',  in2032: true,  emoji: '🏀' },
  { value: 'basketball_3x3',       label: '3x3 Basketball',        category: 'Team Sports',  in2032: true,  emoji: '🏀' },
  { value: 'volleyball',           label: 'Volleyball',            category: 'Team Sports',  in2032: true,  emoji: '🏐' },
  { value: 'beach_volleyball',     label: 'Beach Volleyball',      category: 'Team Sports',  in2032: true,  emoji: '🏐' },
  { value: 'hockey',               label: 'Hockey',                category: 'Team Sports',  in2032: true,  emoji: '🏑' },
  { value: 'handball',             label: 'Handball',              category: 'Team Sports',  in2032: true,  emoji: '🤾' },
  { value: 'rugby_sevens',         label: 'Rugby Sevens',          category: 'Team Sports',  in2032: true,  emoji: '🏉' },
  { value: 'cricket',              label: 'Cricket T20',           category: 'Team Sports',  in2032: true,  emoji: '🏏' },
  { value: 'flag_football',        label: 'Flag Football',         category: 'Team Sports',  in2032: true,  emoji: '🏈' },
  { value: 'lacrosse',             label: 'Lacrosse',              category: 'Team Sports',  in2032: true,  emoji: '🥍' },
  { value: 'baseball',             label: 'Baseball',              category: 'Team Sports',  in2032: false, emoji: '⚾' },
  { value: 'softball',             label: 'Softball',              category: 'Team Sports',  in2032: false, emoji: '🥎' },
  // Racquet
  { value: 'tennis',               label: 'Tennis',                category: 'Racquet',      in2032: true,  emoji: '🎾' },
  { value: 'table_tennis',         label: 'Table Tennis',          category: 'Racquet',      in2032: true,  emoji: '🏓' },
  { value: 'badminton',            label: 'Badminton',             category: 'Racquet',      in2032: true,  emoji: '🏸' },
  { value: 'squash',               label: 'Squash',                category: 'Racquet',      in2032: true,  emoji: '🎱' },
  // Combat
  { value: 'boxing',               label: 'Boxing',                category: 'Combat',       in2032: true,  emoji: '🥊' },
  { value: 'judo',                 label: 'Judo',                  category: 'Combat',       in2032: true,  emoji: '🥋' },
  { value: 'taekwondo',            label: 'Taekwondo',             category: 'Combat',       in2032: true,  emoji: '🥋' },
  { value: 'wrestling',            label: 'Wrestling',             category: 'Combat',       in2032: true,  emoji: '🤼' },
  { value: 'fencing',              label: 'Fencing',               category: 'Combat',       in2032: true,  emoji: '🤺' },
  { value: 'karate',               label: 'Karate',                category: 'Combat',       in2032: false, emoji: '🥋' },
  // Gymnastics
  { value: 'artistic_gymnastics',  label: 'Artistic Gymnastics',   category: 'Gymnastics',   in2032: true,  emoji: '🤸' },
  { value: 'rhythmic_gymnastics',  label: 'Rhythmic Gymnastics',   category: 'Gymnastics',   in2032: true,  emoji: '🤸' },
  { value: 'trampoline',           label: 'Trampolining',          category: 'Gymnastics',   in2032: true,  emoji: '🤸' },
  { value: 'acrobatic_gymnastics', label: 'Acrobatic Gymnastics',  category: 'Gymnastics',   in2032: false, emoji: '🤸' },
  { value: 'parkour',              label: 'Parkour',               category: 'Gymnastics',   in2032: false, emoji: '🏃' },
  // Cycling
  { value: 'cycling_road',         label: 'Road Cycling',          category: 'Cycling',      in2032: true,  emoji: '🚴' },
  { value: 'cycling_track',        label: 'Track Cycling',         category: 'Cycling',      in2032: true,  emoji: '🚴' },
  { value: 'cycling_mountain',     label: 'Mountain Bike',         category: 'Cycling',      in2032: true,  emoji: '🚵' },
  { value: 'cycling_bmx',          label: 'BMX Racing',            category: 'Cycling',      in2032: true,  emoji: '🚴' },
  { value: 'cycling_bmx_freestyle',label: 'BMX Freestyle',         category: 'Cycling',      in2032: true,  emoji: '🚴' },
  // Water / paddle
  { value: 'rowing',               label: 'Rowing',                category: 'Water',        in2032: true,  emoji: '🚣' },
  { value: 'canoe_sprint',         label: 'Canoe Sprint',          category: 'Water',        in2032: true,  emoji: '🛶' },
  { value: 'canoe_slalom',         label: 'Canoe Slalom',          category: 'Water',        in2032: true,  emoji: '🛶' },
  { value: 'sailing',              label: 'Sailing',               category: 'Water',        in2032: true,  emoji: '⛵' },
  { value: 'surfing',              label: 'Surfing',               category: 'Water',        in2032: true,  emoji: '🏄' },
  { value: 'kayaking',             label: 'Kayaking',              category: 'Water',        in2032: false, emoji: '🛶' },
  // Multi-sport
  { value: 'triathlon',            label: 'Triathlon',             category: 'Multi-Sport',  in2032: true,  emoji: '🏊' },
  { value: 'modern_pentathlon',    label: 'Modern Pentathlon',     category: 'Multi-Sport',  in2032: true,  emoji: '🏇' },
  // Other Olympic
  { value: 'equestrian',           label: 'Equestrian',            category: 'Equestrian',   in2032: true,  emoji: '🏇' },
  { value: 'archery',              label: 'Archery',               category: 'Precision',    in2032: true,  emoji: '🏹' },
  { value: 'shooting',             label: 'Shooting',              category: 'Precision',    in2032: true,  emoji: '🎯' },
  { value: 'weightlifting',        label: 'Weightlifting',         category: 'Strength',     in2032: true,  emoji: '🏋️' },
  { value: 'golf',                 label: 'Golf',                  category: 'Precision',    in2032: true,  emoji: '⛳' },
  { value: 'sport_climbing',       label: 'Sport Climbing',        category: 'Urban',        in2032: true,  emoji: '🧗' },
  { value: 'skateboarding',        label: 'Skateboarding',         category: 'Urban',        in2032: true,  emoji: '🛹' },
  { value: 'breaking',             label: 'Breaking',              category: 'Urban',        in2032: false, emoji: '💃' },
  // Australian popular
  { value: 'netball',              label: 'Netball',               category: 'Australian',   in2032: false, emoji: '🏀' },
  { value: 'afl',                  label: 'Australian Football',   category: 'Australian',   in2032: false, emoji: '🏈' },
  { value: 'rugby_league',         label: 'Rugby League',          category: 'Australian',   in2032: false, emoji: '🏉' },
  { value: 'touch_football',       label: 'Touch Football',        category: 'Australian',   in2032: false, emoji: '🏉' },
  { value: 'other',                label: 'Other',                 category: 'Other',        in2032: false, emoji: '🏅' },
]

// Grouped for dropdowns
export const SPORTS_BY_CATEGORY = SPORTS.reduce<Record<string, SportMeta[]>>((acc, sport) => {
  if (!acc[sport.category]) acc[sport.category] = []
  acc[sport.category].push(sport)
  return acc
}, {})

export const OLYMPIC_SPORTS = SPORTS.filter(s => s.in2032)

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

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  club_id: string | null
  athlete_id: string | null
  avatar_url?: string
  created_at: string
}

// ─── Athlete ──────────────────────────────────────────────────────────────────

export interface Athlete {
  id: string
  club_id: string | null        // null for independent athletes
  full_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  sport: Sport
  squad_id?: string | null
  ftem_phase: FtemPhase
  ftem_updated_at: string
  ftem_updated_by: string | null
  joined_club_at: string
  is_active: boolean
  parent_id?: string | null
  created_at: string
}

// ─── Squad ────────────────────────────────────────────────────────────────────

export interface Squad {
  id: string
  club_id: string
  name: string
  sport: Sport
  coach_id: string | null
  age_group?: string | null
  created_at: string
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  squad_id: string
  club_id: string
  coach_id: string | null
  date: string
  duration_minutes: number
  title: string
  notes?: string | null
  ftem_focus?: FtemPhase | null
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
  club_id: string | null
  recorded_by: string | null
  title: string
  description?: string | null
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

export type AustralianState = 'QLD' | 'NSW' | 'VIC' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT'

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'elite'

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, { label: string; price: number; athlete_limit: number }> = {
  free:    { label: 'Free',    price: 0,   athlete_limit: 15   },
  starter: { label: 'Starter', price: 79,  athlete_limit: 75   },
  growth:  { label: 'Growth',  price: 199, athlete_limit: 300  },
  elite:   { label: 'Elite',   price: 399, athlete_limit: 9999 },
}
