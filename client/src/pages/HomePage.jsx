import { Banana, ListChecks, Trophy, UserCheck } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAuth } from '../hooks/useAuth'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="container stack-lg">
      <section className="hero">
        <Banana size={56} aria-hidden="true" />
        <h1>Banana Math Game</h1>
        <p className="lead">Look at the banana puzzle, work out the missing number and pick the right answer.</p>
        <div className="button-row">
          <Button to="/play">Play now</Button>
          <Button to="/leaderboard" variant="secondary">View leaderboard</Button>
        </div>
        {!user && <p className="muted">No account needed to play. Register to save your scores.</p>}
      </section>

      <section className="grid-3">
        <Card>
          <ListChecks aria-hidden="true" />
          <h2>10 puzzles</h2>
          <p>Every puzzle is a picture. Choose one of four answers and get instant feedback.</p>
        </Card>
        <Card>
          <UserCheck aria-hidden="true" />
          <h2>Guest or player</h2>
          <p>Guests play for fun and their score is temporary. Registered players have every game saved.</p>
        </Card>
        <Card>
          <Trophy aria-hidden="true" />
          <h2>Leaderboard</h2>
          <p>The best score of each registered player is ranked on the server.</p>
        </Card>
      </section>
    </div>
  )
}
