import { useContext } from 'react'
import { AuthContext } from '../context/authContextValue'

// Components call useAuth() to read the logged-in user and to log in/out.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
