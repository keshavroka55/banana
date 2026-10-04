// js/main.js
/**
 * main.js
 * Common behaviour for EVERY page:
 *   - checks who the current user is
 *   - builds the navigation
 *   - handles logout
 *
 * Game logic does NOT belong here (see js/game/game.js).
 */

import { getCurrentUser, clearCurrentUser } from "./auth/guard.js";
import { isAdmin, isPlayer } from "./auth/role.js";
import { logout } from "./api/auth.api.js";
import { PATHS } from "./api/config.js";

document.addEventListener("DOMContentLoaded", () => {
    renderNavigation();
});

/** Build the nav bar for guest / player / admin. */
export async function renderNavigation() {
    const nav = document.getElementById("app-nav");
    if (!nav) return;

    const user = await getCurrentUser();

    nav.innerHTML = buildNavMarkup(user);
    wireLogout(nav);
}

function buildNavMarkup(user) {
    const links = [];

    // Everyone (including guests) can play.
    links.push(navLink("Play", PATHS.game));

    if (user) {
        // Player + Admin
        links.push(navLink("History", PATHS.history));
    }

    if (isAdmin(user)) {
        // Admin only
        links.push(navLink("Admin Dashboard", PATHS.adminDashboard));
        links.push(navLink("Users", PATHS.adminUsers));
    }

    if (!user) {
        links.push(navLink("Login", PATHS.login));
        links.push(navLink("Register", PATHS.register));
    } else {
        links.push(
            `<button type="button" class="nav-link" data-action="logout">Logout</button>`
        );
    }

    return links.join("");
}

function navLink(label, href) {
    const isActive = window.location.pathname === href;
    return `<a class="nav-link${isActive ? " active" : ""}" href="${href}">${label}</a>`;
}

/** One shared logout handler for every page. */
function wireLogout(nav) {
    const button = nav.querySelector('[data-action="logout"]');
    if (!button) return;

    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "Logging out...";

        try {
            await logout(); // credentials: "include" is added by the api module
        } catch (error) {
            console.warn("Logout request failed:", error);
        }

        // Clear local state and become a guest again.
        clearCurrentUser();
        window.location.href = PATHS.game;
    });
}