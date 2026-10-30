import { useCallback, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { GUEST_TOTAL_ROUNDS, getQuestion, startGame, submitAnswer } from '../services/gameService'

const EMPTY_STATS = { score: 0, correctAnswers: 0, wrongAnswers: 0, answered: 0, totalRounds: GUEST_TOTAL_ROUNDS }

/**
 * useGame - the game's STATE MACHINE.
 *
 * phase:  idle -> loading -> question -> submitting -> answered -> (loading ...) -> finished
 *                         \-> error (retry possible)
 *
 * EVENT-DRIVEN FLOW (what the player does -> which handler runs):
 *   click "Start game"      -> handleStartGame
 *   click an answer button  -> handleAnswerSelect
 *   click "Next question"   -> handleNextQuestion
 *   click "Play again"      -> handleRestartGame
 * Each handler calls the backend through gameService, then updates state;
 * React re-renders the UI from that state. No manual DOM changes anywhere.
 *
 * Guests:      the server checks every answer, but the SCORE is only counted here (temporary).
 * Registered:  the server counts the score and saves the finished game - we just display it.
 */
export function useGame() {
  const { user } = useAuth()

  const [phase, setPhase] = useState('idle')
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null) // { correct, correctAnswer, points }
  const [stats, setStats] = useState(EMPTY_STATS)
  const [gameId, setGameId] = useState(null) // only set for registered users
  const [error, setError] = useState('')

  // Race-condition guards:
  //  flowRef       - every async step gets a number; an old response (after a restart) is ignored
  //  submittingRef - blocks a second click before React has re-rendered the disabled buttons
  const flowRef = useRef(0)
  const submittingRef = useRef(false)
  const startedRef = useRef(false)

  const loadQuestion = useCallback(async (id) => {
    const flow = ++flowRef.current
    setPhase('loading')
    setError('')
    setSelected(null)
    setFeedback(null)

    try {
      const nextQuestion = await getQuestion(id)
      if (flow !== flowRef.current) return // outdated response
      setQuestion(nextQuestion)
      // Registered users: the server knows which round we are in.
      if (nextQuestion.roundNumber) {
        setStats((current) => ({
          ...current,
          answered: nextQuestion.roundNumber - 1,
          totalRounds: nextQuestion.totalRounds,
        }))
      }
      setPhase('question')
    } catch (loadError) {
      if (flow !== flowRef.current) return
      setError(loadError.message)
      setPhase('error')
    }
  }, [])

  // ── EVENT: "Start game" clicked ──────────────────────────────────────────
  const handleStartGame = useCallback(async () => {
    const flow = ++flowRef.current
    submittingRef.current = false
    startedRef.current = false
    setStats(EMPTY_STATS)
    setQuestion(null)
    setGameId(null)
    setPhase('loading')
    setError('')

    try {
      let id = null
      if (user) {
        const game = await startGame() // registered: the server creates a saved game
        if (flow !== flowRef.current) return
        id = game.id
        setGameId(id)
        setStats({ ...EMPTY_STATS, totalRounds: game.totalRounds })
      }
      startedRef.current = true
      await loadQuestion(id)
    } catch (startError) {
      if (flow !== flowRef.current) return
      setError(startError.message)
      setPhase('error')
    }
  }, [user, loadQuestion])

  // ── EVENT: an answer button clicked ──────────────────────────────────────
  const handleAnswerSelect = useCallback(
    async (option) => {
      if (phase !== 'question' || submittingRef.current) return // no repeated submissions
      submittingRef.current = true
      const flow = ++flowRef.current

      setSelected(option)
      setPhase('submitting')

      try {
        const result = await submitAnswer(question.questionId, option)
        if (flow !== flowRef.current) return

        setFeedback(result)
        setStats((current) =>
          result.game
            ? {
                // registered: take the numbers calculated by the server
                score: result.game.score,
                correctAnswers: result.game.correctAnswers,
                wrongAnswers: result.game.wrongAnswers,
                answered: result.game.round,
                totalRounds: result.game.totalRounds,
              }
            : {
                // guest: count locally using the points the server awarded
                ...current,
                score: current.score + result.points,
                correctAnswers: current.correctAnswers + (result.correct ? 1 : 0),
                wrongAnswers: current.wrongAnswers + (result.correct ? 0 : 1),
                answered: current.answered + 1,
              },
        )
        setPhase('answered')
      } catch (answerError) {
        if (flow !== flowRef.current) return
        setError(answerError.message)
        // 409 = already answered, 410 = expired: this question is dead, a new one is needed.
        const questionIsDead = answerError.status === 409 || answerError.status === 410
        setSelected(null)
        setPhase(questionIsDead ? 'error' : 'question')
      } finally {
        submittingRef.current = false
      }
    },
    [phase, question],
  )

  const isLastRound = stats.answered >= stats.totalRounds

  // ── EVENT: "Next question" / "See results" clicked ───────────────────────
  const handleNextQuestion = useCallback(() => {
    if (phase !== 'answered') return
    if (isLastRound) {
      setPhase('finished')
    } else {
      loadQuestion(gameId)
    }
  }, [phase, isLastRound, gameId, loadQuestion])

  // ── EVENT: "Try again" after an error ────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (startedRef.current) loadQuestion(gameId)
    else handleStartGame()
  }, [gameId, loadQuestion, handleStartGame])

  // ── EVENT: "Play again" clicked ──────────────────────────────────────────
  const handleRestartGame = useCallback(() => handleStartGame(), [handleStartGame])

  return {
    phase,
    question,
    selected,
    feedback,
    stats,
    error,
    isLastRound,
    isRegistered: Boolean(user),
    handleStartGame,
    handleAnswerSelect,
    handleNextQuestion,
    handleRetry,
    handleRestartGame,
  }
}
