import { useState, useEffect, useCallback } from 'react'
import pb from '../lib/pb'
import { useAuth } from '../auth/useAuth'

export function useProgressData() {
  const { user } = useAuth()
  const [sessions, setSessions]             = useState([])
  const [moduleProgress, setModuleProgress] = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  // Incrementing this triggers a re-fetch (used by the retry button)
  const [fetchKey, setFetchKey]             = useState(0)

  const refetch = useCallback(() => setFetchKey(k => k + 1), [])

  useEffect(() => {
    // Clear stale data immediately when the user signs out
    if (!user?.id) {
      setSessions([])
      setModuleProgress([])
      setLoading(false)
      setError(null)
      return
    }

    // Guard against malformed IDs before interpolating into filter strings
    if (!/^[\w-]+$/.test(user.id)) return

    let active = true
    setLoading(true)
    setError(null)

    Promise.all([
      pb.collection('sessions').getFullList({
        filter: `user = "${user.id}"`,
        sort:   'created',
      }),
      pb.collection('module_progress').getFullList({
        filter: `user = "${user.id}"`,
      }),
    ])
      .then(([sess, progress]) => {
        if (!active) return
        setSessions(sess)
        setModuleProgress(progress)
      })
      .catch(err => {
        if (!active) return
        setError(err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Cleanup: prevent stale responses from updating state after unmount
    // or after a newer fetch has been triggered
    return () => { active = false }
  }, [user?.id, fetchKey])

  return { sessions, moduleProgress, loading, error, refetch }
}
