import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <BarChart3 className="h-12 w-12 text-slate-300" />
      <h2 className="mt-4 text-lg font-semibold text-slate-700">Analytics coming soon</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-sm">
        Club-wide retention rates, FTEM distribution trends, and dropout risk signals will appear here once you have athletes and sessions logged.
      </p>
    </div>
  )
}
