import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorMessage from '../../components/ErrorMessage'
import FormField from '../../components/FormField'
import Pagination from '../../components/Pagination'
import { PageLoader } from '../../components/Spinner'
import { useAsync } from '../../hooks/useAsync'
import { createAdmin, getUsers } from '../../services/adminService'
import { formatDate } from '../../utils/format'

export default function AdminUsersPage() {
  const [searchText, setSearchText] = useState('') // what the admin is typing
  const [search, setSearch] = useState('') // what is sent to the backend (after a short pause)
  const [page, setPage] = useState(1)

  // EVENT: typing in the search box. Wait 300 ms after the last key so we don't call the API on every letter.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  const load = useCallback(() => getUsers({ search, page }), [search, page])
  const { data, error, isLoading, reload } = useAsync(load)

  // ── Create another administrator ──
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [created, setCreated] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const handleCreateSubmit = (event) => {
    event.preventDefault()
    setCreated('')
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 8) {
      setFormError('Enter a name, a valid email and a password of at least 8 characters.')
      return
    }
    setFormError('')
    setConfirming(true) // ask before giving someone admin rights
  }

  const handleCreateConfirm = async () => {
    setCreating(true)
    try {
      await createAdmin({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      setCreated(`Administrator ${form.email.trim()} was created.`)
      setForm({ name: '', email: '', password: '' })
      reload()
    } catch (createError) {
      setFormError(createError.message)
    } finally {
      setCreating(false)
      setConfirming(false)
    }
  }

  return (
    <div className="stack">
      <h1>Users</h1>

      <Card>
        <div className="search">
          <Search size={18} aria-hidden="true" />
          <input type="search" aria-label="Search users by name or email" placeholder="Search by name or email" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
        </div>

        {isLoading && !data && <PageLoader message="Loading users..." />}
        <ErrorMessage message={error} onRetry={reload} />
        {data && data.users.length === 0 && <p className="center-text">No users match your search.</p>}
        {data && data.users.length > 0 && (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col" className="num">Games</th><th scope="col" className="hide-small">Joined</th></tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-admin' : ''}`}>{u.role}</span></td>
                      <td className="num">{u.gamesPlayed}</td>
                      <td className="hide-small">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </>
        )}
        <p className="notice">
          Disabling accounts and changing roles are not available: the backend has no endpoint for these actions yet.
        </p>
      </Card>

      <Card title="Create another administrator">
        <form onSubmit={handleCreateSubmit} className="stack" noValidate>
          <ErrorMessage message={formError} />
          {created && <p className="notice notice-saved" role="status">{created}</p>}
          <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <FormField label="Temporary password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters" value={form.password} onChange={handleChange} required />
          <Button type="submit">Create administrator</Button>
        </form>
      </Card>

      <ConfirmDialog
        open={confirming}
        title="Create administrator?"
        message={`${form.email} will be able to see all users and game records.`}
        confirmLabel="Create administrator"
        danger
        loading={creating}
        onCancel={() => setConfirming(false)}
        onConfirm={handleCreateConfirm}
      />
    </div>
  )
}
