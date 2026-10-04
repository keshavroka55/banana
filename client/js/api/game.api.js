// js/api/game.api.js
/**
 * game.api.js
 * Game history + saving a finished game.
 */

import { request } from "./config.js";

/** GET /api/games/history — only for logged-in users. */
export function getGameHistory() {
    return request("/api/games/history");
}

/**
 * Save a finished game.
 *
 * NOTE: the save endpoint was not listed in the backend contract.
 * The path below is the most common convention. If your backend uses a
 * different path (for example "/api/games/save"), change it HERE only —
 * nothing else in the project calls this directly.
 *
 * The game still works if this call fails; it is wrapped in try/catch
 * inside game.js.
 */
export function saveGameResult(result) {
    return request("/api/games", {
        method: "POST",
        body: result
    });
}