import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { BANANA_API_URL, BANANA_TIMEOUT_MS } from "../modules/game/game.constants.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Puzzles collected earlier by banana-scraper/ (used only when the live API fails)
const LOCAL_PUZZLES_FILE = path.resolve(__dirname, "../../../banana-scraper/banana-images.json");

let localPuzzles = null; // loaded lazily, then cached

// Accept only puzzles that have a real image URL and an integer solution.
const isValidPuzzle = (data) =>
    data &&
    typeof data.question === "string" &&
    /^https?:\/\//.test(data.question) &&
    Number.isInteger(Number(data.solution)) &&
    data.solution !== null &&
    data.solution !== "";

async function fetchFromBananaApi() {
    const response = await fetch(BANANA_API_URL, {
        signal: AbortSignal.timeout(BANANA_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Banana API responded with HTTP ${response.status}`);

    const data = await response.json();
    if (!isValidPuzzle(data)) throw new Error("Banana API returned an unexpected format");

    return { imageUrl: data.question, solution: Number(data.solution), source: "banana-api" };
}

async function fetchFromLocalData() {
    if (!localPuzzles) {
        const file = await readFile(LOCAL_PUZZLES_FILE, "utf-8");
        localPuzzles = JSON.parse(file).filter(
            (p) => typeof p.imageUrl === "string" && Number.isInteger(p.solution)
        );
    }
    if (localPuzzles.length === 0) throw new Error("No local puzzles available");

    const puzzle = localPuzzles[Math.floor(Math.random() * localPuzzles.length)];
    return { imageUrl: puzzle.imageUrl, solution: puzzle.solution, source: "local-cache" };
}

/**
 * Returns { imageUrl, solution, source }.
 * Tries the live API first, then the scraped local data.
 * Throws only if BOTH fail.
 */
export async function getPuzzle() {
    try {
        return await fetchFromBananaApi();
    } catch (apiError) {
        console.warn("Banana API unavailable, using local puzzles:", apiError.message);
        return await fetchFromLocalData();
    }
}
