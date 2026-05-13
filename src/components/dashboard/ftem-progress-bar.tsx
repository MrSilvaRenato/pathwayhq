import { FTEM_PHASES, type FtemPhase } from '@/types'
import { cn } from '@/lib/utils'

const PHASES = Object.keys(FTEM_PHASES) as FtemPhase[]

interface FtemProgressBarProps {
  currentPhase: string
}

export function FtemProgressBar({ currentPhase }: FtemProgressBarProps) {
  const currentIndex = PHASES.indexOf(currentPhase as FtemPhase)

  return (
    <div className="flex items-center gap-1">
      {PHASES.map((phase, i) => {
        const isCurrent = phase === currentPhase
        const isPast = i < currentIndex
        const phaseInfo = FTEM_PHASES[phase]

        return (
          <div key={phase} className="group relative flex-1">
            <div
              className={cn(
                'h-6 rounded transition-all flex items-center justify-center',
                isCurrent && 'ring-2 ring-offset-1 ring-emerald-500',
                isPast ? 'bg-emerald-200' : isCurrent ? 'bg-emerald-500' : 'bg-slate-100'
              )}
            >
              <span className={cn(
                'text-xs font-semibold',
                isCurrent ? 'text-white' : isPast ? 'text-emerald-700' : 'text-slate-400'
              )}>
                {phase}
              </span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-slate-800 px-2 py-1 text-xs text-white whitespace-nowrap group-hover:block z-10">
              {phaseInfo.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
