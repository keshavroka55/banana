// js/admin/dashboard.js
/**
 * dashboard.js
 * Loads the admin dashboard stats and shows them.
 *
 * There is no dedicated "stats" endpoint in the backend contract,
 * so we simply count the users returned by GET /api/admin/users.
 * That is fine for a college project.
 */

import { requireAdmin } from "../auth/guard.js";
import { getUsers } from "../api/admin.api.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    // Guard: only admins reach this page. Everyone else is redirected.
    const user = await requireAdmin();
    if (!user) return; // requireAdmin already redirected

    const errorBox = document.getElementById("dashboard-error");

    try {
        const users = normalizeUsers(await getUsers());

        document.getElementById("stat-total").textContent = users.length;
        document.getElementById("stat-players").textContent = users.filter(
            (u) => String(u.role).toLowerCase() === "player"
        ).length;
        document.getElementById("stat-admins").textContent = users.filter(
            (u) => String(u.role).toLowerCase() === "admin"
        ).length;
    } catch (error) {
        // 401 / 403 were already handled by admin.api.js.
        console.error("Failed to load dashboard stats:", error);
        showError(errorBox, "Could not load dashboard data. Please try again.");
    }
}

/** The API may answer with an array or wrap it in an object. */
function normalizeUsers(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function showError(box, message) {
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
}