'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { phase: string; count: number; color: string }[]
}

export function FtemDistributionChart({ data }: Props) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-slate-400">No athletes yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="phase" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
        <Tooltip
          formatter={(value: number) => [value, 'Athletes']}
          contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
