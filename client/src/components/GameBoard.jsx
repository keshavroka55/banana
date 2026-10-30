import { useState } from 'react'
import { ArrowRight, CheckCircle2, Play, RotateCcw, XCircle } from 'lucide-react'
import { useGame } from '../hooks/useGame'
import AnswerOptions from './AnswerOptions'
import Button from './Button'
import Card from './Card'
import ConfirmDialog from './ConfirmDialog'
import ErrorMessage from './ErrorMessage'
import GameHud from './GameHud'
import GameResults from './GameResults'
import QuestionImage from './QuestionImage'
import { PageLoader } from './Spinner'

/**
 * GameBoard - only DISPLAYS the game. All logic lives in the useGame hook,
 * all HTTP lives in gameService. (Separation of concerns.)
 */
export default function GameBoard() {
  const game = useGame()
  const { phase, question, selected, feedback, stats, error, isLastRound, isRegistered } = game
  const [confirmRestart, setConfirmRestart] = useState(false)

  if (phase === 'idle') {
    return (
      <Card className="center-text stack">
        <Play size={36} aria-hidden="true" />
        <h2>Ready to play?</h2>
        <p>
          You will see {stats.totalRounds} banana puzzles. Work out the missing number and pick the right answer.
          Each correct answer is worth 10 points.
        </p>
        <p className={`notice ${isRegistered ? 'notice-saved' : 'notice-temp'}`}>
          {isRegistered
            ? 'You are logged in: your finished game is saved and ranked on the leaderboard.'
            : 'Playing as a guest: your score is temporary and will not be saved. Log in to save it.'}
        </p>
        <Button onClick={game.handleStartGame}>Start game</Button>
      </Card>
    )
  }

  if (phase === 'finished') {
    return <GameResults stats={stats} isRegistered={isRegistered} onPlayAgain={game.handleRestartGame} />
  }

  const checking = phase === 'submitting'
  const showPuzzle = question && phase !== 'error'

  return (
    <div className="stack">
      <GameHud stats={stats} isRegistered={isRegistered} />

      <Card>
        {phase === 'loading' && !question && <PageLoader message="Loading puzzle..." />}
        {phase === 'error' && <ErrorMessage message={error} onRetry={game.handleRetry} />}

        {showPuzzle && (
          <div className={`stack ${phase === 'loading' ? 'is-fading' : ''}`}>
            <p className="eyebrow">
              Puzzle {phase === 'answered' ? stats.answered : Math.min(stats.answered + 1, stats.totalRounds)} of {stats.totalRounds}
            </p>
            <QuestionImage key={question.questionId} src={question.imageUrl} />
            <AnswerOptions
              options={question.options}
              selected={selected}
              feedback={feedback}
              disabled={phase !== 'question'}
              onSelect={game.handleAnswerSelect}
            />
            {checking && <p className="muted center-text" role="status">Checking your answer...</p>}
            {phase === 'question' && error && <ErrorMessage message={error} />}
          </div>
        )}

        {phase === 'answered' && feedback && (
          <div className="stack">
            <p className={`feedback ${feedback.correct ? 'feedback-correct' : 'feedback-wrong'}`} role="status">
              {feedback.correct ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
              {feedback.correct
                ? `Correct! +${feedback.points} points`
                : `Not quite - the answer was ${feedback.correctAnswer}.`}
            </p>
            <Button onClick={game.handleNextQuestion}>
              {isLastRound ? 'See results' : 'Next puzzle'} <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        )}
      </Card>

      {stats.answered > 0 && (
        <div className="center-text">
          <Button variant="ghost" onClick={() => setConfirmRestart(true)}>
            <RotateCcw size={16} aria-hidden="true" /> Restart game
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmRestart}
        title="Restart the game?"
        message={
          isRegistered
            ? 'Your current unfinished game will be abandoned and will not count for the leaderboard.'
            : 'Your current score will be lost.'
        }
        confirmLabel="Restart"
        danger
        onCancel={() => setConfirmRestart(false)}
        onConfirm={() => {
          setConfirmRestart(false)
          game.handleRestartGame()
        }}
      />
    </div>
  )
}
