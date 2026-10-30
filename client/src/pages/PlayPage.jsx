import GameBoard from '../components/GameBoard'
import { useAuth } from '../hooks/useAuth'

export default function PlayPage() {
  const { user, status } = useAuth()
  if (status === 'loading') return null

  // key = user id: logging in or out starts a brand-new game component,
  // so a guest score can never leak into an account.
  return (
    <div className="container narrow stack">
      <h1>Play</h1>
      <GameBoard key={user?.id ?? 'guest'} />
    </div>
  )
}
