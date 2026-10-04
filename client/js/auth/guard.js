// js/auth/guard.js
/**
 * guard.js
 * Frontend page protection.
 *
 * IMPORTANT: this is only for user experience (redirects, hiding links).
 * The REAL security is the backend's requireAuth / requireRole("admin").
 */

import { getMe } from "../api/auth.api.js";
import { PATHS } from "../api/config.js";
import { isAdmin, normalizeUser } from "./role.js";

/* Small in-memory cache so one page does not call /api/auth/me five times. */
let cachedUser = null;
let hasLoaded = false;

/**
 * Get the current user from the backend.
 * Returns the user object, or null for a guest.
 */
export async function getCurrentUser({ force = false } = {}) {
    if (hasLoaded && !force) return cachedUser;

    try {
        const data = await getMe();
        cachedUser = normalizeUser(data);
    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            cachedUser = null; // normal: the visitor is a guest
        } else {
            console.error("Could not load the current user:", error);
            cachedUser = null;
        }
    }

    hasLoaded = true;
    return cachedUser;
}

/** Forget the cached user (call this after login/logout). */
export function clearCurrentUser() {
    cachedUser = null;
    hasLoaded = false;
}

/**
 * Page guard for logged-in pages (game history, profile, ...).
 * Redirects guests to the login page and returns null.
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        redirectToLogin();
        return null;
    }

    return user;
}

/**
 * Page guard for admin pages.
 *  - guest  -> login page
 *  - player -> game page
 *  - admin  -> continue
 */
export async function requireAdmin() {
    const user = await getCurrentUser();

    if (!user) {
        redirectToLogin();
        return null;
    }

    if (!isAdmin(user)) {
        // A player tried to open an admin page.
        window.location.replace(PATHS.game);
        return null;
    }

    return user;
}

/**
 * Used on login/register pages: an already logged-in user
 * should not see the login form again.
 */
export async function redirectIfAuthenticated() {
    const user = await getCurrentUser();

    if (!user) return null;

    window.location.replace(isAdmin(user) ? PATHS.adminDashboard : PATHS.game);
    return user;
}

/** Send the visitor to the login page, remembering where they wanted to go. */
function redirectToLogin() {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`${PATHS.login}?next=${next}`);
}