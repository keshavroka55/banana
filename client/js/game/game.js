// js/game/game.js
/**
 * game.js
 * The Banana game itself.
 *
 * Works for EVERYONE:
 *   - guests  -> the score lives in the browser only
 *   - players -> the finished game is saved to their history
 *   - admins  -> same as players
 */

import { getQuestion } from "../api/banana.api.js";
import { saveGameResult } from "../api/game.api.js";
import { getCurrentUser } from "../auth/guard.js";

const POINTS_PER_CORRECT_ANSWER = 10;

/** Fallback buttons used only when the API sends no options at all. */
const FALLBACK_OPTIONS = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" }
];

const state = {
    user: null,
    score: 0,
    correct: 0,
    wrong: 0,
    answered: false,
    loading: false,
    question: null,
    finished: false
};

const el = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
    cacheElements();
    bindEvents();

    // Who is playing? Guests can play too.
    state.user = await getCurrentUser();
    updatePlayerHint();

    await loadQuestion();
}

function cacheElements() {
    el.image = document.getElementById("question-image");
    el.questionText = document.getElementById("question-text");
    el.options = document.getElementById("options");
    el.feedback = document.getElementById("feedback");
    el.status = document.getElementById("game-status");
    el.score = document.getElementById("score");
    el.correct = document.getElementById("correct-count");
    el.wrong = document.getElementById("wrong-count");
    el.playerHint = document.getElementById("player-hint");
    el.nextBtn = document.getElementById("next-btn");
    el.finishBtn = document.getElementById("finish-btn");
    el.restartBtn = document.getElementById("restart-btn");
    el.summary = document.getElementById("summary");
}

function bindEvents() {
    el.nextBtn.addEventListener("click", loadQuestion);
    el.finishBtn.addEventListener("click", finishGame);
    el.restartBtn.addEventListener("click", restartGame);
}

/* ------------------------------------------------------------------ */
/* Loading + rendering a question                                      */
/* ------------------------------------------------------------------ */

async function loadQuestion() {
    if (state.loading) return;

    state.loading = true;
    state.answered = false;
    state.finished = false;

    el.nextBtn.disabled = true;
    el.finishBtn.hidden = false;
    el.restartBtn.hidden = true;
    el.summary.hidden = true;

    clearFeedback();
    setStatus("Loading question…");

    try {
        const raw = await getQuestion();
        const question = normalizeQuestion(raw);

        if (!question) {
            setStatus("The server did not return a question.");
            return;
        }

        state.question = question;
        renderQuestion(question);
        setStatus("");
    } catch (error) {
        console.error("Failed to load a Banana question:", error);
        setStatus("Could not load a question. Please try again.");
    } finally {
        state.loading = false;
    }
}

function renderQuestion(question) {
    // Image (only if the API sent one)
    if (question.image) {
        el.image.src = question.image;
        el.image.alt = question.text || "Banana question";
        el.image.hidden = false;
    } else {
        el.image.removeAttribute("src");
        el.image.hidden = true;
    }

    el.questionText.textContent = question.text || "What is the correct answer?";

    // Answer options
    el.options.innerHTML = "";

    const options = question.options.length ? question.options : FALLBACK_OPTIONS;

    options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-btn";
        button.textContent = option.label;
        button.dataset.value = option.value;
        button.addEventListener("click", () => answer(option.value, button));
        el.options.appendChild(button);
    });
}

/* ------------------------------------------------------------------ */
/* Answering                                                           */
/* ------------------------------------------------------------------ */

function answer(choice, clickedButton) {
    if (state.answered || !state.question) return;
    state.answered = true;

    const correctAnswer = state.question.correctAnswer;
    const buttons = Array.from(el.options.querySelectorAll(".option-btn"));
    buttons.forEach((button) => (button.disabled = true));

    el.nextBtn.disabled = false; // the player can always move on

    // The API did not send the answer — we cannot score it locally.
    if (correctAnswer === null) {
        clickedButton.classList.add("selected");
        showFeedback("neutral", "Answer submitted. No answer key was returned by the server.");
        return;
    }

    const isRight =
        String(choice).toLowerCase() === String(correctAnswer).toLowerCase();

    // Always reveal the correct option.
    buttons.forEach((button) => {
        if (String(button.dataset.value).toLowerCase() === String(correctAnswer).toLowerCase()) {
            button.classList.add("correct");
        }
    });

    if (isRight) {
        state.score += POINTS_PER_CORRECT_ANSWER;
        state.correct += 1;
        clickedButton.classList.add("correct");
        showFeedback("success", `Correct! +${POINTS_PER_CORRECT_ANSWER} points`);
    } else {
        state.wrong += 1;
        clickedButton.classList.add("wrong");
        showFeedback("error", `Wrong. The correct answer was "${correctAnswer}".`);
    }

    updateScoreBoard();
}

