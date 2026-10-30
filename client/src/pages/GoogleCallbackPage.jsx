import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '../components/Spinner'
import { useAuth } from '../hooks/useAuth'

/**
 * The backend redirects here after Google sign-in:  /auth/callback?accessToken=...&csrfToken=...&next=/
 * We take the tokens out of the URL, remove them from the address bar and history,
 * then load the user. (Needs Google OAuth credentials in backend/.env.)
 */
export default function GoogleCallbackPage() {
  const { handleLoginWithTokens } = useAuth()
  const navigate = useNavigate()
  const handled = useRef(false) // React StrictMode runs effects twice in development

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const csrfToken = params.get('csrfToken')
    const next = params.get('next')
    window.history.replaceState(null, '', '/auth/callback') // hide tokens immediately

    if (!accessToken || !csrfToken) {
      navigate('/login?error=oauth_failed', { replace: true })
      return
    }

    handleLoginWithTokens({ accessToken, csrfToken })
      .then(() => navigate(next?.startsWith('/') ? next : '/', { replace: true }))
      .catch(() => navigate('/login?error=oauth_failed', { replace: true }))
  }, [handleLoginWithTokens, navigate])

  return <PageLoader message="Signing you in..." />
}
