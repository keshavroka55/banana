// js/game/history.js
/**
 * history.js
 * Shows the logged-in user's game history.
 * Guests are redirected to the login page by requireAuth().
 */

import { getGameHistory } from "../api/game.api.js";
import { requireAuth } from "../auth/guard.js";
import { PATHS } from "../api/config.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    // Guard: only logged-in users reach this page.
    const user = await requireAuth();
    if (!user) return; // requireAuth already redirected

    const status = document.getElementById("history-status");
    const tbody = document.getElementById("history-body");

    status.textContent = "Loading your games…";

    try {
        const data = await getGameHistory();
        const games = normalizeHistory(data);

        renderHistory(games, tbody);

        status.textContent = games.length
            ? `${games.length} saved game${games.length === 1 ? "" : "s"}.`
            : "You have not finished a saved game yet. Play a game and press “Finish Game”.";
    } catch (error) {
        if (error.status === 401) {
            // Session expired while on the page.
            window.location.replace(PATHS.login);
            return;
        }

        console.error("Failed to load game history:", error);
        status.textContent = "Could not load your game history. Please try again.";
    }
}

/** The API may answer with an array or wrap it in an object. */
function normalizeHistory(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.games)) return data.games;
    if (Array.isArray(data?.history)) return data.history;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function renderHistory(games, tbody) {
    tbody.innerHTML = "";

    games.forEach((game) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${numberOr(game.score, 0)}</td>
            <td>${numberOr(game.correct, 0)}</td>
            <td>${numberOr(game.wrong, 0)}</td>
            <td>${formatDate(game.completedAt || game.createdAt || game.date)}</td>
        `;

        tbody.appendChild(row);
    });
}

function numberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}