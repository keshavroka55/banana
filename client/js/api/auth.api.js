// js/api/auth.api.js
/**
 * auth.api.js
 * Every authentication call the frontend needs.
 * All of them go through the shared `request()` helper so cookies
 * (credentials: "include") and JSON handling stay consistent.
 */

import { request, apiUrl } from "./config.js";

/** Create a normal player account. The role is decided by the backend. */
export function register({ name, email, password }) {
    return request("/api/auth/register", {
        method: "POST",
        body: { name, email, password } // never send a role from here
    });
}

/** Log in. The backend answers with an HTTP-only cookie. */
export function login({ email, password }) {
    return request("/api/auth/login", {
        method: "POST",
        body: { email, password }
    });
}

/** Log out of this browser only. */
export function logout() {
    return request("/api/auth/logout", { method: "POST" });
}

/** Log out of every device/session. */
export function logoutAll() {
    return request("/api/auth/logout-all", { method: "POST" });
}

/**
 * Who am I?
 * This is the ONLY source of truth for the current user and role.
 * Throws an Error with status 401 when nobody is logged in.
 */
export function getMe() {
    return request("/api/auth/me");
}

/** Ask the backend to refresh the auth cookie. */
export function refreshToken() {
    return request("/api/auth/refresh-token", { method: "POST" });
}

/** Start the password reset flow. */
export function forgotPassword(email) {
    return request("/api/auth/forgot-password", {
        method: "POST",
        body: { email }
    });
}

/** Finish the password reset flow. */
export function resetPassword({ token, password }) {
    return request("/api/auth/reset-password", {
        method: "POST",
        body: { token, password }
    });
}

/** URL for the Google OAuth redirect (just a normal browser navigation). */
export function googleLoginUrl() {
    return apiUrl("/api/auth/google");
}