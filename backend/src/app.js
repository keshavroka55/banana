import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import { config } from "./config/config.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

import authRoutes from "./modules/auth/auth.routes.js";
import gameRoutes from "./modules/game/game.routes.js";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.routes.js";
import adminRoutes from "../src/modules/admin/admin.routes.js";

import path from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Trust proxy (required for Nginx reverse proxy)
app.set("trust proxy", 1);


const CLIENT_DIR = path.resolve(__dirname, "..", "..", "client");
console.log("Serving client from:", CLIENT_DIR);

app.use(express.static(CLIENT_DIR));


app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use(cors({
    origin: config.CLIENT_URL,
    // origin: ["http://127.0.0.1:5501", "http://localhost:5501"],
    credentials: true,
}));

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);

app.use("/api/games", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);


connectRabbitMQ().catch((err) => {
    console.error("RabbitMQ connection failed; welcome-email events will be disabled:", err.message);
});

export default app;
