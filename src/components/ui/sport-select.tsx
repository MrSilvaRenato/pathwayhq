import { SPORTS_BY_CATEGORY, type Sport } from '@/types'

interface Props {
  value: Sport
  onChange: (value: Sport) => void
  id?: string
  showOlympicFilter?: boolean
  className?: string
}

export function SportSelect({ value, onChange, id, className }: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as Sport)}
      className={className ?? 'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full'}
    >
      {Object.entries(SPORTS_BY_CATEGORY).map(([category, sports]) => (
        <optgroup key={category} label={category}>
          {sports.map((s) => (
            <option key={s.value} value={s.value}>
              {s.emoji} {s.label}{s.in2032 ? ' ★' : ''}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
