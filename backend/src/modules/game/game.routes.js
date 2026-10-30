import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { optionalAuth } from "../../middleware/optionalAuth.js";
import {
    handleStartGame,
    handleGetQuestion,
    handleSubmitAnswer,
    handleGetHistory,
} from "./game.controller.js";

const router = express.Router();

// Guests and logged-in users
router.get("/question", optionalAuth, handleGetQuestion);
router.post("/answer", optionalAuth, handleSubmitAnswer);

// Logged-in users only
router.post("/", verifyToken, handleStartGame);
router.get("/history", verifyToken, handleGetHistory);

export default router;
