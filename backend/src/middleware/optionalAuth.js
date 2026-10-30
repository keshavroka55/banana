import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

/**
 * optionalAuth
 * Used by routes that guests AND logged-in users may call (e.g. get a question).
 *  - No Authorization header  -> continue as a guest (req.user stays undefined)
 *  - Valid access token       -> req.user = { id, email, role }
 *  - Bad / expired token      -> 401, so the client can refresh the token and retry
 */
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return next();

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid access token" });
    }

    try {
        req.user = jwt.verify(authHeader.split(" ")[1], config.ACCESS_TOKEN_SECRET);
        next();
    } catch (err) {
        const expired = err.name === "TokenExpiredError";
        return res.status(401).json({
            message: expired ? "Access token expired" : "Invalid access token",
            ...(expired && { code: "TOKEN_EXPIRED" }),
        });
    }
};
