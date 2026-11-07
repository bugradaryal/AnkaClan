import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ModeStats } from '../../data/types'

const axis = { stroke: '#A58E91', fontSize: 12 }
const tooltip = { background: '#2B0A10', border: '1px solid #5A0F1C', color: '#F2E8E6' }

/** One mode of one player: SR1 rating (left axis) and kills per spawn (right axis), Total next to Monthly. */
export default function ModeChart({ total, monthly }: { total?: ModeStats; monthly?: ModeStats }) {
  const data = [
    { period: 'Total', rating: total?.rating ?? null, kps: total?.killsPerSpawn ?? null },
    { period: 'Monthly', rating: monthly?.rating ?? null, kps: monthly?.killsPerSpawn ?? null },
  ].filter((d) => d.rating !== null || d.kps !== null)

  if (data.length === 0) return <p className="mt-2 text-sm text-mute">No values to chart for this mode.</p>

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#3E0D17" vertical={false} />
          <XAxis dataKey="period" {...axis} />
          <YAxis yAxisId="rating" {...axis} />
          <YAxis yAxisId="kps" orientation="right" {...axis} />
          <Tooltip
            contentStyle={tooltip}
            cursor={{ fill: '#3E0D17' }}
            formatter={(v, name) => (typeof v === 'number' ? (name === 'Kills/spawn' ? v.toFixed(2) : Math.round(v)) : v)}
          />
          <Legend />
          <Bar yAxisId="rating" dataKey="rating" name="SR1 rating" fill="#D3283F" />
          <Bar yAxisId="kps" dataKey="kps" name="Kills/spawn" fill="#A58E91" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
