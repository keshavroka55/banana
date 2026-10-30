/**
 * Build the four answer choices for one puzzle:
 * the correct answer + three DIFFERENT wrong answers, in random order.
 *
 * Banana puzzles have single-digit answers (0-9), so wrong answers are
 * picked from the same range (never negative). The range widens only if a
 * solution is ever outside 0-9.
 */
export function generateOptions(solution) {
    const low = solution >= 0 ? 0 : solution - 5;
    const high = solution <= 9 ? 9 : solution + 5;

    const wrongPool = [];
    for (let n = low; n <= high; n++) {
        if (n !== solution) wrongPool.push(n);
    }

    const wrongAnswers = shuffle(wrongPool).slice(0, 3);
    return shuffle([solution, ...wrongAnswers]);
}

// Fisher-Yates shuffle (unbiased, unlike sort(() => Math.random() - 0.5))
function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
