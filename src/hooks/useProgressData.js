import { useState, useEffect, useCallback } from 'react'
import pb from '../lib/pb'
import { useAuth } from '../auth/useAuth'

export function useProgressData() {
  const { user } = useAuth()
  const [sessions, setSessions]             = useState([])
  const [moduleProgress, setModuleProgress] = useState([])
  const [profile, setProfile]               = useState(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const [sess, progress, prof] = await Promise.all([
        pb.collection('sessions').getFullList({
          filter: `user = "${user.id}"`,
          sort:   'created',
        }),
        pb.collection('module_progress').getFullList({
          filter: `user = "${user.id}"`,
        }),
        pb.collection('profiles')
          .getFirstListItem(`user = "${user.id}"`)
          .catch(() => null), // new users have no profile record yet
      ])
      setSessions(sess)
      setModuleProgress(progress)
      setProfile(prof)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  return { sessions, moduleProgress, profile, loading, error, refetch: fetchData }
}
