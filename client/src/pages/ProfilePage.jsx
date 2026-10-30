import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorMessage from '../components/ErrorMessage'
import { PageLoader } from '../components/Spinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { getHistory } from '../services/gameService'
import { formatDate, formatDateTime } from '../utils/format'

export default function ProfilePage() {
  const { user, handleLogout, handleLogoutAll } = useAuth()
  const navigate = useNavigate()
  const [confirmAll, setConfirmAll] = useState(false)
  const [busy, setBusy] = useState(false)

  const loadHistory = useCallback(() => getHistory(), [])
  const { data: games, error, isLoading, reload } = useAsync(loadHistory)

  // EVENT: "Log out" clicked
  const onLogout = async () => {
    await handleLogout()
    navigate('/')
  }

  // EVENT: "Log out everywhere" confirmed
  const onLogoutAll = async () => {
    setBusy(true)
    try {
      await handleLogoutAll()
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="container narrow stack">
      <h1>Your account</h1>

      <Card title="Account information">
        <dl className="details">
          <dt>Name</dt><dd>{user.name}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Account type</dt><dd>{user.role === 'admin' ? 'Administrator' : 'Player'}</dd>
          <dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd>
        </dl>
        <div className="button-row">
          <Button variant="secondary" onClick={onLogout}>Log out</Button>
          <Button variant="ghost" onClick={() => setConfirmAll(true)}>Log out on all devices</Button>
        </div>
      </Card>

      <Card title="Your saved games">
        {isLoading && <PageLoader message="Loading your games..." />}
        <ErrorMessage message={error} onRetry={reload} />
        {games && games.length === 0 && <p>You have no finished games yet. <Button to="/play" variant="ghost">Play one now</Button></p>}
        {games && games.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th scope="col">Finished</th><th scope="col" className="num">Score</th><th scope="col" className="num">Correct</th><th scope="col" className="num">Wrong</th></tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>{formatDateTime(game.completedAt)}</td>
                    <td className="num"><strong>{game.score}</strong></td>
                    <td className="num">{game.correctAnswers}</td>
                    <td className="num">{game.wrongAnswers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmAll}
        title="Log out on all devices?"
        message="Every browser or device where you are logged in will be signed out."
        confirmLabel="Log out everywhere"
        danger
        loading={busy}
        onCancel={() => setConfirmAll(false)}
        onConfirm={onLogoutAll}
      />
    </div>
  )
}
