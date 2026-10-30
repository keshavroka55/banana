// Small loading indicator. `label` is read by screen readers.
export default function Spinner({ size = 'medium', label = 'Loading' }) {
  return (
    <span className={`spinner spinner-${size}`} role={label ? 'status' : undefined} aria-label={label || undefined} />
  )
}

// Centered spinner used while a whole page is loading.
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="page-loader">
      <Spinner label={message} />
      <p>{message}</p>
    </div>
  )
}
