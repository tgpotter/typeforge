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

    // Use getList instead of getFullList — getFullList sends skipTotal=1 which
    // PocketBase v0.23+ rejects with 400. 500 sessions is well beyond any realistic
    // user history for a typing trainer.
    Promise.all([
      pb.collection('sessions').getList(1, 500, {
        filter: `user = "${user.id}"`,
        sort:   'created',
      }).then(r => r.items),
      pb.collection('module_progress').getList(1, 500, {
        filter: `user = "${user.id}"`,
      }).then(r => r.items),
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
