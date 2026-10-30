import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

// Previous / Next buttons for admin tables.
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const lastPage = Math.max(Math.ceil(total / pageSize), 1)
  return (
    <nav className="pagination" aria-label="Pagination">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} aria-hidden="true" /> Previous
      </Button>
      <span>Page {page} of {lastPage} ({total} total)</span>
      <Button variant="secondary" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
        Next <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </nav>
  )
}
