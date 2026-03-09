import { useNavigate } from 'react-router-dom'

export default function LeaderboardPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Lexend', sans-serif" }}>
      <div style={{ fontSize: 11, color: '#E8FF47', letterSpacing: '0.12em', marginBottom: 16 }}>COMING SOON</div>
      <div style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 32 }}>Leaderboard</div>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 24px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: "'Atkinson Hyperlegible', sans-serif", fontWeight: 600 }}>← Back</button>
    </div>
  )
}
