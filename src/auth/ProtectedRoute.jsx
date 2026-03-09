import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function ProtectedRoute({ children }) {
  const { isValid, openAuthModal } = useAuth()
  const location = useLocation()

  if (!isValid) {
    openAuthModal()
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
}
