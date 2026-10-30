import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminGamesPage from './pages/admin/AdminGamesPage'
import AdminLeaderboardPage from './pages/admin/AdminLeaderboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import GoogleCallbackPage from './pages/GoogleCallbackPage'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import PlayPage from './pages/PlayPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'

// All routes in one place. Public pages first, then pages that need a login, then admin.
export default function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#content">Skip to content</a>
      <Navbar />
      <main id="content" className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<GoogleCallbackPage />} />

          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="games" element={<AdminGamesPage />} />
            <Route path="leaderboard" element={<AdminLeaderboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
