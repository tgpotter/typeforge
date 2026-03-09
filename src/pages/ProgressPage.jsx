import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useProgressData } from '../hooks/useProgressData'
import { MODULES } from '../data/modules'
import SessionLineChart from '../components/SessionLineChart'
import ModuleProgressCard from '../components/ModuleProgressCard'
import KeyboardHeatmap from '../components/KeyboardHeatmap'
import ProgressSkeleton from '../components/ProgressSkeleton'

export default function ProgressPage() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const { sessions, moduleProgress, loading, error, refetch } = useProgressData()

  const totalMin    = useMemo(() => Math.round(sessions.reduce((acc, s) => acc + (s.duration_sec ?? 0), 0) / 60), [sessions])
  const bestWpm     = useMemo(() => moduleProgress.reduce((max, p) => Math.max(max, p.best_wpm      ?? 0), 0), [moduleProgress])
  const bestAccuracy= useMemo(() => moduleProgress.reduce((max, p) => Math.max(max, p.best_accuracy ?? 0), 0), [moduleProgress])
  const progressMap = useMemo(() => Object.fromEntries(moduleProgress.map(p => [p.module_id, p])), [moduleProgress])
  const hasData     = sessions.length > 0

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', fontFamily: "'Lexend', sans-serif" }}>
      {/* Grid background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 16px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: "'Lexend', sans-serif", fontSize: 12 }}>
          ← Home
        </button>
        <div style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
          PROGRESS
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
      </nav>

      {loading ? (
        <ProgressSkeleton />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Summary stats */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 56, flexWrap: 'wrap' }}>
            <SummaryCard label="Sessions"      value={sessions.length || '—'} />
            <SummaryCard label="Practice Time" value={totalMin > 0 ? `${totalMin}m` : '—'} />
            <SummaryCard label="Best WPM"      value={bestWpm || '—'} accent />
            <SummaryCard label="Best Accuracy" value={bestAccuracy ? `${Math.round(bestAccuracy)}%` : '—'} />
          </div>

          {hasData ? (
            <>
              {/* Performance charts */}
              <SectionLabel>Performance Over Time</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 56 }}>
                <SessionLineChart
                  sessions={sessions}
                  dataKey="wpm"
                  label="WPM"
                />
                <SessionLineChart
                  sessions={sessions}
                  dataKey="accuracy"
                  label="Accuracy (%)"
                  yDomain={[0, 100]}
                  referenceLine={{ value: 95, label: '95% target', color: '#E8FF47' }}
                />
              </div>

              {/* Keyboard heatmap */}
              <SectionLabel>Key Latency Heatmap</SectionLabel>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px', marginBottom: 56, overflowX: 'auto' }}>
                <KeyboardHeatmap sessions={sessions} />
              </div>
            </>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '56px 32px', textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24, lineHeight: 1.8 }}>
                No sessions yet — complete a lesson to see your progress here.
              </div>
              <button
                onClick={() => navigate('/')}
                style={{ background: '#E8FF47', border: 'none', borderRadius: 10, padding: '12px 28px', cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 14, color: '#000' }}
              >
                Start Training →
              </button>
            </div>
          )}

          {/* Module progress grid */}
          <SectionLabel>Module Progress</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
            {MODULES.map(mod => (
              <ModuleProgressCard
                key={mod.id}
                module={mod}
                progress={progressMap[mod.id] ?? null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, accent }) {
  return (
    <div style={{
      flex:          1,
      minWidth:      110,
      background:    'rgba(255,255,255,0.03)',
      border:        '1px solid rgba(255,255,255,0.08)',
      borderRadius:  16,
      padding:       '24px 20px',
      textAlign:     'center',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', marginBottom: 10, fontFamily: "'Lexend', sans-serif" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 34, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, color: accent ? '#E8FF47' : '#fff', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', marginBottom: 16, fontFamily: "'Lexend', sans-serif" }}>
      {children.toUpperCase()}
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'Lexend', sans-serif" }}>
        Failed to load progress data.
      </div>
      <button
        onClick={onRetry}
        style={{ background: '#E8FF47', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, color: '#000' }}
      >
        Retry
      </button>
    </div>
  )
}
