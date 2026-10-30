import { request } from './api'

// Guests are not tracked by the server, so the browser counts their rounds.
// Keep this equal to TOTAL_ROUNDS in backend/src/modules/game/game.constants.js.
export const GUEST_TOTAL_ROUNDS = 10

// POST /api/games (login required) -> { game }   starts a game saved on the server
export const startGame = async () => (await request('/api/games', { method: 'POST' })).game

// GET /api/games/question[?gameId=]  -> { questionId, imageUrl, options[4], roundNumber?, totalRounds? }
// The solution is NOT part of this response - only the server knows it.
export const getQuestion = (gameId) =>
  request(`/api/games/question${gameId ? `?gameId=${encodeURIComponent(gameId)}` : ''}`)

// POST /api/games/answer { questionId, answer } -> { correct, correctAnswer, points, game? }
// `game` (the saved score) is only present for registered users.
export const submitAnswer = (questionId, answer) =>
  request('/api/games/answer', { method: 'POST', body: { questionId, answer } })

// GET /api/games/history (login required) -> { games: [...] }
export const getHistory = async () => (await request('/api/games/history')).games
