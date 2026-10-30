import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from './Spinner'
import Button from './Button'

/**
 * Route guard. Wrap a page to require login (and optionally a role).
 *
 * SECURITY NOTE: this only improves the experience (hides pages that would fail anyway).
 * Anyone can change JavaScript in their own browser, so the REAL protection is on the
 * backend: verifyToken + allowRoles("admin") reject unauthorised API calls with 401/403.
 */
export default function ProtectedRoute({ role, children }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader message="Checking your session..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  if (role && user.role !== role) {
    return (
      <div className="container narrow center-text stack">
        <h1>No access</h1>
        <p>Your account does not have permission to view this page.</p>
        <Button to="/">Back to home</Button>
      </div>
    )
  }

  return children
}
