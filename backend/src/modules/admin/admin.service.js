import prisma from "../../prisma.js";
import { getLeaderboard } from "../leaderboard/leaderboard.service.js";

const PAGE_SIZE = 10;

// ─── Dashboard numbers ───────────────────────────────────────────────────────
export async function getStats() {
    const [totalUsers, totalAdmins, completedGames, inProgressGames, scoreAverage, recentGames, leaderboard] =
        await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: "admin" } }),
            prisma.game.count({ where: { status: "completed" } }),
            prisma.game.count({ where: { status: "in_progress" } }),
            prisma.game.aggregate({ where: { status: "completed" }, _avg: { score: true } }),
            prisma.game.findMany({
                where: { status: "completed" },
                orderBy: { completedAt: "desc" },
                take: 5,
                include: { user: { select: { name: true } } },
            }),
            getLeaderboard({ limit: 5 }),
        ]);

    return {
        totalUsers,
        totalAdmins,
        completedGames,
        inProgressGames,
        averageScore: Math.round(scoreAverage._avg.score ?? 0),
        recentGames: recentGames.map(toGameRow),
        topPlayers: leaderboard.entries,
    };
}

// ─── Users (search + pagination) ─────────────────────────────────────────────
export async function listUsers({ search, page = 1 }) {
    const where = search
        ? {
              OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
              ],
          }
        : {};

    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            // select = whitelist. Password hashes and tokens are never returned.
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                _count: { select: { games: { where: { status: "completed" } } } },
            },
        }),
    ]);

    return {
        users: users.map(({ _count, ...user }) => ({ ...user, gamesPlayed: _count.games })),
        page,
        pageSize: PAGE_SIZE,
        total,
    };
}

// ─── Game records (pagination) ───────────────────────────────────────────────
export async function listGames({ page = 1 }) {
    const [total, games] = await Promise.all([
        prisma.game.count(),
        prisma.game.findMany({
            orderBy: { startedAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            include: { user: { select: { name: true } } },
        }),
    ]);

    return { games: games.map(toGameRow), page, pageSize: PAGE_SIZE, total };
}

const toGameRow = (game) => ({
    id: game.id,
    playerName: game.user.name,
    status: game.status,
    score: game.score,
    correctAnswers: game.correctAnswers,
    wrongAnswers: game.wrongAnswers,
    totalRounds: game.totalRounds,
    startedAt: game.startedAt,
    completedAt: game.completedAt,
});
