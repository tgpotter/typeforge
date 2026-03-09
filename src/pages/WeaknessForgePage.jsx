import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useWeaknessData } from '../hooks/useWeaknessData'
import TypingEngine from '../components/TypingEngine'
import WeaknessKeyBadge from '../components/WeaknessKeyBadge'
import pb from '../lib/pb'

const MODULE_COLOR = '#FFB347'
const MODULE_ID    = 'weakness'

export default function WeaknessForgePage() {
  const navigate = useNavigate()
  const { user, isValid } = useAuth()
  const [drillOffset, setDrillOffset] = useState(0)
  const [result, setResult]           = useState(null)
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState(false)

  const { loading, error, refetch, hasEnoughData, sessionCount, topErrorKeys, topSlowKeys, drillText } =
    useWeaknessData(drillOffset)

  const handleComplete = async (sessionData) => {
    setResult(sessionData)
    if (!isValid) return

    setSaving(true)
    setSaveError(false)
    try {
      await pb.collection('sessions').create({
        user:         user.id,
        module_id:    MODULE_ID,
        lesson_index: drillOffset,
        ...sessionData,
      })

      let existing = null
      try {
        existing = await pb.collection('module_progress').getFirstListItem(
          `user = "${user.id}" && module_id = "${MODULE_ID}"`
        )
      } catch (err) {
        if (err.status !== 404) throw err
      }

      if (existing) {
        await pb.collection('module_progress').update(existing.id, {
          lessons_completed: (existing.lessons_completed ?? 0) + 1,
          best_wpm:          Math.max(existing.best_wpm     ?? 0, sessionData.wpm),
          best_accuracy:     Math.max(existing.best_accuracy ?? 0, sessionData.accuracy),
          last_practiced:    new Date().toISOString(),
        })
      } else {
        await pb.collection('module_progress').create({
          user:              user.id,
          module_id:         MODULE_ID,
          lessons_completed: 1,
          best_wpm:          sessionData.wpm,
          best_accuracy:     sessionData.accuracy,
          last_practiced:    new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('Failed to save session:', err)
      setSaveError(true)
    } finally {
      setSaving(false)
      refetch()
    }
  }

  const handleNewDrill = () => {
    setResult(null)
    setSaveError(false)
    setDrillOffset(o => o + 1)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', fontFamily: "'Lexend', sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 16px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: "'Lexend', sans-serif", fontSize: 12 }}>
          ← Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>MODULE 06</span>
          <span style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 16 }}>Weakness Forge</span>
        </div>
        <div style={{ width: 80 }} />
      </nav>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : !hasEnoughData ? (
          <NotEnoughDataState sessionCount={sessionCount} onNavigate={() => navigate('/module/foundation')} />
        ) : result ? (
          <ResultPanel result={result} saving={saving} saveError={saveError} onRetry={() => setResult(null)} onNewDrill={handleNewDrill} />
        ) : (
          <>
            {/* Weakness analysis panel */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: MODULE_COLOR, letterSpacing: '0.14em', marginBottom: 10 }}>
                TODAY'S TARGET
              </div>
              <div style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, fontSize: 26, marginBottom: 28, letterSpacing: '-0.02em' }}>
                Your Weak Spots
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <WeaknessColumn
                  title="Error-Prone"
                  keys={topErrorKeys.slice(0, 2).map((k, i, arr) => ({
                    char:     k.char,
                    label:    'error-prone',
                    severity: arr.length > 1 ? 1 - i * 0.4 : 1,
                  }))}
                />
                <WeaknessColumn
                  title="Slowest Keys"
                  keys={topSlowKeys.slice(0, 2).map((k, i, arr) => ({
                    char:     k.char,
                    label:    'slow',
                    severity: arr.length > 1 ? 1 - i * 0.4 : 1,
                  }))}
                />
              </div>
            </div>

            {/* Drill header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: MODULE_COLOR, letterSpacing: '0.14em', marginBottom: 10 }}>
                DRILL — VARIANT {drillOffset + 1}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
                Generated from your last 30 sessions. Accuracy on these keys is the goal — speed follows.
              </div>
            </div>

            {drillText ? (
              <TypingEngine key={drillText} text={drillText} onComplete={handleComplete} />
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: "'Lexend', sans-serif", padding: '32px 0' }}>
                Not enough word bank coverage for your current weak keys.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function WeaknessColumn({ title, keys }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', fontFamily: "'Lexend', sans-serif", marginBottom: 10 }}>
        {title.toUpperCase()}
      </div>
      {keys.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {keys.map(({ char, label, severity }) => (
            <WeaknessKeyBadge key={char} char={char} label={label} severity={severity} />
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: "'Lexend', sans-serif", padding: '10px 0', lineHeight: 1.6 }}>
          No significant issues detected
        </div>
      )}
    </div>
  )
}

function ResultPanel({ result, saving, saveError, onRetry, onNewDrill }) {
  const meetsTarget = result.accuracy >= 95

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
        {[
          { label: 'WPM',      value: result.wpm },
          { label: 'Accuracy', value: `${result.accuracy.toFixed(1)}%` },
          { label: 'Time',     value: `${result.duration_sec}s` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${MODULE_COLOR}30`, borderRadius: 16, padding: '28px 36px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 40, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 900, color: MODULE_COLOR }}>{value}</div>
          </div>
        ))}
      </div>

      {!meetsTarget && (
        <div style={{ background: 'rgba(255,71,71,0.08)', border: '1px solid rgba(255,71,71,0.2)', borderRadius: 12, padding: '16px 24px', marginBottom: 28, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          Accuracy below 95% — retry this drill. Precision on your weak keys is the whole point.
        </div>
      )}

      {saving && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 20 }}>
          SAVING SESSION...
        </div>
      )}

      {saveError && (
        <div style={{ fontSize: 12, color: 'rgba(255,120,120,0.7)', marginBottom: 20 }}>
          Session could not be saved. Your progress may not be recorded.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onRetry} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '13px 28px', cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
          Retry
        </button>
        <button onClick={onNewDrill} style={{ background: MODULE_COLOR, border: 'none', borderRadius: 10, padding: '13px 28px', cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 14, color: '#000' }}>
          New Drill →
        </button>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', fontFamily: "'Lexend', sans-serif" }}>
        ANALYSING YOUR SESSIONS...
      </div>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'Lexend', sans-serif", marginBottom: 20 }}>
        Failed to load session data.
      </div>
      <button onClick={onRetry} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontFamily: "'Lexend', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
        Retry
      </button>
    </div>
  )
}

function NotEnoughDataState({ sessionCount, onNavigate }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 11, color: MODULE_COLOR, letterSpacing: '0.14em', marginBottom: 20 }}>
        ⚡ WEAKNESS FORGE
      </div>
      <div style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 20, letterSpacing: '-0.02em' }}>
        Not Enough Data Yet
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.9, maxWidth: 460, margin: '0 auto 36px' }}>
        Weakness Forge analyses your typing history to find your slowest and most error-prone keys, then generates a targeted custom drill.
        <br />
        You have <span style={{ color: '#fff', fontWeight: 600 }}>{sessionCount}</span> session{sessionCount !== 1 ? 's' : ''} so far — we need at least <span style={{ color: '#fff', fontWeight: 600 }}>5</span> to identify meaningful patterns.
      </div>
      <button
        onClick={onNavigate}
        style={{ background: MODULE_COLOR, border: 'none', borderRadius: 10, padding: '13px 32px', cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 14, color: '#000' }}
      >
        Go Practice →
      </button>
    </div>
  )
}
