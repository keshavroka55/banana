import { useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import GoogleButton from '../components/GoogleButton'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, handleLogin } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(searchParams.get('error') === 'oauth_failed' ? 'Google sign-in failed. Please try again.' : '')
  const [submitting, setSubmitting] = useState(false)

  // Once logged in, `user` is set and this redirect runs: back to the page the visitor
  // wanted (set by ProtectedRoute), otherwise the admin panel or the game.
  if (user) {
    const fallback = user.role === 'admin' ? '/admin' : '/play'
    return <Navigate to={location.state?.from?.pathname ?? fallback} replace />
  }

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  // EVENT: login form submitted
  const handleSubmit = async (event) => {
    event.preventDefault() // stop the browser's default full-page form post
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      await handleLogin(form) // POST /api/auth/login -> sets `user` -> redirect above
    } catch (loginError) {
      setError(loginError.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="container narrow">
      <Card title="Log in">
        <form onSubmit={handleSubmit} className="stack" noValidate>
          <ErrorMessage message={error} />
          <FormField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
          <FormField label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
          <Button type="submit" loading={submitting}>Log in</Button>
        </form>
        <GoogleButton />
        <p className="center-text">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  )
}
