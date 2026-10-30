import { useState } from 'react'
import Spinner from './Spinner'
import Button from './Button'

// Shows the puzzle picture with a loading state and a retry if the image fails.
// The parent gives it key={questionId}, so every new puzzle starts with fresh state.
export default function QuestionImage({ src }) {
  const [status, setStatus] = useState('loading') // loading | loaded | failed
  const [attempt, setAttempt] = useState(0)

  return (
    <div className="puzzle">
      {status === 'loading' && (
        <div className="puzzle-overlay">
          <Spinner label="Loading puzzle image" />
        </div>
      )}
      {status === 'failed' ? (
        <div className="puzzle-overlay" role="alert">
          <p>The puzzle image could not be loaded.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setStatus('loading')
              setAttempt((count) => count + 1)
            }}
          >
            Reload image
          </Button>
        </div>
      ) : (
        <img
          key={attempt}
          src={src}
          alt="Banana puzzle: work out the missing number"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('failed')}
          className={status === 'loaded' ? 'is-loaded' : ''}
        />
      )}
    </div>
  )
}
