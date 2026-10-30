import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Banana, LogOut, Menu, Shield, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from './Button'

export default function Navbar() {
  const { user, isAdmin, handleLogout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  // EVENT: "Log out" clicked -> backend logout -> clear user -> go home
  const onLogoutClick = async () => {
    closeMenu()
    await handleLogout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="brand" onClick={closeMenu}>
          <Banana aria-hidden="true" />
          <span>Banana Math</span>
        </Link>

        <button
          className="menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav id="main-nav" className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/play" onClick={closeMenu}>Play</NavLink>
          <NavLink to="/leaderboard" onClick={closeMenu}>Leaderboard</NavLink>

          {user ? (
            <>
              <NavLink to="/profile" onClick={closeMenu}>{user.name}</NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={closeMenu}>
                  <Shield size={16} aria-hidden="true" /> Admin
                </NavLink>
              )}
              <Button variant="ghost" onClick={onLogoutClick}>
                <LogOut size={16} aria-hidden="true" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" to="/login" onClick={closeMenu}>Log in</Button>
              <Button to="/register" onClick={closeMenu}>Register</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
