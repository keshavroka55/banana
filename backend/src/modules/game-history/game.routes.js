import { Router } from "express";
import { getGameHistory } from "./game.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = Router();

router.get("/history", verifyToken, getGameHistory);

export default router;