/* ------------------------------------------------------------------ */
/* Finishing the game                                                  */
/* ------------------------------------------------------------------ */

async function finishGame() {
    const answeredCount = state.correct + state.wrong;

    if (answeredCount === 0) {
        setStatus("Answer at least one question before finishing.");
        return;
    }

    state.finished = true;

    el.finishBtn.hidden = true;
    el.nextBtn.disabled = true;
    el.restartBtn.hidden = false;

    showSummary();

    // Guests keep their score in the browser only.
    if (!state.user) {
        setStatus("You are playing as a guest — log in to save your score to your history.");
        return;
    }

    setStatus("Saving your game…");

    try {
        await saveGameResult({
            score: state.score,
            correct: state.correct,
            wrong: state.wrong,
            total: answeredCount
        });
        setStatus("Game saved to your history.");
    } catch (error) {
        console.warn("Could not save the game:", error);
        setStatus("The game finished, but it could not be saved.");
    }
}

function restartGame() {
    state.score = 0;
    state.correct = 0;
    state.wrong = 0;
    state.answered = false;
    state.finished = false;
    state.question = null;

    updateScoreBoard();

    el.summary.hidden = true;
    el.summary.innerHTML = "";
    el.restartBtn.hidden = true;
    el.finishBtn.hidden = false;

    loadQuestion();
}

/* ------------------------------------------------------------------ */
/* Question normalisation                                              */
/* ------------------------------------------------------------------ */

/**
 * The backend may return the question in a few different shapes, e.g.
 *   { id, text, options, correctAnswer }
 *   { question: { ... } }
 *   { question: "Is this a banana?", imageUrl, answer }
 * This function turns all of them into one predictable object.
 */
function normalizeQuestion(raw) {
    if (!raw) return null;

    const q =
        raw.question && typeof raw.question === "object" ? raw.question : raw;

    if (typeof q === "string") {
        return {
            id: null,
            text: q,
            image: raw.image ?? raw.imageUrl ?? null,
            options: [],
            correctAnswer: raw.answer ?? raw.correctAnswer ?? null
        };
    }

    if (typeof q !== "object") return null;

    const rawOptions = q.options || q.choices || q.answers || [];
    const correct = q.correctAnswer ?? q.answer ?? q.correct ?? q.correctOption ?? null;

    return {
        id: q.id ?? q._id ?? null,
        text:
            q.text ??
            q.title ??
            q.prompt ??
            (typeof raw.question === "string" ? raw.question : ""),
        image: q.image ?? q.imageUrl ?? q.url ?? null,
        options: Array.isArray(rawOptions) ? rawOptions.map(normalizeOption) : [],
        correctAnswer: correct === null || correct === undefined ? null : String(correct)
    };
}

/** Options may be plain strings, numbers or objects. */
function normalizeOption(option, index) {
    if (option && typeof option === "object") {
        const label =
            option.text ?? option.label ?? option.value ?? option.name ?? `Option ${index + 1}`;
        const value = option.id ?? option.value ?? option.text ?? option.label ?? index;

        return { value: String(value), label: String(label) };
    }

    return { value: String(option), label: String(option) };
}

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                    */
/* ------------------------------------------------------------------ */

function updateScoreBoard() {
    el.score.textContent = state.score;
    el.correct.textContent = state.correct;
    el.wrong.textContent = state.wrong;
}

function updatePlayerHint() {
    if (state.user) {
        const name = state.user.name || state.user.email || "player";
        el.playerHint.textContent = `Playing as ${name} — your score will be saved.`;
    } else {
        el.playerHint.textContent = "Playing as guest — your score stays in this browser.";
    }
}

function showSummary() {
    const answered = state.correct + state.wrong;

    el.summary.innerHTML = `
        <h3>Game finished</h3>
        <p>
            Score: <strong>${state.score}</strong> ·
            Correct: <strong>${state.correct}</strong> ·
            Wrong: <strong>${state.wrong}</strong> ·
            Questions answered: <strong>${answered}</strong>
        </p>
    `;
    el.summary.hidden = false;
}

function setStatus(message) {
    el.status.textContent = message;
}

function showFeedback(type, message) {
    el.feedback.className = `feedback feedback-${type}`;
    el.feedback.textContent = message;
    el.feedback.hidden = false;
}

function clearFeedback() {
    el.feedback.textContent = "";
    el.feedback.hidden = true;
    el.feedback.className = "feedback";
}