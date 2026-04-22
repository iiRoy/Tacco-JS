const ioModule = require('fs'); // Renamed `fs` to `ioModule` for clarity in I/O operations

/**
 * Reads and processes standard input into an array of strings.
 * Handles potential errors during file reading and filters out empty lines.
 * This function encapsulates the input acquisition logic.
 * @returns {string[]} An array where each element is a line from standard input.
 */
const retrieveInputLines = () => {
    try {
        // Read the entire standard input synchronously using UTF-8 encoding.
        // This method is generally simpler than managing buffers manually with fstatSync/readSync
        // for typical competitive programming input sizes, and avoids potential issues
        // with buffer length if fstatSync is not perfectly accurate or if input streams
        // behave unexpectedly.
        const rawInputData = ioModule.readFileSync(process.stdin.fd, 'utf8');

        // Trim leading/trailing whitespace from the entire input block,
        // then split into lines. Filter out any resulting empty strings
        // to ensure only meaningful lines are processed.
        const parsedLines = rawInputData.trim().split('\n').filter(line => line.length > 0);
        return parsedLines;
    } catch (readError) {
        // Log an error if input reading fails and return an empty array
        // to gracefully handle scenarios where stdin might be unavailable or malformed.
        console.error('ERROR: Failed to read standard input stream:', readError.message);
        return [];
    }
};

// Execute the input retrieval immediately upon script load.
const processedLines = retrieveInputLines(); // Renamed `input` to `processedLines`

// A 3D array used for memoization (dynamic programming cache).
// Dimensions are: [maxAvailableDigit][remainingSumToAchieve][digitsLeftToSelect].
// Max digit is 9 (index 0-9), max sum is 45 (for 0+1+...+9), max digits to select is 10.
// Initialized with `null` to distinguish uncomputed states from valid zero results.
const memoizationCache = Array(10).fill(null).map(() =>
    Array(46).fill(null).map(() =>
        Array(11).fill(null)
    )
);

/**
 * Recursively calculates the number of ways to choose a specified number of distinct digits
 * (each less than or equal to a given maximum available digit) that sum up to a target value.
 * This function uses memoization to optimize repeated sub-problem calculations.
 *
 * Renamed `conv` to `computeCombinationsWithMaxDigit` for better descriptive naming.
 * Renamed parameters: `start` -> `maxAvailableDigit`, `dist` -> `remainingSumToAchieve`, `limit` -> `digitsLeftToSelect`.
 *
 * @param {number} maxAvailableDigit The largest digit that can be considered for selection in this recursive step (inclusive, 0-9).
 * @param {number} remainingSumToAchieve The sum that still needs to be achieved.
 * @param {number} digitsLeftToSelect The number of distinct digits yet to be selected.
 * @returns {number} The count of unique combinations satisfying the criteria.
 */
function computeCombinationsWithMaxDigit(maxAvailableDigit, remainingSumToAchieve, digitsLeftToSelect) {
    // --- Guard Clauses and Base Cases for Recursive Function ---

    // 1. Invalid states: If any parameter falls into a negative range,
    //    it indicates an impossible or malformed sub-problem. Return 0 ways.
    if (maxAvailableDigit < 0 || remainingSumToAchieve < 0 || digitsLeftToSelect < 0) {
        return 0;
    }

    // 2. Base case: If no more digits need to be selected.
    //    If the remaining sum is exactly 0, a valid combination was found. Return 1 way.
    //    Otherwise, if digits are exhausted but sum is not 0, it's an invalid path. Return 0 ways.
    if (digitsLeftToSelect === 0) {
        return remainingSumToAchieve === 0 ? 1 : 0;
    }

    // 3. Optimization/Pruning: Check if it's impossible to reach the target sum
    //    with the remaining digits and available range of numbers.

    //    a) Minimum possible sum: If `digitsLeftToSelect` digits must be chosen,
    //       the smallest possible sum is achieved by picking 0, 1, 2, ..., (digitsLeftToSelect - 1).
    const minPossibleSumForRemainingDigits = digitsLeftToSelect * (digitsLeftToSelect - 1) / 2;
    if (remainingSumToAchieve < minPossibleSumForRemainingDigits) {
        return 0; // The remaining sum is too small to be achieved.
    }

    //    b) Maximum possible sum: If `digitsLeftToSelect` digits must be chosen,
    //       the largest possible sum is achieved by picking `maxAvailableDigit`, `maxAvailableDigit-1`, ...
    //       down to `maxAvailableDigit - digitsLeftToSelect + 1`.
    //       This check also implicitly covers cases where `maxAvailableDigit` is too small
    //       to even provide `digitsLeftToSelect` distinct positive numbers.
    //       Example: if `maxAvailableDigit` is 2 and `digitsLeftToSelect` is 3, this condition will prune.
    if (maxAvailableDigit < digitsLeftToSelect - 1) {
        return 0; // Not enough distinct digits available in the range [0, maxAvailableDigit].
    }
    const maxPossibleSumForRemainingDigits = (maxAvailableDigit + (maxAvailableDigit - digitsLeftToSelect + 1)) * digitsLeftToSelect / 2;
    if (remainingSumToAchieve > maxPossibleSumForRemainingDigits) {
        return 0; // The remaining sum is too large to be achieved.
    }


    // 4. Memoization lookup: Check if this specific sub-problem has already been computed.
    //    Access the cache only if indices are within the pre-allocated bounds.
    if (maxAvailableDigit < 10 && remainingSumToAchieve < 46 && digitsLeftToSelect < 11) {
        if (memoizationCache[maxAvailableDigit][remainingSumToAchieve][digitsLeftToSelect] !== null) {
            return memoizationCache[maxAvailableDigit][remainingSumToAchieve][digitsLeftToSelect];
        }
    }

    let currentWays = 0; // Renamed `result` to `currentWays`

    // --- Recursive Step: Iterate through possible digits to include ---

    // This loop considers choosing `currentDigit` as one of the digits in the combination.
    // It iterates downwards from `maxAvailableDigit` to 0.
    for (let currentDigit = maxAvailableDigit; currentDigit >= 0; currentDigit--) {
        // Optimization: Prune branches where `currentDigit` is too large for the remaining sum.
        // If `currentDigit` alone exceeds the `remainingSumToAchieve`, it cannot be part of a valid combination.
        if (currentDigit > remainingSumToAchieve) {
            continue; // Skip this digit and try smaller ones.
        }

        // Optimization: Prune branches where `currentDigit` is too small,
        // making it impossible to form the `remainingSumToAchieve` with the
        // `digitsLeftToSelect - 1` remaining digits (which must be even smaller).
        // Calculate the minimum sum required for the `digitsLeftToSelect - 1` subsequent digits.
        const minSumForSubsequentDigits = (digitsLeftToSelect - 1) * (digitsLeftToSelect - 2) / 2;
        if (remainingSumToAchieve - currentDigit < minSumForSubsequentDigits) {
            // If picking `currentDigit` results in a `remainingSumToAchieve` that's too small
            // for the subsequent digits, then any smaller `currentDigit` would make it even smaller.
            // Thus, we can safely break the loop as no further digits will lead to a solution.
            break;
        }

        // Recursively call the function:
        // - `currentDigit - 1`: The next digits must be strictly smaller than the `currentDigit` chosen.
        // - `remainingSumToAchieve - currentDigit`: Reduce the sum by the value of the `currentDigit`.
        // - `digitsLeftToSelect - 1`: One less digit needs to be chosen.
        currentWays += computeCombinationsWithMaxDigit(
            currentDigit - 1,
            remainingSumToAchieve - currentDigit,
            digitsLeftToSelect - 1
        );
    }

    // Store the computed result in the memoization cache before returning,
    // ensuring indices are within bounds.
    if (maxAvailableDigit < 10 && remainingSumToAchieve < 46 && digitsLeftToSelect < 11) {
        memoizationCache[maxAvailableDigit][remainingSumToAchieve][digitsLeftToSelect] = currentWays;
    }
    return currentWays;
}

