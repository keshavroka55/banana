import { useCallback } from 'react'
import Card from '../../components/Card'
import ErrorMessage from '../../components/ErrorMessage'
import LeaderboardTable from '../../components/LeaderboardTable'
import { PageLoader } from '../../components/Spinner'
import { useAsync } from '../../hooks/useAsync'
import { getLeaderboard } from '../../services/leaderboardService'

export default function AdminLeaderboardPage() {
  const load = useCallback(() => getLeaderboard(50), [])
  const { data, error, isLoading, reload } = useAsync(load)

  return (
    <div className="stack">
      <h1>Leaderboard</h1>
      <Card>
        {isLoading && <PageLoader message="Loading rankings..." />}
        <ErrorMessage message={error} onRetry={reload} />
        {data && data.entries.length === 0 && <p className="center-text">No ranked players yet.</p>}
        {data && data.entries.length > 0 && (
          <>
            <LeaderboardTable entries={data.entries} />
            <p className="muted">Showing {data.entries.length} of {data.totalPlayers} players.</p>
          </>
        )}
        <p className="notice">Rankings are calculated by the server from completed games and cannot be edited manually.</p>
      </Card>
    </div>
  )
}
