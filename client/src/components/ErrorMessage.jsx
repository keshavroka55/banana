import { AlertCircle } from 'lucide-react'
import Button from './Button'

// Friendly error box. Pass onRetry to show a "Try again" button.
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="error-message" role="alert">
      <AlertCircle size={20} aria-hidden="true" />
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
