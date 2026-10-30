import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Gamepad2, LayoutDashboard, LogOut, Trophy, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from './Button'

// Dashboard shell: sidebar on desktop, a scrolling tab bar on mobile.
export default function AdminLayout() {
  const { user, handleLogout } = useAuth()
  const navigate = useNavigate()

  const onLogoutClick = async () => {
    await handleLogout()
    navigate('/')
  }

  return (
    <div className="admin container">
      <aside className="admin-sidebar">
        <p className="admin-title">Admin panel</p>
        <nav aria-label="Admin">
          <NavLink to="/admin" end><LayoutDashboard size={18} aria-hidden="true" /> Dashboard</NavLink>
          <NavLink to="/admin/users"><Users size={18} aria-hidden="true" /> Users</NavLink>
          <NavLink to="/admin/games"><Gamepad2 size={18} aria-hidden="true" /> Games</NavLink>
          <NavLink to="/admin/leaderboard"><Trophy size={18} aria-hidden="true" /> Leaderboard</NavLink>
        </nav>
        <div className="admin-account">
          <p><strong>{user.name}</strong></p>
          <p className="muted">{user.email}</p>
          <Button variant="secondary" onClick={onLogoutClick}>
            <LogOut size={16} aria-hidden="true" /> Log out
          </Button>
        </div>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}
