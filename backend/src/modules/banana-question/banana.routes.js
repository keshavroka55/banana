import { Router } from "express";
import { getQuestion } from "./banana.controller.js";

const router = Router();

router.get("/question", getQuestion);

export default router;