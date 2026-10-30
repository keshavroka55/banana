import { useCallback, useState } from 'react'
import Card from '../../components/Card'
import ErrorMessage from '../../components/ErrorMessage'
import Pagination from '../../components/Pagination'
import { PageLoader } from '../../components/Spinner'
import { useAsync } from '../../hooks/useAsync'
import { getGames } from '../../services/adminService'
import { formatDateTime } from '../../utils/format'

export default function AdminGamesPage() {
  const [page, setPage] = useState(1)
  const load = useCallback(() => getGames({ page }), [page])
  const { data, error, isLoading, reload } = useAsync(load)

  return (
    <div className="stack">
      <h1>Game records</h1>
      <Card>
        {isLoading && !data && <PageLoader message="Loading games..." />}
        <ErrorMessage message={error} onRetry={reload} />
        {data && data.games.length === 0 && <p className="center-text">No games have been played yet.</p>}
        {data && data.games.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Player</th><th scope="col">Status</th><th scope="col" className="num">Score</th>
                    <th scope="col" className="num hide-small">Correct / wrong</th><th scope="col" className="hide-small">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {data.games.map((game) => (
                    <tr key={game.id}>
                      <td>{game.playerName}</td>
                      <td><span className={`badge ${game.status === 'completed' ? 'badge-saved' : 'badge-temp'}`}>{game.status === 'completed' ? 'completed' : 'in progress'}</span></td>
                      <td className="num">{game.score}</td>
                      <td className="num hide-small">{game.correctAnswers} / {game.wrongAnswers}</td>
                      <td className="hide-small">{formatDateTime(game.startedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
        <p className="notice">Game records are read-only. Deleting or editing games is not supported by the backend.</p>
      </Card>
    </div>
  )
}
