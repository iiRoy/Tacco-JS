// This JavaScript script is designed to resolve a specific number theory problem.
// It processes a single integer 'N' from standard input, then searches for three
// positive integers 'h', 'n', and 'w' that satisfy the Egyptian fraction equation:
// 4/N = 1/h + 1/n + 1/w.
// Constraints typically imply 1 <= h, n, w <= 3500.

// --- Standard Input Handling Setup ---

// Ensure the Node.js standard input stream is active and not paused.
process.stdin.resume();

// Configure the character encoding for the incoming data stream to 'utf8'
// to correctly interpret multi-byte characters, if any, though not expected here.
process.stdin.setEncoding('utf8');

// Declare a mutable string buffer to accumulate all data received from stdin.
let inputDataCollector = '';

// Attach an event listener for 'data' events on the stdin stream.
// Each time a chunk of data is available, it's appended to our collector.
process.stdin.on('data', function(dataChunk) {
    inputDataCollector += dataChunk;
});

// Attach an event listener for the 'end' event on the stdin stream.
// This signifies that all input has been received.
process.stdin.on('end', function() {
    // Process the collected input: split by newlines, trim whitespace from each line,
    // and filter out any resulting empty lines to ensure clean data.
    const processedLines = inputDataCollector.split('\n').map(line => line.trim()).filter(Boolean);
    // Invoke the primary logic function with the parsed input.
    solveEgyptianFraction(processedLines);
});


// --- Core Problem Solving Logic ---

// Define the upper boundary for the integer variables (h, n, w) based on problem constraints.
const SEARCH_UPPER_BOUND = 3500;

// A small constant used for floating-point comparisons to account for precision issues.
const FLOAT_COMPARISON_EPSILON = 1e-9;

/**
 * Calculates a lower bound for an iteration variable based on the remaining target value.
 * This helper function prevents unnecessary iterations by starting loops from a more optimized point.
 * @param {number} currentTarget - The target sum remaining for the inverse terms (e.g., K - 1/h).
 * @param {number} minInverseSumForRemainingTerms - The minimum possible sum of inverse values for the subsequent terms.
 *                                                   (e.g., 1/MAX_BOUND for one term, or 2/MAX_BOUND for two terms).
 * @returns {number} The calculated starting integer for the current iteration variable, or 1 if calculation is invalid.
 */
function determineStartingIterationValue(currentTarget, minInverseSumForRemainingTerms) {
    const effectiveDenominator = currentTarget - minInverseSumForRemainingTerms;
    // If the effective denominator is non-positive, it means the currentTarget is too small
    // to accommodate even the minimum possible sum of remaining inverse terms.
    // In such cases, the lower bound calculation would be invalid or yield an extremely large number.
    // We default to 1, as it's the smallest positive integer.
    if (effectiveDenominator <= 0) {
        return 1;
    }
    // Calculate the floor of 1 divided by the effective denominator.
    // The iteration variable must be at least this value.
    return Math.max(1, Math.floor(1 / effectiveDenominator));
}

/**
 * The main function that orchestrates the solution finding process.
 * It parses the input, validates it, and then iteratively searches for the triplet.
 * @param {string[]} inputLineSegments - An array containing the input string(s).
 */
