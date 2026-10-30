import { Trophy } from 'lucide-react'

// Rank, player and score columns. The row marked isYou (set by the server) is highlighted.
export default function LeaderboardTable({ entries }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Player</th>
            <th scope="col" className="num">Best score</th>
            <th scope="col" className="num hide-small">Games</th>
            <th scope="col" className="num hide-small">Correct answers</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.rank} className={entry.isYou ? 'row-you' : undefined}>
              <td>
                <span className={`rank rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                  {entry.rank <= 3 ? <Trophy size={14} aria-hidden="true" /> : null}
                  {entry.rank}
                </span>
              </td>
              <td>
                {entry.name}
                {entry.isYou && <span className="badge">You</span>}
              </td>
              <td className="num"><strong>{entry.bestScore}</strong></td>
              <td className="num hide-small">{entry.gamesPlayed}</td>
              <td className="num hide-small">{entry.totalCorrect}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
