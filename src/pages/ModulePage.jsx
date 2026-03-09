import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TypingEngine from '../components/TypingEngine'
import { LESSONS } from '../data/lessons'
import { MODULE_META } from '../data/modules'
import pb from '../lib/pb'

export default function ModulePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lessonIndex, setLessonIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const meta    = MODULE_META[id]
  const lessons = LESSONS[id] ?? []
  const lesson  = lessons[lessonIndex]

  if (!meta || !lesson) {
    return (
      <PageShell>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Lexend', sans-serif" }}>Module not found.</div>
        <button onClick={() => navigate('/')} style={backBtnStyle}>← Back to home</button>
      </PageShell>
    )
  }

  const handleComplete = async (sessionData) => {
    setResult(sessionData)
    if (!pb.authStore.isValid) return

    setSaving(true)
    const userId = pb.authStore.model.id
    try {
      // Save session
      await pb.collection('sessions').create({
        user: userId,
        module_id: id,
        lesson_index: lessonIndex,
        ...sessionData,
      })

      // Upsert module_progress
      let existing = null
      try {
        existing = await pb.collection('module_progress').getFirstListItem(
          `user = "${userId}" && module_id = "${id}"`
        )
      } catch (_) { /* no record yet */ }

      const progressData = {
        lessons_completed: lessonIndex + 1,
        best_wpm: sessionData.wpm,
        best_accuracy: sessionData.accuracy,
        last_practiced: new Date().toISOString(),
      }

      if (existing) {
        await pb.collection('module_progress').update(existing.id, {
          lessons_completed: Math.max(existing.lessons_completed ?? 0, lessonIndex + 1),
          best_wpm: Math.max(existing.best_wpm ?? 0, sessionData.wpm),
          best_accuracy: Math.max(existing.best_accuracy ?? 0, sessionData.accuracy),
          last_practiced: progressData.last_practiced,
        })
      } else {
        await pb.collection('module_progress').create({ user: userId, module_id: id, ...progressData })
      }
    } catch (err) {
      console.error('Failed to save session:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleRetry = () => setResult(null)

  const handleNext = () => {
    if (lessonIndex < lessons.length - 1) {
      setLessonIndex(i => i + 1)
      setResult(null)
    } else {
      navigate('/')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', fontFamily: "'Lexend', sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 16px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: "'Lexend', sans-serif", fontSize: 12 }}>← Home</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>MODULE {meta.number}</span>
          <span style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 16 }}>{meta.title}</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
          {lessonIndex + 1} / {lessons.length}
        </div>
      </nav>

      {/* Lesson progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '20px 0 0' }}>
        {lessons.map((_, i) => (
          <div key={i} style={{
            width: i === lessonIndex ? 24 : 6,
            height: 6,
            borderRadius: 3,
            background: i < lessonIndex ? meta.color : i === lessonIndex ? meta.color : 'rgba(255,255,255,0.12)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: meta.color, letterSpacing: '0.14em', marginBottom: 10 }}>
            LESSON {lessonIndex + 1} — {lesson.title.toUpperCase()}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            {lesson.instruction}
          </div>
        </div>

        {result ? (
          <ResultPanel
            result={result}
            color={meta.color}
            saving={saving}
            isLastLesson={lessonIndex === lessons.length - 1}
            onRetry={handleRetry}
            onNext={handleNext}
          />
        ) : (
          <TypingEngine
            key={`${id}-${lessonIndex}`}
            text={lesson.text}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  )
}

function ResultPanel({ result, color, saving, isLastLesson, onRetry, onNext }) {
  const meetsAccuracyTarget = result.accuracy >= 95

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
        {[
          { label: 'WPM',      value: result.wpm },
          { label: 'Accuracy', value: `${result.accuracy}%` },
          { label: 'Time',     value: `${result.duration_sec}s` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}30`, borderRadius: 16, padding: '28px 36px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 40, fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      {!meetsAccuracyTarget && (
        <div style={{ background: 'rgba(255,71,71,0.08)', border: '1px solid rgba(255,71,71,0.2)', borderRadius: 12, padding: '16px 24px', marginBottom: 28, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          Accuracy below 95% — retry this lesson before moving on. Speed built on errors won't hold.
        </div>
      )}

      {saving && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 20 }}>SAVING SESSION...</div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onRetry} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '13px 28px', cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
          Retry
        </button>
        <button onClick={onNext} style={{ background: color, border: 'none', borderRadius: 10, padding: '13px 28px', cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 700, fontSize: 14, color: '#000' }}>
          {isLastLesson ? 'Back to Home →' : 'Next Lesson →'}
        </button>
      </div>
    </div>
  )
}

function PageShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      {children}
    </div>
  )
}

const backBtnStyle = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8, padding: '10px 24px', color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 600,
}
