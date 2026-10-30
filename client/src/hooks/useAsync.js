import { useCallback, useEffect, useState } from 'react'

/**
 * useAsync(fetcher) - load data from the backend when a page opens.
 *
 * `fetcher` must be a stable function (wrap it in useCallback). When the fetcher
 * changes (e.g. a new search text or page number) the data is loaded again.
 * Returns { data, error, isLoading, reload }.
 */
export function useAsync(fetcher) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null) // { fetcher, attempt, data, error }

  useEffect(() => {
    let cancelled = false // ignore the response if the page changed meanwhile (race condition)
    fetcher()
      .then((data) => !cancelled && setResult({ fetcher, attempt, data, error: '' }))
      .catch((error) => !cancelled && setResult({ fetcher, attempt, data: null, error: error.message }))
    return () => {
      cancelled = true
    }
  }, [fetcher, attempt])

  const isLoading = !result || result.fetcher !== fetcher || result.attempt !== attempt
  const reload = useCallback(() => setAttempt((count) => count + 1), [])

  return {
    data: result?.data ?? null,
    error: isLoading ? '' : result.error,
    isLoading,
    reload,
  }
}
