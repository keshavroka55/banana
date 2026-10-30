import { request } from './api'

// Every call below is protected on the SERVER by: valid token + role "admin".

// GET /api/admin/stats
export const getStats = () => request('/api/admin/stats')

// GET /api/admin/users?search=&page=  -> { users, page, pageSize, total }
export const getUsers = ({ search = '', page = 1 } = {}) =>
  request(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}`)

// GET /api/admin/games?page=  -> { games, page, pageSize, total }
export const getGames = ({ page = 1 } = {}) => request(`/api/admin/games?page=${page}`)

// POST /api/auth/register-admin (existing endpoint, admin only)
export const createAdmin = ({ name, email, password }) =>
  request('/api/auth/register-admin', { method: 'POST', body: { name, email, password } })
