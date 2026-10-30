import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";
import { handleGetStats, handleListUsers, handleListGames } from "./admin.controller.js";

const router = express.Router();

// Every admin route needs a valid token AND the "admin" role.
// This is the REAL security check - the React route guard is only for convenience.
router.use(verifyToken, allowRoles("admin"));

router.get("/stats", handleGetStats);
router.get("/users", handleListUsers);
router.get("/games", handleListGames);

export default router;