/**
 * Main execution logic for processing each line of input.
 * Renamed `main` to `executeProcessingLogic`.
 */
function executeProcessingLogic() {
    // Iterate through each line retrieved from standard input.
    // A traditional for loop is used to directly manage the index and `break` condition.
    for (let lineIndex = 0; lineIndex < processedLines.length; lineIndex++) {
        const currentInputLine = processedLines[lineIndex]; // Renamed `input[i]` to `currentInputLine`

        // Termination condition: If the line content is exactly '0 0', stop processing further lines.
        if (currentInputLine === '0 0') {
            break;
        }

        // Split the current line by space to get the two numeric components.
        const lineParts = currentInputLine.split(' '); // Renamed `c` to `lineParts`

        // Input validation: Ensure exactly two parts (numbers) are present on the line.
        if (lineParts.length !== 2) {
            console.error(`WARNING: Skipping invalid input line (expected 2 numbers): "${currentInputLine}"`);
            continue; // Proceed to the next line.
        }

        // Parse the string parts into integers.
        const numDigitsToPick = parseInt(lineParts[0], 10); // Renamed `n` to `numDigitsToPick`
        const targetSum = parseInt(lineParts[1], 10);     // Renamed `s` to `targetSum`

        // Input validation: Check if parsing resulted in valid numbers.
        if (isNaN(numDigitsToPick) || isNaN(targetSum)) {
            console.error(`WARNING: Skipping line with non-numeric values: "${currentInputLine}"`);
            continue;
        }

        // Input validation: Ensure N (numDigitsToPick) and S (targetSum) are within reasonable constraints.
        // N must be between 1 and 10 (as digits are distinct and 0-9).
        // S must be non-negative and not exceed the maximum possible sum of 10 distinct digits (0+1+...+9 = 45).
        if (numDigitsToPick < 1 || numDigitsToPick > 10 || targetSum < 0 || targetSum > 45) {
            console.error(`WARNING: Skipping line with out-of-range values (N: ${numDigitsToPick}, S: ${targetSum}): "${currentInputLine}"`);
            continue;
        }

        let totalCombinationCount = 0; // Renamed `pattern` to `totalCombinationCount`

        // This outer loop iterates through possible values for the *largest* digit in the combination.
        // The original code uses `for(var a=9; a>=n; a--)`.
        // This implies that 'a' is the largest digit, and it must be at least 'n' (numDigitsToPick).
        // This is a specific constraint from the original problem, even if it might seem counter-intuitive
        // for "N distinct digits from 0-9" where the largest could be N-1 (e.g., for N=3, {0,1,2}, largest is 2).
        // We replicate the original behavior here.
        for (let currentHighestDigit = 9; currentHighestDigit >= numDigitsToPick; currentHighestDigit--) {
            // Add the combinations found by fixing `currentHighestDigit` as the largest digit.
            // The remaining `numDigitsToPick - 1` digits must be chosen from `0` to `currentHighestDigit - 1`,
            // and their sum must be `targetSum - currentHighestDigit`.
            totalCombinationCount += computeCombinationsWithMaxDigit(
                currentHighestDigit - 1,        // Max available digit for subsequent picks is `currentHighestDigit - 1`.
                targetSum - currentHighestDigit, // The remaining sum to achieve.
                numDigitsToPick - 1             // One less digit to pick.
            );
        }

        // Output the final calculated count for the current input line.
        console.log(totalCombinationCount);
    }
}

// Invoke the main processing function to start execution.
executeProcessingLogic();