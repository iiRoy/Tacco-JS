process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = '';

process.stdin.on('data', (incomingDataSegment) => {
    rawInputBuffer += incomingDataSegment;
});

process.stdin.on('end', () => {
    processBufferedInput(rawInputBuffer);
});

/**
 * Processes the raw buffered input, extracting necessary data for the solver.
 * @param {string} fullInputString The complete string received from stdin.
 */
function processBufferedInput(fullInputString) {
    const lineSegments = fullInputString.trim().split(/\r?\n/);

    const solutionResult = FindEgyptianFractions(lineSegments);

    if (solutionResult.found) {
        console.log(`${solutionResult.h} ${solutionResult.n} ${solutionResult.w}`);
    } else {
        console.log("No solution found within specified bounds.");
    }
}

/**
 * Finds integer denominators (h, n, w) for an Egyptian fraction representation of 4/K.
 * The problem seeks 1/h + 1/n + 1/w = 4/K, with h, n, w up to 3500.
 *
 * @param {string[]} lineSegments An array containing the input lines. The first element
 *                                 is expected to be the integer K.
 * @returns {{h: number, n: number, w: number, found: boolean}} An object containing
 *          the found denominators and a boolean indicating if a solution was found.
 */
function FindEgyptianFractions(lineSegments) {
    const targetIntegerK = Number(lineSegments[0]);

    const MAX_DENOMINATOR_LIMIT = 3500;
    const EPSILON = 1e-9; // For floating-point comparisons

    if (isNaN(targetIntegerK) || targetIntegerK <= 0) {
        console.error("Invalid or non-positive target integer K provided.");
        return { h: -1, n: -1, w: -1, found: false };
    }

    const targetFractionValue = 4.0 / targetIntegerK;

    const smallTermOne = 2.0 / MAX_DENOMINATOR_LIMIT;
    const smallTermTwo = 1.0 / MAX_DENOMINATOR_LIMIT;

    let reciprocalH = 0;
    let reciprocalN = 0;
    let reciprocalW = 0;
    let foundSolution = false;

    const solutionContainer = { h: 0, n: 0, w: 0, found: false };

    for (reciprocalH = 1; reciprocalH <= MAX_DENOMINATOR_LIMIT; reciprocalH++) {
        const currentHReciprocal = 1.0 / reciprocalH;

        if (targetFractionValue < currentHReciprocal + smallTermOne - EPSILON) {
            // If even with the smallest possible 1/n and 1/w (2/MAX_DENOMINATOR_LIMIT),
            // the sum 1/h + 1/n + 1/w is already too large, this h is too small.
            continue;
        }

        for (reciprocalN = reciprocalH; reciprocalN <= MAX_DENOMINATOR_LIMIT; reciprocalN++) {
            const currentNReciprocal = 1.0 / reciprocalN;
            const sumOfTwoReciprocals = currentHReciprocal + currentNReciprocal;

            if (targetFractionValue < sumOfTwoReciprocals + smallTermTwo - EPSILON) {
                // If even with the smallest possible 1/w (1/MAX_DENOMINATOR_LIMIT),
                // the sum 1/h + 1/n + 1/w is already too large, this (h, n) pair is invalid.
                continue;
            }

            for (reciprocalW = reciprocalN; reciprocalW <= MAX_DENOMINATOR_LIMIT; reciprocalW++) {
                const currentWReciprocal = 1.0 / reciprocalW;
                const totalReciprocalSum = sumOfTwoReciprocals + currentWReciprocal;

                if (Math.abs(totalReciprocalSum - targetFractionValue) < EPSILON) {
                    solutionContainer.h = reciprocalH;
                    solutionContainer.n = reciprocalN;
                    solutionContainer.w = reciprocalW;
                    solutionContainer.found = true;
                    foundSolution = true;
                    break;
                }

                if (totalReciprocalSum > targetFractionValue + EPSILON) {
                    // If the current sum already exceeds the target, and w is increasing
                    // (meaning 1/w is decreasing), further increasing w will only make
                    // the sum smaller, moving away from the target or staying too large.
                    // No need to continue with larger 'w' values for this 'h' and 'n'.
                    break;
                }
            }

            if (foundSolution) {
                break;
            }
        }

        if (foundSolution) {
            break;
        }
    }

    return solutionContainer;
}