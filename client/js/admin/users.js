// js/admin/users.js
/**
 * users.js
 * Admin user management: list, create, edit, delete.
 *
 * Guard: requireAdmin() at the top — a player or guest never gets here.
 * 401 / 403 are already handled inside admin.api.js.
 */

import { requireAdmin } from "../auth/guard.js";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../api/admin.api.js";

/* Cached list so "Edit" does not need a second API round-trip. */
let users = [];

/* DOM references */
const el = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
    // Guard first — do nothing else until we know this is an admin.
    const current = await requireAdmin();
    if (!current) return; // already redirected

    cacheElements();
    bindEvents();

    await loadUsers();
}

function cacheElements() {
    el.body = document.getElementById("users-body");
    el.status = document.getElementById("users-status");
    el.pageError = document.getElementById("page-error");

    el.createBtn = document.getElementById("create-user-btn");

    el.modal = document.getElementById("user-modal");
    el.modalTitle = document.getElementById("modal-title");
    el.modalError = document.getElementById("modal-error");
    el.modalClose = document.getElementById("modal-close");
    el.modalCancel = document.getElementById("modal-cancel");
    el.modalSubmit = document.getElementById("modal-submit");
    el.form = document.getElementById("user-form");

    el.id = document.getElementById("user-id");
    el.name = document.getElementById("user-name");
    el.email = document.getElementById("user-email");
    el.password = document.getElementById("user-password");
    el.passwordHint = document.getElementById("password-hint");
    el.role = document.getElementById("user-role");
    el.bio = document.getElementById("user-bio");
    el.avatar = document.getElementById("user-avatar");
}

function bindEvents() {
    el.createBtn.addEventListener("click", () => openModal());
    el.modalClose.addEventListener("click", closeModal);
    el.modalCancel.addEventListener("click", closeModal);
    el.form.addEventListener("submit", onSubmit);

    // Clicking the dark backdrop closes the modal.
    el.modal.addEventListener("click", (event) => {
        if (event.target === el.modal) closeModal();
    });

    // ESC closes the modal.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !el.modal.hidden) closeModal();
    });
}

/* ------------------------------------------------------------------ */
/* Loading + rendering the table                                       */
/* ------------------------------------------------------------------ */

async function loadUsers() {
    el.status.textContent = "Loading users…";
    hideAlert(el.pageError);

    try {
        users = normalizeUsers(await getUsers());
        renderTable();

        el.status.textContent = users.length
            ? `${users.length} user${users.length === 1 ? "" : "s"}.`
            : "No users yet. Click “+ Create User” to add one.";
    } catch (error) {
        // 401 / 403 already handled in admin.api.js
        console.error("Failed to load users:", error);
        el.status.textContent = "";
        showAlert(el.pageError, "Could not load users. Please try again.");
    }
}

function normalizeUsers(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function renderTable() {
    el.body.innerHTML = "";

    users.forEach((user) => {
        const row = document.createElement("tr");

        const role = String(user.role || "player").toLowerCase();
        const badgeClass = role === "admin" ? "badge badge-admin" : "badge";

        row.innerHTML = `
            <td>${escapeHtml(user.name ?? "—")}</td>
            <td>${escapeHtml(user.email ?? "—")}</td>
            <td><span class="${badgeClass}">${escapeHtml(role)}</span></td>
            <td>
                <div class="row-actions">
                    <button class="btn btn-ghost btn-sm" data-action="edit">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete">Delete</button>
                </div>
            </td>
        `;

        row.querySelector('[data-action="edit"]').addEventListener("click", () =>
            openModal(user)
        );
        row.querySelector('[data-action="delete"]').addEventListener("click", () =>
            onDelete(user)
        );

        el.body.appendChild(row);
    });
}

/* ------------------------------------------------------------------ */
/* Create / Edit modal                                                 */
/* ------------------------------------------------------------------ */

function openModal(user = null) {
    hideAlert(el.modalError);
    el.form.reset();

    if (user) {
        // -------- Edit mode --------
        el.modalTitle.textContent = "Edit User";
        el.id.value = user.id ?? user._id ?? "";
        el.name.value = user.name ?? "";
        el.email.value = user.email ?? "";
        el.password.value = "";
        el.role.value = String(user.role || "player").toLowerCase();
        el.bio.value = user.bio ?? "";
        el.avatar.value = user.avatar ?? "";

        // Password is optional when editing.
        el.passwordHint.hidden = false;
        el.password.required = false;
    } else {
        // -------- Create mode --------
        el.modalTitle.textContent = "Create User";
        el.id.value = "";
        el.role.value = "player";

        el.passwordHint.hidden = true;
        el.password.required = true;
    }

    el.modal.hidden = false;
    el.name.focus();
}

function closeModal() {
    el.modal.hidden = true;
    hideAlert(el.modalError);
}

async function onSubmit(event) {
    event.preventDefault();

    hideAlert(el.modalError);

    const id = el.id.value;
    const isEdit = Boolean(id);

    const name = el.name.value.trim();
    const email = el.email.value.trim();
    const password = el.password.value;
    const role = el.role.value;
    const bio = el.bio.value.trim();
    const avatar = el.avatar.value.trim();

    if (!name || !email) {
        showAlert(el.modalError, "Name and email are required.");
        return;
    }

    if (!isEdit && !password) {
        showAlert(el.modalError, "Password is required when creating a user.");
        return;
    }

    if (password && password.length < 6) {
        showAlert(el.modalError, "Password must be at least 6 characters long.");
        return;
    }

    // Build the payload. IMPORTANT: never send an empty password on edit.
    const payload = { name, email, role };
    if (bio) payload.bio = bio;
    if (avatar) payload.avatar = avatar;
    if (password) payload.password = password;

    const originalText = el.modalSubmit.textContent;
    el.modalSubmit.disabled = true;
    el.modalSubmit.textContent = isEdit ? "Saving…" : "Creating…";

    try {
        if (isEdit) {
            await updateUser(id, payload);
        } else {
            await createUser(payload);
        }

        closeModal();
        await loadUsers();
    } catch (error) {
        // 401 / 403 already handled in admin.api.js
        showAlert(el.modalError, error.message || "Could not save the user.");
    } finally {
        el.modalSubmit.disabled = false;
        el.modalSubmit.textContent = originalText;
    }
}

/* ------------------------------------------------------------------ */
/* Delete                                                              */
/* ------------------------------------------------------------------ */

async function onDelete(user) {
    const label = user.name || user.email || "this user";

    if (!window.confirm(`Are you sure you want to delete ${label}?`)) return;

    try {
        await deleteUser(user.id ?? user._id);
        await loadUsers();
    } catch (error) {
        // 401 / 403 already handled in admin.api.js
        showAlert(el.pageError, error.message || "Could not delete the user.");
    }
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function showAlert(box, message) {
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
}

function hideAlert(box) {
    if (!box) return;
    box.textContent = "";
    box.hidden = true;
}

/** Prevent HTML injection when rendering user-supplied strings. */
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}