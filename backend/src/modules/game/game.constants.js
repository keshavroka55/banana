// Game rules live in ONE place so the service, and the API responses stay consistent.
export const TOTAL_ROUNDS = 10;          // questions in one registered-user game
export const POINTS_PER_CORRECT = 10;    // score awarded per correct answer
export const QUESTION_TTL_MS = 10 * 60 * 1000; // a question must be answered within 10 minutes

// External puzzle provider
export const BANANA_API_URL = "https://marcconrad.com/uob/banana/api.php?out=json&base64=no";
export const BANANA_TIMEOUT_MS = 10000;
