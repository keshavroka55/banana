import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import GoogleButton from '../components/GoogleButton'
import { useAuth } from '../hooks/useAuth'

// Same rules as the backend (it re-checks everything - this is only for quick feedback).
function validate({ name, email, password, confirm }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Please enter your name.'
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email address.'
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (confirm !== password) errors.confirm = 'Passwords do not match.'
  return errors
}

export default function RegisterPage() {
  const { user, handleRegister } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Once registered + logged in, `user` is set and this redirect sends the player to the game.
  if (user) return <Navigate to="/play" replace />

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  // EVENT: register form submitted
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    const errors = validate(form)
    setFieldErrors(errors)
    setError('')
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      // POST /api/auth/register, then log in. Note: no role is sent - the backend always creates a "player".
      await handleRegister({ name: form.name.trim(), email: form.email.trim(), password: form.password })
    } catch (registerError) {
      setError(registerError.message) // e.g. "Email already registered"
      setSubmitting(false)
    }
  }

  return (
    <div className="container narrow">
      <Card title="Create your account">
        <form onSubmit={handleSubmit} className="stack" noValidate>
          <ErrorMessage message={error} />
          <FormField label="Name" name="name" autoComplete="name" value={form.name} onChange={handleChange} error={fieldErrors.name} required />
          <FormField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={fieldErrors.email} required />
          <FormField label="Password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters" value={form.password} onChange={handleChange} error={fieldErrors.password} required />
          <FormField label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={handleChange} error={fieldErrors.confirm} required />
          <Button type="submit" loading={submitting}>Register</Button>
        </form>
        <GoogleButton />
        <p className="center-text">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  )
}
