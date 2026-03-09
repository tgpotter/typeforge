import { useMemo, useState, useRef } from 'react'

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l',';'],
  ['z','x','c','v','b','n','m',',','.','/'],
]

// Visual row offsets to approximate a staggered keyboard layout
const ROW_OFFSETS_PX = [0, 11, 22]

const KEY_SIZE = 44
const KEY_GAP  = 6

// Minimum total IKI samples across all sessions before we assign a heat colour
const MIN_SAMPLES = 5

function median(arr) {
  if (!arr.length) return null
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// Aggregate all IKI samples per key across all sessions
function buildKeyStats(sessions) {
  const combined = {}
  for (const session of sessions) {
    if (!session.key_timings) continue
    for (const [key, ikis] of Object.entries(session.key_timings)) {
      if (!combined[key]) combined[key] = []
      combined[key].push(...ikis)
    }
  }
  const stats = {}
  for (const [key, ikis] of Object.entries(combined)) {
    stats[key] = { median: median(ikis), sampleCount: ikis.length }
  }
  return stats
}

// Per-session medians for a single key (for sparkline trend)
function sessionTrend(sessions, key) {
  return sessions
    .filter(s => s.key_timings?.[key]?.length >= 1)
    .map(s => median(s.key_timings[key]))
}

// Map a normalised t in [0,1] to an HSL colour (green → yellow → red)
function heatColor(t, alpha = 0.3) {
  const hue = Math.round(120 - t * 120)
  return `hsla(${hue}, 75%, 52%, ${alpha})`
}

function sparklinePoints(values, width, height) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default function KeyboardHeatmap({ sessions }) {
  const [hoveredKey, setHoveredKey] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const keyStats = useMemo(() => buildKeyStats(sessions), [sessions])

  // Colour scale anchored to distribution of keys that have sufficient data
  const { minMedian, maxMedian } = useMemo(() => {
    const vals = Object.values(keyStats)
      .filter(s => s.sampleCount >= MIN_SAMPLES)
      .map(s => s.median)
    if (vals.length < 2) return { minMedian: 0, maxMedian: 1 }
    return { minMedian: Math.min(...vals), maxMedian: Math.max(...vals) }
  }, [keyStats])

  function tForKey(key) {
    const stat = keyStats[key]
    if (!stat || stat.sampleCount < MIN_SAMPLES) return null
    const range = maxMedian - minMedian
    return range > 0 ? Math.max(0, Math.min(1, (stat.median - minMedian) / range)) : 0
  }

  function handleKeyEnter(e, key) {
    setHoveredKey(key)
    const rect          = e.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    setTooltipPos({
      x: rect.left - containerRect.left + KEY_SIZE / 2,
      y: rect.top  - containerRect.top,
    })
  }

  const hoveredStat  = hoveredKey ? keyStats[hoveredKey] : null
  const hoveredT     = hoveredKey ? tForKey(hoveredKey) : null
  const trend        = hoveredKey ? sessionTrend(sessions, hoveredKey) : []
  const trendPoints  = trend.length >= 2 ? sparklinePoints(trend, 110, 32) : null
  // Flip tooltip below the key when the key is near the top of the container
  // to prevent it from being clipped above the visible area
  const tooltipBelow = tooltipPos.y < 130

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Lexend', sans-serif" }}>Faster</span>
        <div style={{
          width: 80, height: 6, borderRadius: 3,
          background: 'linear-gradient(to right, hsla(120,75%,52%,0.7), hsla(60,75%,52%,0.7), hsla(0,75%,52%,0.7))',
        }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Lexend', sans-serif" }}>Slower</span>
      </div>

      {/* Keyboard rows */}
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: KEY_GAP, marginBottom: KEY_GAP, marginLeft: ROW_OFFSETS_PX[rowIdx] }}>
          {row.map(key => {
            const t = tForKey(key)
            const bg     = t !== null ? heatColor(t, 0.3)   : 'rgba(255,255,255,0.05)'
            const border = t !== null ? heatColor(t, 0.55)  : 'rgba(255,255,255,0.1)'
            return (
              <div
                key={key}
                onMouseEnter={e => handleKeyEnter(e, key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{
                  width:          KEY_SIZE,
                  height:         KEY_SIZE,
                  borderRadius:   8,
                  background:     bg,
                  border:         `1px solid ${border}`,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  cursor:         'default',
                  transition:     'background 0.2s, border-color 0.2s',
                  fontFamily:     "'JetBrains Mono', monospace",
                  fontSize:       13,
                  color:          '#fff',
                  userSelect:     'none',
                  flexShrink:     0,
                }}
              >
                {key}
              </div>
            )
          })}
        </div>
      ))}

      {/* Space bar row */}
      <div style={{ display: 'flex', marginLeft: ROW_OFFSETS_PX[2] + KEY_SIZE * 2 + KEY_GAP * 2 }}>
        {(() => {
          const key = ' '
          const t = tForKey(key)
          return (
            <div
              onMouseEnter={e => handleKeyEnter(e, key)}
              onMouseLeave={() => setHoveredKey(null)}
              style={{
                width:          KEY_SIZE * 5 + KEY_GAP * 4,
                height:         KEY_SIZE,
                borderRadius:   8,
                background:     t !== null ? heatColor(t, 0.3)  : 'rgba(255,255,255,0.05)',
                border:         `1px solid ${t !== null ? heatColor(t, 0.55) : 'rgba(255,255,255,0.1)'}`,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                cursor:         'default',
                transition:     'background 0.2s',
                fontFamily:     "'Lexend', sans-serif",
                fontSize:       9,
                color:          'rgba(255,255,255,0.3)',
                letterSpacing:  '0.12em',
                userSelect:     'none',
              }}
            >
              SPACE
            </div>
          )
        })()}
      </div>

      {/* Tooltip */}
      {hoveredKey && (
        <div style={{
          position:      'absolute',
          left:          tooltipPos.x,
          top:           tooltipBelow ? tooltipPos.y + KEY_SIZE + 8 : tooltipPos.y - 120,
          transform:     'translateX(-50%)',
          background:    'rgba(10,10,10,0.96)',
          border:        '1px solid rgba(255,255,255,0.12)',
          borderRadius:  10,
          padding:       '12px 16px',
          pointerEvents: 'none',
          zIndex:        20,
          minWidth:      140,
          textAlign:     'center',
        }}>
          <div style={{
            fontFamily:   "'JetBrains Mono', monospace",
            fontSize:     22,
            fontWeight:   700,
            color:        hoveredT !== null ? heatColor(hoveredT, 1) : '#fff',
            marginBottom: 8,
          }}>
            {hoveredKey === ' ' ? '⎵' : hoveredKey}
          </div>

          {hoveredStat && hoveredStat.sampleCount >= MIN_SAMPLES ? (
            <>
              <div style={{ fontSize: 11, fontFamily: "'Lexend', sans-serif", color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
                Median: <span style={{ color: '#fff', fontWeight: 600 }}>{Math.round(hoveredStat.median)}ms</span>
              </div>
              <div style={{ fontSize: 10, fontFamily: "'Lexend', sans-serif", color: 'rgba(255,255,255,0.25)', marginBottom: trendPoints ? 10 : 0 }}>
                {hoveredStat.sampleCount} samples
              </div>
              {trendPoints && (
                <svg width={110} height={32} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
                  <polyline
                    points={trendPoints}
                    fill="none"
                    stroke="#E8FF47"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </>
          ) : (
            <div style={{ fontSize: 10, fontFamily: "'Lexend', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
              Not enough data yet
            </div>
          )}
        </div>
      )}
    </div>
  )
}
