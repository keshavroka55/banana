import { useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import LeaderboardTable from '../components/LeaderboardTable'
import { PageLoader } from '../components/Spinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { getLeaderboard } from '../services/leaderboardService'

// key = user id: when someone logs in or out the page reloads its data,
// so the server can flag "your" row.
export default function LeaderboardPage() {
  const { user } = useAuth()
  return <Leaderboard key={user?.id ?? 'guest'} />
}

function Leaderboard() {
  // EVENT: page opens -> load the leaderboard from the backend
  const handleLeaderboardLoad = useCallback(() => getLeaderboard(20), [])
  const { data, error, isLoading, reload } = useAsync(handleLeaderboardLoad)

  const showMe = data?.me && !data.entries.some((entry) => entry.isYou)

  return (
    <div className="container stack">
      <div className="page-title">
        <h1>Leaderboard</h1>
        <Button variant="secondary" onClick={reload} loading={isLoading && Boolean(data)}>
          <RefreshCw size={16} aria-hidden="true" /> Refresh
        </Button>
      </div>
      <p className="muted">Ranked by best saved game. Guest games are not included.</p>

      <Card>
        {isLoading && !data && <PageLoader message="Loading leaderboard..." />}
        <ErrorMessage message={error} onRetry={reload} />
        {data && data.entries.length === 0 && (
          <p className="center-text">No games have been saved yet. Log in and finish a game to be the first!</p>
        )}
        {data && data.entries.length > 0 && <LeaderboardTable entries={data.entries} />}
      </Card>

      {showMe && (
        <Card title="Your position">
          <LeaderboardTable entries={[data.me]} />
        </Card>
      )}
    </div>
  )
}
