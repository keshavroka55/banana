import { useId } from 'react'

// Label + input + error text, correctly linked for screen readers.
export default function FormField({ label, error, hint, ...inputProps }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {...inputProps} />
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
