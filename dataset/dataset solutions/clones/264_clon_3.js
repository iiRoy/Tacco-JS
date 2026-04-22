// This file implements a solution to count weighted sums of distinct digits using dynamic programming
// and a recursive backtracking approach. It's a Type III clone, featuring extensive changes
// in variable names, code structure, comments, and added robustness.

// --- Configuration Constants ---
// Maximum number of distinct digits that can be used (0 through 9, total 10 digits).
const MAX_DIGIT_SLOTS = 10;
// The highest possible sum achievable. Calculated as 9*10 + 8*9 + ... + 0*1 = 330.
const MAX_CUMULATIVE_SUM = 330;
// The smallest digit allowed in permutations.
const MIN_PERMUTATION_DIGIT = 0;
// The largest digit allowed in permutations.
const MAX_PERMUTATION_DIGIT = 9;
// The initial 'level' or 'position' in the recursive process, representing 0 digits placed.
const STARTING_RECURSION_LEVEL = 0;
// The level at which the recursion terminates (after 10 digits have been placed, `currentLevel` becomes 11).
const RECURSION_TERMINATION_LEVEL = MAX_DIGIT_SLOTS + 1;

// --- Data Structures ---
// A memoization table (2D array) to store the number of ways to achieve a specific sum
// using a certain number of distinct digits.
// `weightedSumCounts[k][s]` stores the count of permutations that result in sum `s`
// when `k` distinct digits have been placed.
let weightedSumCounts = [];

// A boolean array to keep track of which digits (0-9) have been utilized
// in the current path of the recursive permutation exploration.
let digitUsageStatus = new Array(MAX_PERMUTATION_DIGIT + 1).fill(false);

// --- Initialization of Memoization Table ---
// Dynamically create and initialize the `weightedSumCounts` table.
// The outer loop handles the 'number of digits placed' (from 0 to MAX_DIGIT_SLOTS).
for (let numDigitsPlaced = STARTING_RECURSION_LEVEL; numDigitsPlaced <= MAX_DIGIT_SLOTS; numDigitsPlaced++) {
    // Each inner array corresponds to a specific number of digits placed,
    // and stores counts for sums ranging from 0 up to MAX_CUMULATIVE_SUM.
    weightedSumCounts[numDigitsPlaced] = new Array(MAX_CUMULATIVE_SUM + 1).fill(0);
}

// --- Helper Functions for Digit Tracking ---
/**
 * Marks a specific digit as currently being used in the permutation path.
 * @param {number} digitToMark - The digit (0-9) to mark as used.
 */
const markDigitAsUsed = (digitToMark) => {
    digitUsageStatus[digitToMark] = true;
};

/**
 * Unmarks a specific digit, indicating it's no longer used in the current
 * permutation path (used for backtracking).
 * @param {number} digitToUnmark - The digit (0-9) to unmark.
 */
const unmarkDigitAsUsed = (digitToUnmark) => {
    digitUsageStatus[digitToUnmark] = false;
};

// --- Core Recursive Function for Sum Calculation ---
/**
 * Recursively explores all unique permutations of digits (0-9) to calculate
 * weighted sums. The weight of each digit is determined by its position (level).
 *
 * @param {number} currentAccumulatedSum - The sum accumulated so far based on (digit * position).
 * @param {number} currentPermutationLevel - The current position or 'level' in the permutation process.
 *                                          Starts at 0, increments up to MAX_DIGIT_SLOTS.
 */
function calculatePermutationSums(currentAccumulatedSum, currentPermutationLevel) {
    // Type III: Added an early exit guard for sums that exceed the maximum possible.
    // This prunes branches that will never lead to valid results within our table's bounds.
    if (currentAccumulatedSum > MAX_CUMULATIVE_SUM) {
        return;
    }

    // Increment the counter for the current state:
    // `weightedSumCounts[k][s]` is updated when `k` digits have been processed,
    // and their weighted sum is `s`.
    weightedSumCounts[currentPermutationLevel][currentAccumulatedSum]++;

    // Determine the next level for the recursive call.
    const nextPermutationLevel = currentPermutationLevel + 1;

    // Type III: Use a constant for the termination condition.
    // If we have already placed all MAX_DIGIT_SLOTS (10) digits,
    // then `nextPermutationLevel` will be `RECURSION_TERMINATION_LEVEL` (11),
    // so we stop the recursion.
    if (nextPermutationLevel >= RECURSION_TERMINATION_LEVEL) {
        return;
    }

    // Iterate through all possible digits (0-9) to try and place at the current level.
    for (let candidateDigit = MIN_PERMUTATION_DIGIT; candidateDigit <= MAX_PERMUTATION_DIGIT; candidateDigit++) {
        // Type III: Use helper function for checking digit usage.
        if (digitUsageStatus[candidateDigit]) {
            continue; // Skip if this digit is already part of the current permutation path.
        }

        // Type III: Use helper function for marking digit.
        markDigitAsUsed(candidateDigit); // Mark the digit as used for this path.

        // Type III: Introduce an intermediate variable for clarity in sum calculation.
        // The weight of the `candidateDigit` is its position, which is `nextPermutationLevel`.
        const newAccumulatedSum = currentAccumulatedSum + (candidateDigit * nextPermutationLevel);

        // Type III: Add an additional guard to prune branches where the sum already exceeds the maximum.
        // This is more effective than the initial guard at the top of the function for deep branches.
        if (newAccumulatedSum > MAX_CUMULATIVE_SUM) {
            unmarkDigitAsUsed(candidateDigit); // Backtrack even if pruning this branch.
            continue; // This path won't lead to a valid sum within bounds.
        }

        // Recursive call for the next level with the updated sum.
        calculatePermutationSums(newAccumulatedSum, nextPermutationLevel);

        // Type III: Use helper function for unmarking digit (backtracking step).
        unmarkDigitAsUsed(candidateDigit); // Unmark the digit to explore other permutations.
    }
}

