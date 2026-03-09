import { useState, useEffect, useRef } from 'react'
import { useAuth } from './useAuth'

export default function AuthModal() {
  const { signIn, signUp, closeAuthModal, isLoading } = useAuth()
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError]       = useState(null)
  const firstInputRef           = useRef(null)

  // Focus first input on open
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeAuthModal() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeAuthModal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        if (!username.trim()) { setError('Username is required'); return }
        await signUp(email, password, username.trim())
      }
    } catch (err) {
      const fields = err?.response?.data
      if (fields && Object.keys(fields).length > 0) {
        const fieldErrors = Object.values(fields)
          .map(f => f?.message)
          .filter(Boolean)
        setError(fieldErrors.length ? fieldErrors.join(' ') : err?.response?.message || 'Something went wrong.')
      } else {
        setError(err?.message || 'Something went wrong.')
      }
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 14,
    fontFamily: "'Lexend', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  }

  const headingId = 'auth-modal-title'

  return (
    <div
      onClick={closeAuthModal}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111',
          border: '1px solid rgba(232,255,71,0.2)',
          borderRadius: 20,
          padding: 36,
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div id={headingId} style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff' }}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </div>
          <button
            onClick={closeAuthModal}
            aria-label="Close"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            ref={firstInputRef}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label="Email"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            aria-label="Password"
            style={inputStyle}
          />
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              aria-label="Username"
              style={inputStyle}
            />
          )}

          {error && (
            <div
              role="alert"
              style={{
                background: 'rgba(255,71,71,0.08)',
                border: '1px solid rgba(255,71,71,0.2)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 4,
              background: '#E8FF47',
              border: 'none',
              borderRadius: 10,
              padding: '13px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Atkinson Hyperlegible', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: '#000',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'Lexend', sans-serif" }}>
          {mode === 'signin' ? (
            <>Don&apos;t have an account?{' '}
              <span onClick={() => { setMode('signup'); setError(null) }} style={{ color: '#E8FF47', cursor: 'pointer' }}>Sign up</span>
            </>
          ) : (
            <>Already have one?{' '}
              <span onClick={() => { setMode('signin'); setError(null) }} style={{ color: '#E8FF47', cursor: 'pointer' }}>Sign in</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
