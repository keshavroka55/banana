import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContextValue'
import * as authService from '../services/authService'
import { onSessionExpired, setTokens } from '../services/api'

/**
 * AuthProvider - STATE MANAGEMENT for "who is logged in?".
 *
 * `user` always comes from the backend (login response or GET /api/auth/me).
 * The role is never typed in or guessed by the browser.
 *   status "loading" -> we are still asking the backend if a session exists
 *   status "ready"   -> we know the answer (user object or null = guest)
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  // On first load (and after every page refresh) try to restore the session.
  useEffect(() => {
    let cancelled = false
    authService
      .restoreSession()
      .then((restoredUser) => !cancelled && setUser(restoredUser))
      .catch(() => {}) // server unreachable: stay a guest, pages show their own errors
      .finally(() => !cancelled && setStatus('ready'))
    return () => {
      cancelled = true
    }
  }, [])

  // If the backend refuses to refresh the session, drop the user from the UI too.
  useEffect(() => onSessionExpired(() => setUser(null)), [])

  const handleLogin = useCallback(async (credentials) => {
    const loggedInUser = await authService.login(credentials)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  // Registration does not log in on the backend, so we log in right after.
  const handleRegister = useCallback(
    async ({ name, email, password }) => {
      await authService.register({ name, email, password })
      return handleLogin({ email, password })
    },
    [handleLogin],
  )

  // Used by the Google redirect: tokens arrive in the URL instead of a login response.
  const handleLoginWithTokens = useCallback(async (tokens) => {
    setTokens(tokens)
    const loggedInUser = await authService.fetchCurrentUser()
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const handleLogout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const handleLogoutAll = useCallback(async () => {
    await authService.logoutAll()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAdmin: user?.role === 'admin',
      handleLogin,
      handleRegister,
      handleLoginWithTokens,
      handleLogout,
      handleLogoutAll,
    }),
    [user, status, handleLogin, handleRegister, handleLoginWithTokens, handleLogout, handleLogoutAll],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
