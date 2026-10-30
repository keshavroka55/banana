import prisma from "../../prisma.js";
import { AppError } from "../../utils/AppError.js";
import { getPuzzle } from "../../services/banana.service.js";
import { generateOptions } from "./answerOptions.js";
import { TOTAL_ROUNDS, POINTS_PER_CORRECT, QUESTION_TTL_MS } from "./game.constants.js";

// What the browser is allowed to know about a game.
const toGameSummary = (game) => ({
    id: game.id,
    status: game.status,
    score: game.score,
    totalRounds: game.totalRounds,
    correctAnswers: game.correctAnswers,
    wrongAnswers: game.wrongAnswers,
    round: game.correctAnswers + game.wrongAnswers, // rounds already answered
    startedAt: game.startedAt,
    completedAt: game.completedAt,
});

// What the browser is allowed to know about a question.
// NOTE: the solution is deliberately NOT included.
const toQuestionResponse = (question, game) => ({
    questionId: question.id,
    imageUrl: question.imageUrl,
    options: question.options,
    source: question.source,
    ...(game && {
        roundNumber: game.correctAnswers + game.wrongAnswers + 1,
        totalRounds: game.totalRounds,
    }),
});

// Load a game and make sure it belongs to the logged-in user.
async function getOwnedGame(gameId, user) {
    if (!user) throw new AppError(401, "Please log in to play a saved game");

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    // Same message for "missing" and "someone else's" so ids cannot be probed.
    if (!game || game.userId !== user.id) throw new AppError(404, "Game not found");
    return game;
}

// ─── Start a saved game (registered users only) ──────────────────────────────
export async function startGame(userId) {
    const game = await prisma.game.create({
        data: { userId, totalRounds: TOTAL_ROUNDS },
    });
    return toGameSummary(game);
}

// ─── Get the next question ───────────────────────────────────────────────────
// Guests:     no gameId -> a standalone question (nothing is saved for them).
// Logged-in:  gameId    -> a question that belongs to their saved game.
export async function getQuestion({ gameId, user }) {
    let game = null;

    if (gameId) {
        game = await getOwnedGame(gameId, user);
        if (game.status === "completed") throw new AppError(409, "This game is already finished");

        // If a question is still waiting for an answer, hand out the SAME one.
        // (A page refresh must not let the player skip to an easier puzzle.)
        const pending = await prisma.question.findFirst({
            where: { gameId, answeredAt: null, expiresAt: { gt: new Date() } },
        });
        if (pending) return toQuestionResponse(pending, game);
    }

    let puzzle;
    try {
        puzzle = await getPuzzle();
    } catch (err) {
        console.error("No puzzle available:", err.message);
        throw new AppError(502, "Could not load a puzzle. Please try again.");
    }

    const question = await prisma.question.create({
        data: {
            imageUrl: puzzle.imageUrl,
            solution: puzzle.solution,
            options: generateOptions(puzzle.solution),
            source: puzzle.source,
            gameId: game ? game.id : null,
            expiresAt: new Date(Date.now() + QUESTION_TTL_MS),
        },
    });

    // Housekeeping: old guest questions are useless, delete them (non-blocking).
    prisma.question
        .deleteMany({ where: { gameId: null, expiresAt: { lt: new Date() } } })
        .catch((err) => console.error("Question cleanup failed:", err.message));

    return toQuestionResponse(question, game);
}

// ─── Check an answer ─────────────────────────────────────────────────────────
// The server is the only place that knows the solution, so only the server
// decides if an answer is correct and how many points it is worth.
export async function submitAnswer({ questionId, answer, user }) {
    const chosen = Number(answer);
    if (typeof questionId !== "string" || answer === null || answer === "" || !Number.isInteger(chosen)) {
        throw new AppError(400, "questionId and an integer answer are required");
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new AppError(404, "Question not found");
    if (question.expiresAt < new Date()) throw new AppError(410, "This question has expired");
    if (!question.options.includes(chosen)) throw new AppError(400, "Answer is not one of the options");

    // A question that belongs to a saved game can only be answered by that game's owner.
    if (question.gameId) {
        const game = await getOwnedGame(question.gameId, user);
        if (game.status === "completed") throw new AppError(409, "This game is already finished");
    }

    const correct = chosen === question.solution;
    const points = correct ? POINTS_PER_CORRECT : 0;

    // One transaction: "claim" the question and update the game together.
    return prisma.$transaction(async (tx) => {
        // updateMany + answeredAt:null is an atomic claim. If two requests race,
        // only one of them gets count === 1, so points can never be awarded twice.
        const claim = await tx.question.updateMany({
            where: { id: question.id, answeredAt: null },
            data: { answeredAt: new Date() },
        });
        if (claim.count === 0) throw new AppError(409, "This question was already answered");

        const result = { correct, correctAnswer: question.solution, points };
        if (!question.gameId) return result; // guest: nothing to save

        const current = await tx.game.findUnique({ where: { id: question.gameId } });
        const correctAnswers = current.correctAnswers + (correct ? 1 : 0);
        const wrongAnswers = current.wrongAnswers + (correct ? 0 : 1);
        const finished = correctAnswers + wrongAnswers >= current.totalRounds;

        const game = await tx.game.update({
            where: { id: current.id },
            data: {
                correctAnswers,
                wrongAnswers,
                score: correctAnswers * POINTS_PER_CORRECT,
                ...(finished && { status: "completed", completedAt: new Date() }),
            },
        });

        return { ...result, game: toGameSummary(game) };
    });
}

// ─── History of the logged-in user ───────────────────────────────────────────
export async function getHistory(userId) {
    const games = await prisma.game.findMany({
        where: { userId, status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 20,
    });
    return games.map(toGameSummary);
}