function solveEgyptianFraction(inputLineSegments) {
    // --- Input Validation ---
    if (!inputLineSegments || inputLineSegments.length === 0) {
        console.error("PROGRAM_ERROR: Input data is missing or empty.");
        console.log('0 0 0'); // Output a default error state
        return;
    }

    const rawInputN = inputLineSegments[0];
    const parsedN = Number(rawInputN); // Use Number() for parsing, handling potential non-integer inputs.

    // Validate if 'N' is a positive integer.
    if (isNaN(parsedN) || !Number.isInteger(parsedN) || parsedN <= 0) {
        console.error(`INPUT_ERROR: Provided 'N' value is invalid or not a positive integer: "${rawInputN}"`);
        console.log('0 0 0'); // Output a default error state
        return;
    }

    // --- Pre-computation and Variable Initialization ---
    // The constant K represents 4/N from the equation 4/N = 1/h + 1/n + 1/w.
    const K_VALUE = 4 / parsedN;

    let finalH = 0;
    let finalN = 0;
    let finalW = 0;
    let solutionIsFound = false; // Flag to control loop breaks once a solution is identified.

    // --- Iterative Search for h, n, w ---

    // Calculate the minimum sum of 1/n + 1/w if n and w are both at their maximum allowed value.
    // This value is used to determine a tighter lower bound for 'h'.
    const minPossibleInverseNandWSum = 2 / SEARCH_UPPER_BOUND;
    // Determine the starting point for 'h' based on K_VALUE and the minimum sum of 1/n+1/w.
    const h_start_bound = determineStartingIterationValue(K_VALUE, minPossibleInverseNandWSum);

    // Loop for 'h' (first variable).
    // It iterates from its calculated lower bound up to the global upper bound.
    for (let currentH = h_start_bound; currentH <= SEARCH_UPPER_BOUND; currentH++) {
        // Optimization: if 1/currentH alone already exceeds K_VALUE, then adding 1/n and 1/w
        // (which are positive) would make the sum even larger, so no solution can be found with this 'h'.
        if (1 / currentH > K_VALUE + FLOAT_COMPARISON_EPSILON) {
            continue;
        }

        // Calculate the remaining target value that 1/n + 1/w must sum to.
        const remainingTargetForNW = K_VALUE - (1 / currentH);

        // If the remaining target is non-positive, it means 1/currentH already met or exceeded K_VALUE.
        // No positive 1/n and 1/w can satisfy this, so continue to the next 'h'.
        if (remainingTargetForNW <= FLOAT_COMPARISON_EPSILON) {
            continue;
        }

        // Calculate the minimum sum of 1/w if 'w' is at its maximum allowed value.
        // This helps determine a tighter lower bound for 'n'.
        const minPossibleInverseWSingle = 1 / SEARCH_UPPER_BOUND;
        // Determine the starting point for 'n' based on the remaining target for N/W and min 1/w.
        const n_start_bound = determineStartingIterationValue(remainingTargetForNW, minPossibleInverseWSingle);

        // Loop for 'n' (second variable).
        // It iterates from its calculated lower bound up to the global upper bound.
        for (let currentN = n_start_bound; currentN <= SEARCH_UPPER_BOUND; currentN++) {
            // Optimization 1: If 1/currentN alone exceeds the remaining target for N/W, no solution possible.
            if (1 / currentN > remainingTargetForNW + FLOAT_COMPARISON_EPSILON) {
                continue;
            }
            // Optimization 2: If even 1/currentN + 1/currentN (which is the maximum possible value for 1/n + 1/w
            // given n <= w) is less than the remaining target, no solution possible.
            if ((2 / currentN) < remainingTargetForNW - FLOAT_COMPARISON_EPSILON) {
                continue;
            }

            // Calculate the remaining target value that 1/w must sum to.
            const remainingTargetForW = remainingTargetForNW - (1 / currentN);

            // If the remaining target for 'w' is non-positive, continue.
            if (remainingTargetForW <= FLOAT_COMPARISON_EPSILON) {
                continue;
            }

            // Directly calculate 'w' from the equation: 1/w = remainingTargetForW => w = 1 / remainingTargetForW.
            const calculatedW_raw = 1 / remainingTargetForW;

            // Check if 'calculatedW_raw' is an integer (within floating-point tolerance),
            // and if it satisfies the problem constraints (w >= n and w <= SEARCH_UPPER_BOUND).
            if (Math.abs(calculatedW_raw - Math.round(calculatedW_raw)) < FLOAT_COMPARISON_EPSILON &&
                calculatedW_raw >= currentN - FLOAT_COMPARISON_EPSILON && // w >= n constraint
                calculatedW_raw <= SEARCH_UPPER_BOUND + FLOAT_COMPARISON_EPSILON) { // w <= MAX_BOUND constraint

                // A valid triplet (h, n, w) has been found. Store the rounded integer values.
                finalH = currentH;
                finalN = currentN;
                finalW = Math.round(calculatedW_raw);
                solutionIsFound = true;
                break; // Exit the inner loop for 'n'.
            }
        }

        if (solutionIsFound) {
            break; // Exit the middle loop for 'h'.
        }
    }

    // --- Output Result ---
    if (solutionIsFound) {
        // Print the found triplet in the required space-separated format.
        console.log(`${finalH} ${finalN} ${finalW}`);
    } else {
        // If no solution was found (which should not happen for valid problem inputs),
        // indicate failure or a specific 'not found' state.
        console.log('0 0 0'); // Or -1 -1 -1 depending on problem spec for no solution.
    }

    // Return a status code: 1 for success, 0 for failure (no solution found or invalid input).
    return solutionIsFound ? 1 : 0;
}