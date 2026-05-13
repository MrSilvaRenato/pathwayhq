'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { week: string; sessions: number; avgAttendance: number }[]
}

export function AttendanceTrendChart({ data }: Props) {
  const hasData = data.some(d => d.sessions > 0)

  if (!hasData) {
    return <p className="py-8 text-center text-sm text-slate-400">No sessions logged yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} unit="%" domain={[0, 100]} />
        <Tooltip
          contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="sessions" name="Sessions" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.8} />
        <Line yAxisId="right" type="monotone" dataKey="avgAttendance" name="Attendance %" stroke="#10b981" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
