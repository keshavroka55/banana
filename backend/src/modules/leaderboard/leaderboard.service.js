import prisma from "../../prisma.js";

/**
 * Leaderboard
 * Ranks players by their BEST completed game.
 * Tie-breakers: more correct answers overall, then name (so the order is stable).
 * Guests are never included - only games saved on the server count.
 */
export async function getLeaderboard({ limit = 20, currentUserId } = {}) {
    const totals = await prisma.game.groupBy({
        by: ["userId"],
        where: { status: "completed" },
        _max: { score: true },
        _count: { _all: true },
        _sum: { correctAnswers: true },
    });

    const users = await prisma.user.findMany({
        where: { id: { in: totals.map((t) => t.userId) } },
        select: { id: true, name: true },
    });
    const nameById = new Map(users.map((u) => [u.id, u.name]));

    const ranked = totals
        .map((t) => ({
            userId: t.userId,
            name: nameById.get(t.userId) ?? "Unknown player",
            bestScore: t._max.score ?? 0,
            gamesPlayed: t._count._all,
            totalCorrect: t._sum.correctAnswers ?? 0,
        }))
        .sort(
            (a, b) =>
                b.bestScore - a.bestScore ||
                b.totalCorrect - a.totalCorrect ||
                a.name.localeCompare(b.name)
        )
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Never expose user ids publicly - only tell the caller which row is theirs.
    const toPublic = ({ userId, ...entry }) => ({ ...entry, isYou: userId === currentUserId });

    const me = ranked.find((e) => e.userId === currentUserId);

    return {
        entries: ranked.slice(0, limit).map(toPublic),
        totalPlayers: ranked.length,
        me: me ? toPublic(me) : null,
    };
}
