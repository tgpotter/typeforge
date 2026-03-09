import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

// Groups consecutive characters with the same state into segments.
// A 70-char text becomes 3-4 spans instead of 70, massively reducing reconciliation work.
function buildSegments(text, typed) {
  const segments = []

  let i = 0
  while (i < typed.length) {
    const correct = typed[i] === text[i]
    let j = i + 1
    while (j < typed.length && (typed[j] === text[j]) === correct) j++
    segments.push({ type: correct ? 'correct' : 'error', text: text.slice(i, j) })
    i = j
  }

  if (i < text.length) {
    segments.push({ type: 'cursor', text: text[i] })
    i++
  }

  if (i < text.length) {
    segments.push({ type: 'untyped', text: text.slice(i) })
  }

  return segments
}

const SEGMENT_STYLE = {
  correct: { color: '#fff' },
  error:   { color: '#ff4747', background: 'rgba(255,71,71,0.12)' },
  cursor:  { color: '#E8FF47', background: 'rgba(232,255,71,0.1)', borderBottom: '2px solid #E8FF47' },
  untyped: { color: 'rgba(255,255,255,0.2)' },
}

export default function TypingEngine({ text, onComplete }) {
  const [typed, setTyped]               = useState('')
  const [status, setStatus]             = useState('idle') // idle | typing | complete
  const [liveWpm, setLiveWpm]           = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(100)

  // Refs for synchronous access inside the event handler — avoids stale closures
  const startTimeRef  = useRef(null)
  const typedRef      = useRef('')
  const statusRef     = useRef('idle')
  const keystrokesRef = useRef(0)
  const errorsRef     = useRef(0)
  const errorKeysRef  = useRef({})
  const containerRef  = useRef(null)

  useEffect(() => { containerRef.current?.focus() }, [])

  // Reset all state when the text prop changes so the engine is self-sufficient
  // regardless of whether the parent cycles the key prop.
  useEffect(() => {
    typedRef.current     = ''
    startTimeRef.current = null
    keystrokesRef.current = 0
    errorsRef.current    = 0
    errorKeysRef.current = {}
    statusRef.current    = 'idle'
    setTyped('')
    setStatus('idle')
    setLiveWpm(0)
    setLiveAccuracy(100)
    containerRef.current?.focus()
  }, [text])

  // Live WPM + accuracy ticker — both on the same interval so the keystroke handler
  // only ever fires one state update (setTyped), keeping renders minimal.
  useEffect(() => {
    if (status !== 'typing') return
    const id = setInterval(() => {
      const mins = (Date.now() - startTimeRef.current) / 60000
      setLiveWpm(mins > 0 ? Math.round((typedRef.current.length / 5) / mins) : 0)
      if (keystrokesRef.current > 0) {
        setLiveAccuracy(Math.round(((keystrokesRef.current - errorsRef.current) / keystrokesRef.current) * 100))
      }
    }, 300)
    return () => clearInterval(id)
  }, [status])

  const handleKeyDown = useCallback((e) => {
    if (statusRef.current === 'complete') return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key === 'Tab') { e.preventDefault(); return }

    if (e.key === 'Backspace') {
      const next = typedRef.current.slice(0, -1)
      typedRef.current = next
      setTyped(next)
      return
    }

    if (e.key.length !== 1) return

    const pos = typedRef.current.length
    if (pos >= text.length) return

    if (statusRef.current === 'idle') {
      startTimeRef.current = Date.now()
      statusRef.current = 'typing'
      setStatus('typing')
    }

    const isError = e.key !== text[pos]
    keystrokesRef.current += 1
    if (isError) {
      errorsRef.current += 1
      errorKeysRef.current[text[pos]] = (errorKeysRef.current[text[pos]] || 0) + 1
    }

    const next = typedRef.current + e.key
    typedRef.current = next
    setTyped(next)

    if (next.length >= text.length) {
      const endTime = Date.now()
      const mins = (endTime - startTimeRef.current) / 60000
      const finalWpm = Math.round((text.length / 5) / mins)
      const finalAccuracy = keystrokesRef.current > 0
        ? Math.round(((keystrokesRef.current - errorsRef.current) / keystrokesRef.current) * 100)
        : 100

      statusRef.current = 'complete'
      setStatus('complete')
      // Sync live stats to final values so the display matches the result panel
      setLiveWpm(finalWpm)
      setLiveAccuracy(finalAccuracy)

      onComplete?.({
        wpm: finalWpm,
        accuracy: finalAccuracy,
        duration_sec: Math.round((endTime - startTimeRef.current) / 1000),
        error_keys: { ...errorKeysRef.current },
      })
    }
  }, [text, onComplete])

  const segments = useMemo(() => buildSegments(text, typed), [text, typed])
  const progress = text.length > 0 ? (typed.length / text.length) * 100 : 0

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none', width: '100%' }}
    >
      <div style={{ display: 'flex', gap: 48, marginBottom: 40, justifyContent: 'center' }}>
        <StatItem label="WPM"      value={status === 'idle' ? '—' : liveWpm} />
        <StatItem label="Accuracy" value={status === 'idle' ? '—' : `${liveAccuracy}%`} />
        <StatItem label="Progress" value={`${Math.round(progress)}%`} />
      </div>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 20,
        lineHeight: 2.2,
        letterSpacing: '0.06em',
        userSelect: 'none',
        padding: '36px 44px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        marginBottom: 20,
        wordBreak: 'break-all',
      }}>
        {segments.map((seg, i) => (
          <span key={i} style={SEGMENT_STYLE[seg.type]}>
            {seg.text.replace(/ /g, '\u00A0')}
          </span>
        ))}
      </div>

      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#E8FF47', borderRadius: 1, transition: 'width 0.1s' }} />
      </div>

      {status === 'idle' && (
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'Lexend', sans-serif", letterSpacing: '0.14em' }}>
          START TYPING TO BEGIN
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Lexend', sans-serif", letterSpacing: '0.12em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
    </div>
  )
}
