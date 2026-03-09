const MODULE_COLOR = '#FFB347'

// Displays a single weak character with its weakness type and a severity bar.
// severity: 0.0–1.0 (1.0 = worst in the current set)
export default function WeaknessKeyBadge({ char, label, severity }) {
  const filled = Math.ceil(severity * 5)

  return (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      gap:           12,
      background:    `${MODULE_COLOR}10`,
      border:        `1px solid ${MODULE_COLOR}${Math.round(40 + severity * 60).toString(16)}`,
      borderRadius:  10,
      padding:       '10px 14px',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize:   28,
        fontWeight: 700,
        color:      MODULE_COLOR,
        lineHeight: 1,
        minWidth:   24,
        textAlign:  'center',
      }}>
        {char === ' ' ? '⎵' : char}
      </div>

      <div>
        <div style={{
          fontSize:      9,
          color:         `${MODULE_COLOR}99`,
          letterSpacing: '0.14em',
          fontFamily:    "'Lexend', sans-serif",
          marginBottom:  4,
        }}>
          {label.toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              width:        10,
              height:       3,
              borderRadius: 1.5,
              background:   i < filled ? MODULE_COLOR : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
