// js/auth/role.js
/**
 * role.js
 * All role-related frontend logic lives here so we never repeat
 * `user.role === "admin"` all over the project.
 */

export const ROLE = {
    GUEST: "guest",
    PLAYER: "player",
    ADMIN: "admin"
};

/** Lowercase the role so "ADMIN" and "admin" both work. */
function roleOf(user) {
    return String(user?.role ?? "").toLowerCase();
}

export function isAdmin(user) {
    return roleOf(user) === ROLE.ADMIN;
}

export function isPlayer(user) {
    return roleOf(user) === ROLE.PLAYER;
}

/** A guest is simply "no logged-in user". */
export function isGuest(user) {
    return !user;
}

/** Returns "guest" | "player" | "admin". */
export function getRole(user) {
    if (!user) return ROLE.GUEST;
    if (isAdmin(user)) return ROLE.ADMIN;
    if (isPlayer(user)) return ROLE.PLAYER;
    return ROLE.GUEST;
}

/**
 * The backend might answer /api/auth/me with the user object directly
 * or wrapped as { user: {...} }. This normalises both shapes and
 * returns null when nobody is logged in.
 */
export function normalizeUser(data) {
    if (!data || typeof data !== "object") return null;

    const raw = data.user ?? data;

    // No role means it is not a real user object (e.g. a plain message).
    if (!raw || typeof raw !== "object" || !raw.role) return null;

    return { ...raw, role: String(raw.role).toLowerCase() };
}