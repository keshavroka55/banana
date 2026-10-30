import { googleLoginUrl } from '../services/authService'

// Full-page redirect to the backend's Google OAuth route.
export default function GoogleButton() {
  return (
    <>
      <p className="divider"><span>or</span></p>
      <a className="btn btn-secondary btn-block" href={googleLoginUrl()}>Continue with Google</a>
    </>
  )
}
