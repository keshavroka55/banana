// js/api/admin.api.js
/**
 * admin.api.js
 * All admin-only API calls live here.
 *
 * Section 24 of the spec says:
 *   401 -> redirect to login
 *   403 -> show "no permission" + redirect to game
 *
 * Both of those are handled centrally by `adminRequest()` below so the
 * page scripts stay clean and the behaviour is consistent everywhere.
 *
 * NOTE: The real protection is the backend's requireAuth + requireRole("admin").
 * This module is only for user experience.
 */

import { request, PATHS } from "./config.js";

/**
 * Wrapper around request() that handles admin auth failures.
 * Pages should only need to deal with OTHER errors (validation, 500, ...).
 */
async function adminRequest(path, options = {}) {
    try {
        return await request(path, options);
    } catch (error) {
        if (error.status === 401) {
            // Not logged in (or session expired) -> login page.
            window.location.replace(PATHS.login);
            throw error;
        }

        if (error.status === 403) {
            // Logged in, but not an admin. Do not leak backend details.
            alert("You do not have permission to access this page.");
            window.location.replace(PATHS.game);
            throw error;
        }

        throw error;
    }
}

/* ------------------------------------------------------------------ */
/* Users CRUD                                                          */
/* ------------------------------------------------------------------ */

/** GET /api/admin/users */
export function getUsers() {
    return adminRequest("/api/admin/users");
}

/** GET /api/admin/users/:id */
export function getUserById(id) {
    return adminRequest(`/api/admin/users/${id}`);
}

/** POST /api/admin/users — { name, email, password, role, bio?, avatar? } */
export function createUser(data) {
    return adminRequest("/api/admin/users", {
        method: "POST",
        body: data
    });
}

/**
 * PATCH /api/admin/users/:id
 * Only send the fields the admin actually changed.
 * Never send an empty password unless it is being changed.
 */
export function updateUser(id, data) {
    return adminRequest(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: data
    });
}

/** DELETE /api/admin/users/:id */
export function deleteUser(id) {
    return adminRequest(`/api/admin/users/${id}`, { method: "DELETE" });
}