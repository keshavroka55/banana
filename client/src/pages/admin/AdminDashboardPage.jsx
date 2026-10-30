import { useCallback } from 'react'
import { Gamepad2, Hourglass, Target, Users } from 'lucide-react'
import Card from '../../components/Card'
import ErrorMessage from '../../components/ErrorMessage'
import LeaderboardTable from '../../components/LeaderboardTable'
import { PageLoader } from '../../components/Spinner'
import StatCard from '../../components/StatCard'
import { useAsync } from '../../hooks/useAsync'
import { getStats } from '../../services/adminService'
import { formatDateTime } from '../../utils/format'

export default function AdminDashboardPage() {
  const load = useCallback(() => getStats(), [])
  const { data, error, isLoading, reload } = useAsync(load)

  return (
    <div className="stack">
      <h1>Dashboard</h1>
      {isLoading && <PageLoader message="Loading statistics..." />}
      <ErrorMessage message={error} onRetry={reload} />

      {data && (
        <>
          <div className="grid-4">
            <StatCard icon={Users} label="Registered users" value={data.totalUsers} />
            <StatCard icon={Gamepad2} label="Completed games" value={data.completedGames} />
            <StatCard icon={Hourglass} label="Games in progress" value={data.inProgressGames} />
            <StatCard icon={Target} label="Average score" value={data.averageScore} />
          </div>

          <Card title="Recent completed games">
            {data.recentGames.length === 0 ? (
              <p>No completed games yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th scope="col">Player</th><th scope="col" className="num">Score</th><th scope="col">Finished</th></tr></thead>
                  <tbody>
                    {data.recentGames.map((game) => (
                      <tr key={game.id}><td>{game.playerName}</td><td className="num">{game.score}</td><td>{formatDateTime(game.completedAt)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Top players">
            {data.topPlayers.length === 0 ? <p>No ranked players yet.</p> : <LeaderboardTable entries={data.topPlayers} />}
          </Card>
        </>
      )}
    </div>
  )
}
