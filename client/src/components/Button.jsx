import { Link } from 'react-router-dom'
import Spinner from './Spinner'

/**
 * One button for the whole app.
 *  variant: primary (banana yellow) | secondary | ghost | danger
 *  Pass `to` to render a router link that looks like a button.
 *  `loading` shows a spinner and blocks clicks (prevents double submits).
 */
export default function Button({ variant = 'primary', to, loading = false, disabled = false, children, className = '', ...props }) {
  const classes = `btn btn-${variant} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Spinner size="small" label="" />}
      {children}
    </button>
  )
}
