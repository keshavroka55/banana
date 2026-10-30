import { request, setTokens, clearTokens, refreshAccessToken, hasStoredSession, BASE_URL } from './api'

// POST /api/auth/register  -> { message, user }
export const register = ({ name, email, password }) =>
  request('/api/auth/register', { method: 'POST', body: { name, email, password }, auth: false })

// POST /api/auth/login  -> { accessToken, csrfToken, user }
export async function login({ email, password }) {
  const data = await request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false })
  setTokens(data) // keep tokens for the following requests
  return data.user
}

// GET /api/auth/me  -> { user: { id, name, email, role, avatar, createdAt } }
export const fetchCurrentUser = async () => (await request('/api/auth/me')).user

// After a page reload the access token (memory only) is gone, but the HttpOnly
// refresh cookie + stored CSRF token can get a new one. Resolves to the user, or null.
export async function restoreSession() {
  if (!hasStoredSession()) return null
  try {
    await refreshAccessToken()
    return await fetchCurrentUser()
  } catch (error) {
    if (error.code === 'NETWORK' || error.code === 'TIMEOUT') throw error // server down: don't wipe the session
    clearTokens()
    return null
  }
}

// POST /api/auth/logout (needs access token + CSRF header). Local state is always cleared.
export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST', csrf: true })
  } catch {
    /* even if the server call fails, the user must end up logged out locally */
  } finally {
    clearTokens()
  }
}

// POST /api/auth/logout-all  -> ends every session of this user on every device
export async function logoutAll() {
  try {
    await request('/api/auth/logout-all', { method: 'POST' })
  } finally {
    clearTokens()
  }
}

// Google sign-in is a full-page redirect handled by the backend.
export const googleLoginUrl = () => `${BASE_URL}/api/auth/google`



