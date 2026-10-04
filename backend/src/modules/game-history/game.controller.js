import { getUserGameHistory } from "./game.service.js";

export const getGameHistory = async (req, res, next) => {
  try {
    const games = await getUserGameHistory(req.user.id);

    res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    next(error);
  }
};