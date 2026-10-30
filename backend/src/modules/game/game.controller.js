import * as gameService from "./game.service.js";

// POST /api/games            (login required) -> start a saved game
export const handleStartGame = async (req, res) => {
    const game = await gameService.startGame(req.user.id);
    res.status(201).json({ game });
};

// GET /api/games/question?gameId=...   (guests and users)
export const handleGetQuestion = async (req, res) => {
    const gameId = typeof req.query.gameId === "string" ? req.query.gameId : undefined;
    const question = await gameService.getQuestion({ gameId, user: req.user });
    res.json(question);
};

// POST /api/games/answer { questionId, answer }   (guests and users)
export const handleSubmitAnswer = async (req, res) => {
    const { questionId, answer } = req.body || {};
    const result = await gameService.submitAnswer({ questionId, answer, user: req.user });
    res.json(result);
};

// GET /api/games/history    (login required)
export const handleGetHistory = async (req, res) => {
    const games = await gameService.getHistory(req.user.id);
    console.log("keshav res.json games",games);
    res.json({ games });
};
