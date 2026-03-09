import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts'
import { MODULE_META } from '../data/modules'

// Generic session line chart — used for both WPM and accuracy.
// Props:
//   sessions[]    — raw session records from PocketBase
//   dataKey       — 'wpm' | 'accuracy' (field to plot on y-axis)
//   label         — display name for the series
//   yDomain       — [min, max] for y-axis, optional
//   referenceLine — { value, label, color } for a horizontal reference line, optional
export default function SessionLineChart({ sessions, dataKey, label, yDomain, referenceLine }) {
  const [selectedModule, setSelectedModule] = useState(null)

  const practicedModuleIds = useMemo(
    () => [...new Set(sessions.map(s => s.module_id))],
    [sessions]
  )

  const chartData = useMemo(() => {
    const src = selectedModule
      ? sessions.filter(s => s.module_id === selectedModule)
      : sessions
    return src.map(s => ({
      date:  new Date(s.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: s[dataKey],
    }))
  }, [sessions, selectedModule, dataKey])

  const lineColor = selectedModule ? (MODULE_META[selectedModule]?.color ?? '#E8FF47') : '#E8FF47'

  return (
    <div>
      {/* Module filter pills */}
      {practicedModuleIds.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          <FilterPill label="All" active={selectedModule === null} color="#E8FF47" onClick={() => setSelectedModule(null)} />
          {practicedModuleIds.map(id => (
            <FilterPill
              key={id}
              label={MODULE_META[id]?.title ?? id}
              active={selectedModule === id}
              color={MODULE_META[id]?.color ?? '#E8FF47'}
              onClick={() => setSelectedModule(id)}
            />
          ))}
        </div>
      )}

      <div style={{
        background:   'rgba(255,255,255,0.03)',
        border:       '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding:      '20px 16px 12px',
      }}>
        <div style={{
          fontSize:      11,
          color:         'rgba(255,255,255,0.3)',
          letterSpacing: '0.12em',
          marginBottom:  16,
          paddingLeft:   8,
          fontFamily:    "'Lexend', sans-serif",
        }}>
          {label.toUpperCase()}
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.15)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: "'Lexend', sans-serif" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.15)"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: "'Lexend', sans-serif" }}
              tickLine={false}
              axisLine={false}
              domain={yDomain}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background:   'rgba(10,10,10,0.95)',
                border:       '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontFamily:   "'Lexend', sans-serif",
                fontSize:     11,
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}
              itemStyle={{ color: lineColor }}
              formatter={(value) => [value, label]}
            />
            {referenceLine && (
              <ReferenceLine
                y={referenceLine.value}
                stroke={referenceLine.color ?? '#E8FF47'}
                strokeDasharray="6 3"
                strokeOpacity={0.5}
                label={{
                  value:      referenceLine.label,
                  fill:       'rgba(255,255,255,0.3)',
                  fontSize:   9,
                  fontFamily: "'Lexend', sans-serif",
                  position:   'insideTopRight',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              name={label}
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function FilterPill({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background:    active ? `${color}18` : 'rgba(255,255,255,0.04)',
        border:        `1px solid ${active ? `${color}55` : 'rgba(255,255,255,0.1)'}`,
        borderRadius:  20,
        padding:       '3px 10px',
        cursor:        'pointer',
        fontSize:      10,
        color:         active ? color : 'rgba(255,255,255,0.4)',
        fontFamily:    "'Lexend', sans-serif",
        letterSpacing: '0.06em',
        transition:    'all 0.15s',
        whiteSpace:    'nowrap',
      }}
    >
      {label}
    </button>
  )
}
