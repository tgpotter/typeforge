import { Routes, Route } from 'react-router-dom'
import TypeForgeHome from './TypeForgeHome'
import ModulePage from './pages/ModulePage'
import WeaknessForgePage from './pages/WeaknessForgePage'
import ProgressPage from './pages/ProgressPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SettingsPage from './pages/SettingsPage'
import { ProtectedRoute } from './auth/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TypeForgeHome />} />
      <Route path="/module/weakness" element={<WeaknessForgePage />} />
      <Route path="/module/:id" element={<ModulePage />} />
      <Route path="/progress"    element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}
