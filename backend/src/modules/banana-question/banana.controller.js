import { getRandomBananaQuestion } from "./banana.service.js";

export const getQuestion = async (req, res, next) => {
  try {
    const question = await getRandomBananaQuestion();

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};