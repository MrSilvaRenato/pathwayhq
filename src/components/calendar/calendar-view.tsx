'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, ChevronRight } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  event_type: string
  location: string | null
  starts_at: string
  ends_at: string
  is_all_day: boolean
  squad_id: string | null
  squads?: { name: string } | null
}

interface Props {
  events: Event[]
  isCoachOrAdmin: boolean
}

const TYPE_STYLES: Record<string, { color: string; label: string }> = {
  training:   { color: 'bg-blue-100 text-blue-700',   label: 'Training' },
  match:      { color: 'bg-red-100 text-red-700',     label: 'Match' },
  trial:      { color: 'bg-purple-100 text-purple-700', label: 'Trial' },
  tournament: { color: 'bg-amber-100 text-amber-700', label: 'Tournament' },
  social:     { color: 'bg-emerald-100 text-emerald-700', label: 'Social' },
  meeting:    { color: 'bg-slate-100 text-slate-700', label: 'Meeting' },
  other:      { color: 'bg-slate-100 text-slate-700', label: 'Other' },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })
}

function groupByDay(events: Event[]) {
  const groups: Record<string, Event[]> = {}
  for (const e of events) {
    const day = e.starts_at.split('T')[0]
    if (!groups[day]) groups[day] = []
    groups[day].push(e)
  }
  return groups
}

export function CalendarView({ events, isCoachOrAdmin }: Props) {
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-sm font-medium text-slate-600">No upcoming events</p>
        <p className="mt-1 text-xs text-slate-400">
          {isCoachOrAdmin ? 'Create your first event using the button above.' : 'No events scheduled yet.'}
        </p>
      </div>
    )
  }

  const grouped = groupByDay(events)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, dayEvents]) => (
        <div key={day}>
          <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {formatDay(day + 'T00:00:00')}
          </h2>
          <div className="space-y-2">
            {dayEvents.map((event) => {
              const style = TYPE_STYLES[event.event_type] ?? TYPE_STYLES.other
              const isPast = new Date(event.ends_at) < new Date()
              return (
                <Link key={event.id} href={`/calendar/${event.id}`}>
                  <div className={`flex items-center gap-4 rounded-xl border bg-white p-4 hover:shadow-sm transition-all ${isPast ? 'opacity-60' : 'hover:border-slate-300'}`}>
                    {/* Time strip */}
                    <div className="w-16 shrink-0 text-center">
                      {event.is_all_day ? (
                        <span className="text-xs font-medium text-slate-500">All day</span>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-slate-800">{formatTime(event.starts_at)}</p>
                          <p className="text-xs text-slate-400">{formatTime(event.ends_at)}</p>
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-0.5 self-stretch rounded-full bg-slate-100" />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={style.color}>{style.label}</Badge>
                        {/* @ts-ignore joined */}
                        {event.squads?.name && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="h-3 w-3" />
                            {/* @ts-ignore joined */}
                            {event.squads.name}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-slate-900 truncate">{event.title}</p>
                      {event.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
