import { useMemo } from 'react'
import { useProgressData } from './useProgressData'
import {
  MIN_SESSIONS,
  MIN_KEYSTROKES,
  ANALYSIS_WINDOW,
  computeSessionStats,
  analyzeErrorKeys,
  analyzeSlowKeys,
  generateDrillText,
} from '../lib/weaknessEngine'

export function useWeaknessData(drillOffset = 0) {
  const { sessions, loading, error, refetch } = useProgressData()

  const result = useMemo(() => {
    const recentSessions = sessions.slice(-ANALYSIS_WINDOW)

    const { totalSessions, totalKeystrokes } = computeSessionStats(recentSessions)
    const hasEnoughData = totalSessions >= MIN_SESSIONS && totalKeystrokes >= MIN_KEYSTROKES

    if (!hasEnoughData) {
      return { hasEnoughData: false, sessionCount: totalSessions, topErrorKeys: [], topSlowKeys: [], drillText: null }
    }

    const topErrorKeys = analyzeErrorKeys(recentSessions)
    const topSlowKeys  = analyzeSlowKeys(recentSessions)
    const drillText    = generateDrillText(topErrorKeys, topSlowKeys, drillOffset)

    return { hasEnoughData: true, sessionCount: totalSessions, topErrorKeys, topSlowKeys, drillText }
  }, [sessions, drillOffset])

  return { loading, error, refetch, ...result }
}
