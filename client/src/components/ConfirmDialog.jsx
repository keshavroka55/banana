import { useEffect, useRef } from 'react'
import Button from './Button'

// Modal "Are you sure?" built on the native <dialog> element
// (the browser handles focus trapping, the Escape key and the backdrop).
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, loading = false, onConfirm, onCancel }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={dialogRef} className="dialog" onCancel={onCancel} aria-labelledby="dialog-title">
      <h2 id="dialog-title">{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
