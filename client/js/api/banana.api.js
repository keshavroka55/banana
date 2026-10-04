// js/api/banana.api.js
/**
 * banana.api.js
 * Everything that talks to the Banana question endpoint.
 * game.js should never call fetch() directly.
 */

import { request } from "./config.js";

/**
 * GET /api/banana/question
 * Works for guests too — no login required to play.
 */
export function getQuestion() {
    return request("/api/banana/question");
}