// --- Initiate the Calculation Process ---
// Start the recursive process with an initial sum of 0 and at level 0 (before placing any digits).
calculatePermutationSums(0, STARTING_RECURSION_LEVEL);

// --- Input Processing and Output Handling ---

// Type III: Encapsulate file reading in a try-catch block for robustness.
let fileData = '';
try {
    // Type II: Use `const` for module import, rename `input` to `fileData`.
    const fileSystemModule = require('fs');
    fileData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (error) {
    // Type III: Provide a more descriptive error message and exit gracefully.
    console.error("Error reading input from /dev/stdin:", error.message);
    process.exit(1); // Terminate the process if input cannot be read.
}

// Type II: Rename `arr` to `inputQueryLines`, use `const`.
const inputQueryLines = fileData.trim().split("\n");

/**
 * Parses a single line of input (e.g., "N S") into an array of two numbers.
 * Includes basic validation for the format and numerical content.
 * @param {string} lineContent - The raw string from an input line.
 * @returns {Array<number|null>} An array `[numDigits, targetSum]` or `[null, null]` if parsing fails.
 */
const parseQueryInput = (lineContent) => {
    // Type II: Rename internal variables.
    const parts = lineContent.split(" ");
    // Type III: Add validation for expected number of parts.
    if (parts.length !== 2) {
        console.warn(`Warning: Skipping malformed input line "${lineContent}". Expected "N S".`);
        return [null, null];
    }

    const queriedNumDigits = Number(parts[0]);
    const queriedTargetSum = Number(parts[1]);

    // Type III: Validate that parsed values are actual numbers.
    if (isNaN(queriedNumDigits) || isNaN(queriedTargetSum)) {
        console.warn(`Warning: Skipping non-numeric input in line "${lineContent}".`);
        return [null, null];
    }
    return [queriedNumDigits, queriedTargetSum];
};

// Type III: Store all results in an array first, then print them all at once.
const collectedResults = [];

// Type III: Change iteration method from `forEach` to a `for...of` loop for variety.
for (const currentLine of inputQueryLines) {
    // Type III: Skip any empty lines that might result from `split("\n")`.
    if (!currentLine.trim()) {
        continue;
    }

    const [numDigitsInput, targetSumInput] = parseQueryInput(currentLine);

    // If parsing failed (indicated by nulls), skip this line.
    if (numDigitsInput === null || targetSumInput === null) {
        continue;
    }

    // Type III: The original code accesses `dp[n+1][s]`. To replicate this behavior,
    // we adjust the `numDigitsInput` to `numDigitsInput + 1` for table lookup.
    // This implies that `n` in the input might represent (number_of_digits - 1).
    const lookupLevelForQuery = numDigitsInput + 1;

    // Type III: Add robust boundary checks for query parameters against table dimensions.
    // If the query falls outside the pre-calculated range, the answer is 0.
    if (lookupLevelForQuery < STARTING_RECURSION_LEVEL || lookupLevelForQuery > MAX_DIGIT_SLOTS ||
        targetSumInput < 0 || targetSumInput > MAX_CUMULATIVE_SUM) {
        collectedResults.push(0); // No such sum is possible for out-of-bounds queries.
        continue;
    }

    // Type II: Retrieve the result using the adjusted lookup level and store it.
    collectedResults.push(weightedSumCounts[lookupLevelForQuery][targetSumInput]);
}

// Type III: Print all accumulated results, each on a new line.
console.log(collectedResults.join('\n'));