// js/auth/auth.js
/**
 * auth.js
 * Handles BOTH the login page and the register page.
 * The page decides which form exists, and only that form is wired up.
 */

import { login, register, googleLoginUrl } from "../api/auth.api.js";
import { getCurrentUser, redirectIfAuthenticated, clearCurrentUser } from "./guard.js";
import { isAdmin } from "./role.js";
import { PATHS } from "../api/config.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    // Already logged in? The login/register pages are useless then.
    const alreadyLoggedIn = await redirectIfAuthenticated();
    if (alreadyLoggedIn) return;

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) loginForm.addEventListener("submit", onLoginSubmit);
    if (registerForm) registerForm.addEventListener("submit", onRegisterSubmit);

    // Google button simply points at the backend OAuth route.
    const googleButton = document.getElementById("google-login");
    if (googleButton) googleButton.href = googleLoginUrl();

    // Shown after a successful registration redirect.
    if (new URLSearchParams(window.location.search).get("registered")) {
        showAlert("form-success", "Account created. You can log in now.");
    }
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

async function onLoginSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const errorBox = document.getElementById("form-error");

    hideAlert(errorBox);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showAlert("form-error", "Please fill in your email and password.");
        return;
    }

    setLoading(button, true, "Logging in...");

    try {
        await login({ email, password });

        // The cookie is set now — ask the backend who we are.
        clearCurrentUser();
        const user = await getCurrentUser({ force: true });

        if (!user) {
            showAlert("form-error", "Login succeeded but the session could not be read.");
            return;
        }

        // `?next=` is used when a guard redirected the user here.
        const next = getSafeNextPath();
        if (next) {
            window.location.replace(next);
        } else {
            window.location.replace(isAdmin(user) ? PATHS.adminDashboard : PATHS.game);
        }
    } catch (error) {
        showAlert("form-error", error.message || "Login failed. Please try again.");
    } finally {
        setLoading(button, false);
    }
}

/* ------------------------------------------------------------------ */
/* Register                                                            */
/* ------------------------------------------------------------------ */

async function onRegisterSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const errorBox = document.getElementById("form-error");

    hideAlert(errorBox);

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !password) {
        showAlert("form-error", "Please fill in every field.");
        return;
    }

    if (password.length < 6) {
        showAlert("form-error", "Password must be at least 6 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        showAlert("form-error", "Passwords do not match.");
        return;
    }

    setLoading(button, true, "Creating account...");

    try {
        /*
         * NOTE: the role is NEVER sent from the client.
         * /api/auth/register always creates a normal "player".
         * Admin accounts are created by an admin via /api/auth/register-admin.
         */
        await register({ name, email, password });

        clearCurrentUser();
        const user = await getCurrentUser({ force: true });

        // Some backends log the user in right after registering.
        window.location.replace(user ? PATHS.game : `${PATHS.login}?registered=1`);
    } catch (error) {
        showAlert("form-error", error.message || "Registration failed. Please try again.");
    } finally {
        setLoading(button, false);
    }
}

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                    */
/* ------------------------------------------------------------------ */

/** Only allow internal paths, so ?next=http://evil.com cannot be abused. */
function getSafeNextPath() {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
    return null;
}

function showAlert(id, message) {
    const box = document.getElementById(id);
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
}

function hideAlert(box) {
    if (!box) return;
    box.textContent = "";
    box.hidden = true;
}

function setLoading(button, isLoading, loadingText = "Please wait...") {
    if (!button) return;

    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
    }
}