import { useState, useEffect, useCallback, DependencyList } from 'react'
import { ApiError } from '@/lib/api'

/**
 * Generic hook for API data fetching.
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => productsApi.search({ q }), [q])
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = [],
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])

  return { data, loading, error, refetch: run }
}
