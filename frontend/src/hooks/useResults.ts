import { useState, useEffect, useCallback, useRef } from 'react'
import { NormalizedElectionResult, IrreversibilityResponse } from '../types/results'
import { fetchBrazilResults, fetchIrreversibility } from '../services/api'

interface UseResultsState {
  data: NormalizedElectionResult | null
  irreversibility: IrreversibilityResponse | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastSuccessTime: Date | null
  refetch: () => Promise<void>
}

export function useResults(pollIntervalMs: number = 6000): UseResultsState {
  const [data, setData] = useState<NormalizedElectionResult | null>(null)
  const [irreversibility, setIrreversibility] = useState<IrreversibilityResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSuccessTime, setLastSuccessTime] = useState<Date | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const loadData = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    try {
      const [resData, irrevData] = await Promise.all([
        fetchBrazilResults(),
        fetchIrreversibility().catch(() => null),
      ])
      setData(resData)
      if (irrevData) setIrreversibility(irrevData)
      setError(null)
      setLastSuccessTime(new Date())
    } catch (err: any) {
      setError(err?.message || 'Falha ao conectar com o serviço de dados.')
    } finally {
      setIsLoading(false)
      if (isManualRefresh) setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    timerRef.current = setInterval(() => {
      // Intelligent pause: do not poll if browser tab is inactive or hidden
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }, pollIntervalMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadData, pollIntervalMs])

  return {
    data,
    irreversibility,
    isLoading,
    isRefreshing,
    error,
    lastSuccessTime,
    refetch: () => loadData(true),
  }
}
