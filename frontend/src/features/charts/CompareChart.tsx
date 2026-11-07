import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Row } from '../squad/rows'

const axis = { stroke: '#A58E91', fontSize: 12 }
const tooltip = { background: '#2B0A10', border: '1px solid #5A0F1C', color: '#F2E8E6' }

/** The ticked players in the selected mode and period: SR1 rating (left axis) and kills per spawn (right axis). */
export default function CompareChart({ rows }: { rows: Row[] }) {
  const data = rows.map((r) => ({ name: r.name, rating: r.stats?.rating ?? null, kps: r.stats?.killsPerSpawn ?? null }))
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#3E0D17" vertical={false} />
          <XAxis dataKey="name" {...axis} />
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
