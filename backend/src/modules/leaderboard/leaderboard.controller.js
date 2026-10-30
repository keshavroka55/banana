import { getLeaderboard } from "./leaderboard.service.js";

// GET /api/leaderboard?limit=20   (public; if a valid token is sent, your own row is flagged)
export const handleGetLeaderboard = async (req, res) => {
    const requested = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), 100) : 20;

    const result = await getLeaderboard({ limit, currentUserId: req.user?.id });
    res.json(result);
};
