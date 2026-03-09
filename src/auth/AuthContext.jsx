import { createContext, useState, useEffect, useCallback } from 'react'
import pb from '../lib/pb'
import AuthModal from './AuthModal'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Single source of truth — isValid is derived from user at render time
  const [user, setUser]       = useState(pb.authStore.model)
  const [isLoading, setIsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Bridge: PocketBase authStore changes → React state
  useEffect(() => {
    const unsub = pb.authStore.onChange((_token, model) => {
      setUser(model)
    }, true)
    return unsub
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await pb.collection('users').authWithPassword(email, password)
      setModalOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const signUp = useCallback(async (email, password, username) => {
    if (isLoading) return
    setIsLoading(true)

    // Phase 1: create account
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        username,
      })
    } catch (err) {
      setIsLoading(false)
      throw err
    }

    // Phase 2: authenticate (account now exists)
    try {
      await pb.collection('users').authWithPassword(email, password)
      setModalOpen(false)
    } catch (_err) {
      setIsLoading(false)
      // Account was created but login failed — tell the user to sign in manually
      throw Object.assign(
        new Error('Account created — please sign in with your new credentials.'),
        { signUpPartialSuccess: true }
      )
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const signOut = useCallback(() => pb.authStore.clear(), [])

  const openAuthModal  = useCallback(() => setModalOpen(true),  [])
  const closeAuthModal = useCallback(() => setModalOpen(false), [])

  const value = {
    user,
    isValid: user !== null && pb.authStore.isValid,
    isLoading,
    signIn,
    signUp,
    signOut,
    modalOpen,
    openAuthModal,
    closeAuthModal,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modalOpen && <AuthModal />}
    </AuthContext.Provider>
  )
}
