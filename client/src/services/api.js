/**
 * api.js - the ONE place that talks HTTP to the backend.
 *
 * INTEROPERABILITY: React and the Express backend are separate programs.
 * They only share a contract: HTTP requests with JSON bodies and JSON replies.
 *
 * VIRTUAL IDENTITY (how the backend keeps us logged in):
 *  - accessToken  short-lived JWT, kept in a JS variable (memory only) and sent
 *                 as "Authorization: Bearer ..." on every request.
 *  - refreshToken long-lived, stored by the browser in an HttpOnly cookie that
 *                 JavaScript cannot read. It is used only to get a new accessToken.
 *  - csrfToken    must be sent back in the "x-csrf-token" header when we refresh/logout.
 *                 Kept in sessionStorage so a page reload can still refresh.
 */

export const BASE_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = 10_000
const CSRF_STORAGE_KEY = 'banana.csrfToken'

// ── Token state (module-level so every service shares it) ───────────────────
let accessToken = null
let refreshInFlight = null // shared promise: parallel 401s trigger only ONE refresh
let sessionExpiredListener = () => {}

const readCsrf = () => {
  try {
    return sessionStorage.getItem(CSRF_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setTokens({ accessToken: access, csrfToken }) {
  accessToken = access ?? accessToken
  if (csrfToken) {
    try {
      sessionStorage.setItem(CSRF_STORAGE_KEY, csrfToken)
    } catch {
      /* storage blocked: the user simply has to log in again after a reload */
    }
  }
}

export function clearTokens() {
  accessToken = null
  try {
    sessionStorage.removeItem(CSRF_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export const hasStoredSession = () => Boolean(readCsrf())

// AuthContext registers a callback here so the UI can log the user out
// when the backend says the session can no longer be refreshed.
export function onSessionExpired(listener) {
  sessionExpiredListener = listener
  return () => {
    sessionExpiredListener = () => {}
  }
}

// ── Errors ──────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(message, status = 0, code = undefined) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const FALLBACK_MESSAGES = {
  400: 'The request was not valid.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to do that.',
  404: 'We could not find what you were looking for.',
  409: 'That action conflicts with the current state. Please try again.',
  410: 'That item has expired. Please try again.',
  429: 'Too many requests. Please wait a moment.',
}

// 5xx messages are replaced by a generic text (except our own 502 "puzzle unavailable").
const friendlyMessage = (status, serverMessage) => {
  if (status === 502 && serverMessage) return serverMessage
  if (status >= 500) return 'The server had a problem. Please try again later.'
  return serverMessage || FALLBACK_MESSAGES[status] || 'Something went wrong.'
}

// ── Low-level fetch with timeout + safe JSON parsing ────────────────────────
async function send(path, { method = 'GET', body, headers = {} } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include', // lets the browser send/receive the HttpOnly refresh cookie
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    // The body may be empty or not JSON (e.g. a proxy error page) - never let that crash the app.
    const data = await response.json().catch(() => ({}))
    return { ok: response.ok, status: response.status, data }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('The server took too long to respond. Please try again.', 0, 'TIMEOUT')
    }
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0, 'NETWORK')
  } finally {
    clearTimeout(timer)
  }
}

// ── Token refresh ───────────────────────────────────────────────────────────
export function refreshAccessToken() {
  const csrfToken = readCsrf()
  if (!csrfToken) return Promise.reject(new ApiError('No session to refresh.', 401, 'NO_SESSION'))

  // If a refresh is already running, everybody waits for the same one.
  // (Important: the backend ROTATES the refresh token, so two parallel refreshes would break each other.)
  if (!refreshInFlight) {
    refreshInFlight = send('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken },
    })
      .then((result) => {
        if (!result.ok) throw new ApiError('Session expired.', result.status, 'SESSION_EXPIRED')
        setTokens(result.data)
        return result.data.accessToken
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

/**
 * request(path, options)
 *  options.auth  true (default): send the access token if we have one, and on a 401
 *                try ONE silent refresh + retry. Guests simply send no token.
 *                false: for login/register, where a 401 means "wrong password".
 *  options.csrf  true: add the x-csrf-token header (logout).
 * Returns the parsed JSON body or throws an ApiError with a user-friendly message.
 */
export async function request(path, { method = 'GET', body, auth = true, csrf = false } = {}) {
  const buildHeaders = () => ({
    ...(auth && accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(csrf && readCsrf() && { 'x-csrf-token': readCsrf() }),
  })

  let result = await send(path, { method, body, headers: buildHeaders() })

  if (result.status === 401 && auth && hasStoredSession()) {
    try {
      await refreshAccessToken()
    } catch (refreshError) {
      // Only treat it as "session over" if the server really refused the refresh.
      if (refreshError.code !== 'NETWORK' && refreshError.code !== 'TIMEOUT') {
        clearTokens()
        sessionExpiredListener()
        throw new ApiError('Your session expired. Please log in again.', 401, 'SESSION_EXPIRED')
      }
      throw refreshError
    }
    result = await send(path, { method, body, headers: buildHeaders() }) // retry once
  }

  if (!result.ok) {
    throw new ApiError(friendlyMessage(result.status, result.data?.message), result.status, result.data?.code)
  }
  return result.data
}
