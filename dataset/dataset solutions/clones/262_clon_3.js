// --- Configuration Settings and Constants ---

// Defines the maximum number of distinct digits to be used in a permutation,
// corresponding to the highest 'position' or 'depth' in the recursion.
const MAXIMUM_PERMUTATION_LENGTH = 10;

// The largest possible sum achievable by weighting 10 distinct digits (0-9) by their positions (1-10).
// (e.g., 9*10 + 8*9 + ... + 1*2 + 0*1 = 330).
const UPPER_BOUND_WEIGHTED_SUM = 330;

// The highest digit value available for selection (digits are 0 through 9).
const MAX_AVAILABLE_DIGIT = 9;

// The starting point for the recursive depth, representing zero digits used.
const RECURSION_START_DEPTH = 0;

// The initial aggregate sum before any digits are added.
const INITIAL_AGGREGATE_SUM = 0;


// --- Primary Data Storage Initialization ---

// This 2D array serves as a dynamic programming table.
// `weightedSumOccurrenceCounts[k][s]` will store the number of ways
// to form the sum `s` using `k` distinct digits, weighted by their positions.
// Dimensions: `(MAXIMUM_PERMUTATION_LENGTH + 1)` for depth/digit count,
//             `(UPPER_BOUND_WEIGHTED_SUM + 1)` for the possible sums.
const weightedSumOccurrenceCounts = Array.from(
    { length: MAXIMUM_PERMUTATION_LENGTH + 1 },
    () => new Array(UPPER_BOUND_WEIGHTED_SUM + 1).fill(0)
);

// A boolean array to keep track of which digits (0-9) are currently
// part of the active permutation path to ensure distinctness.
// `digitOccupancyStatus[d]` is true if digit `d` is currently used.
const digitOccupancyStatus = new Array(MAX_AVAILABLE_DIGIT + 1).fill(false);


// --- Recursive Permutation Calculation Function ---

/**
 * Recursively generates permutations of distinct digits (0-9) and
 * calculates their weighted sums based on their position in the permutation.
 * The results are stored in the `weightedSumOccurrenceCounts` table.
 *
 * @param {number} currentWeightedAggregate - The sum of (digit * position) accumulated so far.
 * @param {number} currentRecursionDepth - The current 'position' or 'level' in the permutation (0-indexed).
 */
function calculatePermutationWeightedSums(currentWeightedAggregate, currentRecursionDepth) {
    // Record the current state: increment the count for this specific
    // combination of `currentRecursionDepth` digits yielding `currentWeightedAggregate`.
    weightedSumOccurrenceCounts[currentRecursionDepth][currentWeightedAggregate]++;

    // Base Case: If we have reached or exceeded the maximum allowed permutation length,
    // this path cannot extend further. Terminate recursion for this branch.
    if (currentRecursionDepth >= MAXIMUM_PERMUTATION_LENGTH) {
        return;
    }

    // Iterate through all possible digits to select the next digit for the permutation.
    for (let candidateDigit = 0; candidateDigit <= MAX_AVAILABLE_DIGIT; ++candidateDigit) {
        // Skip this digit if it has already been used in the current permutation path.
        // This ensures that all selected digits are distinct.
        if (digitOccupancyStatus[candidateDigit]) {
            continue;
        }

        // Mark the current candidate digit as used for this recursive branch.
        digitOccupancyStatus[candidateDigit] = true;

        // Calculate the new aggregate sum by adding the current digit,
        // weighted by its position, which is `currentRecursionDepth + 1` (1-indexed position).
        const nextWeightedAggregate = currentWeightedAggregate + (candidateDigit * (currentRecursionDepth + 1));

        // Pruning Optimization: If the `nextWeightedAggregate` already exceeds
        // the maximum possible sum we are interested in, then any further additions
        // down this path will also exceed the limit. So, we can stop exploring this branch.
        if (nextWeightedAggregate > UPPER_BOUND_WEIGHTED_SUM) {
            // Important: Unmark the digit before continuing to the next candidate
            // or returning, to ensure proper backtracking.
            digitOccupancyStatus[candidateDigit] = false;
            continue;
        }

        // Recursively call the function to extend the permutation
        // with the new digit and move to the next depth level.
        calculatePermutationWeightedSums(nextWeightedAggregate, currentRecursionDepth + 1);

        // Backtrack: Unmark the candidate digit as used. This allows other
        // permutation branches to potentially use this digit.
        digitOccupancyStatus[candidateDigit] = false;
    }
}


// --- Execution Start: Populate the DP Table ---

// Begin the recursive calculation process from the initial state:
// an empty set of digits (0 depth) and an initial sum of 0.
calculatePermutationWeightedSums(INITIAL_AGGREGATE_SUM, RECURSION_START_DEPTH);


// --- Input/Output Handling ---

// Load the Node.js 'fs' (file system) module to read input.
const fileSystemModule = require('fs');

// Read all input data from '/dev/stdin' (standard input),
// typically used in competitive programming environments.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Split the raw input into individual lines and remove any leading/trailing whitespace.
const inputQueryLines = rawInputContent.trim().split('\n');

// Process each line of input to answer queries.
inputQueryLines.forEach((singleQueryLine) => {
    // Skip processing if the line is empty (e.g., due to trailing newlines in input).
    if (!singleQueryLine.trim()) {
        return;
    }

    // Parse the current line: split by space, convert parts to numbers.
    // The first number is the required digit count, the second is the target sum.
    const [requiredDigitCount, targetSumValue] = singleQueryLine.split(' ').map(Number);

    // Input validation: Check if the query parameters are within the valid bounds
    // of our pre-calculated `weightedSumOccurrenceCounts` table.
    // Queries outside these bounds will naturally have a count of 0.
    if (requiredDigitCount < 0 || requiredDigitCount > MAXIMUM_PERMUTATION_LENGTH ||
        targetSumValue < 0 || targetSumValue > UPPER_BOUND_WEIGHTED_SUM) {
        console.log(0);
        return;
    }

    // Retrieve the pre-calculated count from the DP table.
    // Use the nullish coalescing operator (??) to ensure a default of 0
    // if a lookup somehow results in `undefined`, though with proper bounds
    // this should always yield a number.
    const computedResultCount = weightedSumOccurrenceCounts[requiredDigitCount][targetSumValue] ?? 0;

    // Output the final count for the current query to standard output.
    console.log(computedResultCount);
});