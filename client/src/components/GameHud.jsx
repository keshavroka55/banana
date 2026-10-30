import { Star } from 'lucide-react'

// Score + progress bar shown above the puzzle.
export default function GameHud({ stats, isRegistered }) {
  const { score, answered, totalRounds } = stats
  const percent = Math.min(Math.round((answered / totalRounds) * 100), 100)

  return (
    <div className="hud">
      <div className="hud-score">
        <Star size={20} aria-hidden="true" />
        <span>
          Score <strong>{score}</strong>
        </span>
        <span className={`badge ${isRegistered ? 'badge-saved' : 'badge-temp'}`}>
          {isRegistered ? 'Saved to your account' : 'Guest - not saved'}
        </span>
      </div>
      <div className="hud-progress">
        <span>
          {answered} of {totalRounds} answered
        </span>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={totalRounds} aria-valuenow={answered} aria-label="Game progress">
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  )
}
