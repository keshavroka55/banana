import { request } from './api'

// GET /api/leaderboard?limit=  -> { entries: [{ rank, name, bestScore, gamesPlayed, totalCorrect, isYou }], totalPlayers, me }
// Ranks are calculated by the server; the client only displays them.
export const getLeaderboard = (limit = 20) => request(`/api/leaderboard?limit=${limit}`)
