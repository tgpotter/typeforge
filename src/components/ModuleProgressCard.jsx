import { MODULE_META } from '../data/modules'

function relativeDate(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function ModuleProgressCard({ module: mod, progress }) {
  const meta   = MODULE_META[mod.id]
  const hasData = !!progress

  return (
    <div style={{
      background:    'rgba(255,255,255,0.03)',
      border:        `1px solid ${hasData ? `${mod.color}28` : 'rgba(255,255,255,0.06)'}`,
      borderRadius:  16,
      padding:       '20px',
      opacity:       hasData ? 1 : 0.45,
      transition:    'border-color 0.2s, opacity 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 9, color: mod.color, letterSpacing: '0.16em', fontFamily: "'Lexend', sans-serif", marginBottom: 4 }}>
            MODULE {mod.number}
          </div>
          <div style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.2 }}>
            {mod.title}
          </div>
        </div>
        <div style={{ fontSize: 20 }}>{mod.icon}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <MiniStat label="WPM"      value={progress?.best_wpm ?? '—'} color={mod.color} />
        <MiniStat label="Accuracy" value={progress?.best_accuracy != null ? `${Math.round(progress.best_accuracy)}%` : '—'} color={mod.color} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasData ? 10 : 0 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Lexend', sans-serif" }}>
          {progress?.lessons_completed != null
            ? `${progress.lessons_completed} / ${meta?.lessonCount ?? '?'} lessons`
            : 'Not started'}
        </div>
        {progress?.last_practiced && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: "'Lexend', sans-serif", letterSpacing: '0.06em' }}>
            {relativeDate(progress.last_practiced)}
          </div>
        )}
      </div>

      {hasData && (
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
          <div style={{
            height:       '100%',
            width:        `${Math.min(100, ((progress.lessons_completed ?? 0) / (meta?.lessonCount || 1)) * 100)}%`,
            background:   mod.color,
            borderRadius: 1,
          }} />
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', fontFamily: "'Lexend', sans-serif", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}
