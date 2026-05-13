'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { month: string; promotions: number }[]
}

export function PhaseProgressionChart({ data }: Props) {
  const hasData = data.some(d => d.promotions > 0)

  if (!hasData) {
    return <p className="py-8 text-center text-sm text-slate-400">No phase changes recorded yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <defs>
          <linearGradient id="promotionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
        <Tooltip
          formatter={(value: number) => [value, 'Phase promotions']}
          contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Area
          type="monotone"
          dataKey="promotions"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#promotionGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
