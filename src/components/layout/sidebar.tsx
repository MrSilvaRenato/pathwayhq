'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Calendar,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Shield,
  Baby,
  Dumbbell,
  Megaphone,
  HandHeart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/types'
import { NotificationBell } from './notification-bell'

const COACH_NAV = [
  { name: 'Dashboard',      href: '/dashboard',      icon: LayoutDashboard },
  { name: 'Athletes',       href: '/athletes',       icon: Users },
  { name: 'Squads',         href: '/squad',          icon: CalendarDays },
  { name: 'Calendar',       href: '/calendar',       icon: Calendar },
  { name: 'Announcements',  href: '/announcements',  icon: Megaphone },
  { name: 'Volunteering',   href: '/volunteering',   icon: HandHeart },
  { name: 'Milestones',     href: '/milestones',     icon: Trophy },
  { name: 'Analytics',      href: '/analytics',      icon: BarChart3 },
  { name: 'Settings',       href: '/settings',       icon: Settings },
]

const ADMIN_NAV = [
  ...COACH_NAV,
  { name: 'Club Admin', href: '/admin', icon: Shield },
]

const PARENT_NAV = [
  { name: 'My Child',       href: '/parent',         icon: Baby },
  { name: 'Announcements',  href: '/announcements',  icon: Megaphone },
  { name: 'Calendar',       href: '/calendar',       icon: Calendar },
  { name: 'Volunteering',   href: '/volunteering',   icon: HandHeart },
  { name: 'Settings',       href: '/settings',       icon: Settings },
]

const ATHLETE_NAV = [
  { name: 'My Dashboard',   href: '/athlete',        icon: Dumbbell },
  { name: 'Announcements',  href: '/announcements',  icon: Megaphone },
  { name: 'Calendar',       href: '/calendar',       icon: Calendar },
  { name: 'Settings',       href: '/settings',       icon: Settings },
]

interface Props {
  role: UserRole
  userName: string
}

export function Sidebar({ role, userName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navigation =
    role === 'club_admin' ? ADMIN_NAV :
    role === 'parent'     ? PARENT_NAV :
    role === 'athlete'    ? ATHLETE_NAV :
    COACH_NAV

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900">PathwayHQ</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User + notifications + sign out */}
      <div className="border-t border-slate-200 p-3 space-y-1">
        {userName && (
          <div className="flex items-center justify-between px-3 py-1.5">
            <div>
              <p className="text-xs font-medium text-slate-700 truncate">{userName}</p>
              <p className="text-xs text-slate-400 capitalize">{role.replace('_', ' ')}</p>
            </div>
            <NotificationBell />
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
