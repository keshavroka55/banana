import prisma from "../../prisma.js";

export const getUserGameHistory = async (userId) => {
  return prisma.game.findMany({
    where: {
      userId,
    },

    orderBy: {
      completedAt: "desc",
    },

    select: {
      id: true,
      score: true,
      totalRounds: true,
      correctAnswers: true,
      wrongAnswers: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
    },
  });
};