// js/api/config.js
/**
 * config.js
 * ------------------------------------------------------------------
 * ONE place for:
 *   - the backend base URL
 *   - page URLs used for redirects
 *   - the shared fetch helper used by every *.api.js module
 * ------------------------------------------------------------------
 */

/*
 * If the client and the backend are served from the SAME origin
 * (Express serves the client folder), keep this as an empty string.
 * Every request will then be relative, e.g. "/api/auth/login".
 *
 * If they run on different ports, use "http://localhost:5000".
 */
export const API_BASE_URL = "http://localhost:5000";

/** Build a full URL for an API path. */
export function apiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

/** Every redirect target lives here so paths are never hard-coded twice. */
export const PATHS = {
    home: "/index.html",
    login: "/html/auth/login.html",
    register: "/html/auth/register.html",
    game: "/html/game/game.html",
    history: "/html/game/history.html",
    adminDashboard: "/html/admin/dashboard.html",
    adminUsers: "/html/admin/users.html"
};

/**
 * Small wrapper around fetch().
 *
 *  - always sends cookies  -> credentials: "include"
 *  - sends and receives JSON
 *  - throws an Error with a `.status` property when the response is not ok
 */
export async function request(path, { method = "GET", body, headers = {} } = {}) {
    const options = {
        method,
        credentials: "include", // the auth cookie travels automatically
        headers: { ...headers }
    };

    if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(apiUrl(path), options);
    return parseResponse(response);
}

/** Turn a Response into JSON data, or throw a helpful Error. */
async function parseResponse(response) {
    let data = null;

    try {
        data = await response.json(); // 204 / empty body -> stays null
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message =
            (data && (data.message || data.error)) ||
            `Request failed with status ${response.status}`;

        const error = new Error(message);
        error.status = response.status; // 401, 403, ... used by guards
        error.data = data;
        throw error;
    }

    return data;
}