import { PartyPopper } from 'lucide-react'
import Button from './Button'
import Card from './Card'

// Shown after the last round.
export default function GameResults({ stats, isRegistered, onPlayAgain }) {
  return (
    <Card className="results">
      <PartyPopper size={40} aria-hidden="true" />
      <h2>Game over!</h2>
      <p className="big-score">{stats.score} points</p>
      <p>
        {stats.correctAnswers} correct, {stats.wrongAnswers} wrong out of {stats.totalRounds} puzzles.
      </p>

      {isRegistered ? (
        <p className="notice notice-saved">This game was saved to your account and counts for the leaderboard.</p>
      ) : (
        <div className="notice notice-temp">
          <p>This was a guest game. Your score is only shown here and is <strong>not saved</strong> on the server.</p>
          <p>Create a free account to save your results and appear on the leaderboard.</p>
          <div className="button-row">
            <Button to="/register">Register</Button>
            <Button to="/login" variant="secondary">Log in</Button>
          </div>
        </div>
      )}

      <div className="button-row">
        <Button onClick={onPlayAgain}>Play again</Button>
        <Button to="/leaderboard" variant="secondary">View leaderboard</Button>
      </div>
    </Card>
  )
}
