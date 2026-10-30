import express from "express";
import { optionalAuth } from "../../middleware/optionalAuth.js";
import { handleGetLeaderboard } from "./leaderboard.controller.js";

const router = express.Router();

router.get("/", optionalAuth, handleGetLeaderboard);

export default router;
