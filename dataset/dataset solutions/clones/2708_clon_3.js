"use strict";

/**
 * Calculates the number of ways to replace '?' characters in an input string
 * with digits (0-9) such that the resulting number is divisible by 13
 * and leaves a specific remainder (5 in this case).
 * The counts are taken modulo 1000000007.
 *
 * @param {string} rawInputData - The raw input string, expected to contain
 *                                 the target sequence on the first line.
 */
const processInputAndSolve = (rawInputData) => {
    // --- Input Processing and Validation ---
    // Remove leading/trailing whitespace from the raw input.
    const cleanedInput = rawInputData.trim();
    // Extract the first line, which is expected to contain the sequence of characters.
    const inputSequence = cleanedInput.split("\n")[0];

    // Basic validation: ensure the input sequence is not empty or malformed.
    // This is a Type III addition for robustness.
    if (!inputSequence) {
        console.error("Error: Input sequence is empty or invalid. Please provide a string of digits and/or '?' characters.");
        return; // Terminate execution if input is invalid.
    }

    // Convert the input string into an array of individual characters for easier iteration.
    const sequenceOfChars = inputSequence.split("");
    // Store the total number of characters in the sequence for loop bounds and DP table sizing.
    const totalLength = sequenceOfChars.length;

    // --- Configuration Constants ---
    // A large prime modulus used to prevent integer overflow during summation.
    const PRIME_MODULUS = 1000000007;
    // The specific divisor we are checking against (e.g., for divisibility by 13).
    const TARGET_DIVISOR = 13;
    // The base of our number system (e.g., 10 for decimal digits).
    const BASE_RADIX = 10;
    // The desired remainder when the final number is divided by the TARGET_DIVISOR.
    const FINAL_REMAINDER_GOAL = 5;
    // The special character used to denote an unknown digit that can be any value from 0-9.
    const WILDCARD_CHAR = '?';

    // --- Dynamic Programming Table Initialization ---
    // `dpCounts[i][j]` represents the number of distinct ways to form a numerical prefix
    // using the first `i` characters from `sequenceOfChars`, such that this prefix,
    // when divided by `TARGET_DIVISOR`, yields a remainder of `j`.
    // The first dimension `i` goes from 0 (empty prefix) up to `totalLength` (full sequence).
    // The second dimension `j` goes from 0 up to `TARGET_DIVISOR - 1`.
    let dpCounts = Array.from({ length: totalLength + 1 }, () => Array(TARGET_DIVISOR).fill(0));

    // --- Base Case for DP ---
    // For an empty prefix (length 0), the numerical value is considered 0.
    // When 0 is divided by `TARGET_DIVISOR`, the remainder is 0.
    // There is exactly one way to form an empty prefix.
    dpCounts[0][0] = 1;

    // --- DP State Transitions Loop ---
    // Iterate through each character position in the input sequence, building up the solution.
    // `currentIdx` represents the index of the character being processed, extending the prefix.
    for (let currentIdx = 0; currentIdx < totalLength; currentIdx++) {
        // Get the character at the current position.
        const charAtCurrentPos = sequenceOfChars[currentIdx];
        // Determine the fixed digit value if `charAtCurrentPos` is not a wildcard.
        // `fixedDigitValue` will be `null` if it's a `WILDCARD_CHAR`, otherwise its integer value.
        const fixedDigitValue = (charAtCurrentPos === WILDCARD_CHAR) ? null : parseInt(charAtCurrentPos, BASE_RADIX);

        // Iterate through all possible digit values (0 through 9) that `charAtCurrentPos` could represent.
        for (let possibleNextDigit = 0; possibleNextDigit < BASE_RADIX; possibleNextDigit++) {
            // If the current character is a specific digit (not a wildcard)
            // AND this specific digit does not match our `possibleNextDigit`,
            // then this transition is invalid; skip to the next `possibleNextDigit`.
            if (fixedDigitValue !== null && fixedDigitValue !== possibleNextDigit) {
                continue;
            }

            // Iterate through all possible remainders that could have been achieved
            // by the prefix up to the `currentIdx` length (`dpCounts[currentIdx]`).
            for (let previousRemainder = 0; previousRemainder < TARGET_DIVISOR; previousRemainder++) {
                // Optimization: If there were no ways to achieve `previousRemainder`
                // for the prefix of length `currentIdx`, then there's nothing to propagate
                // from this state. Skip this iteration. (Type III addition for efficiency).
                if (dpCounts[currentIdx][previousRemainder] === 0) {
                    continue;
                }

                // Calculate the new remainder. A number formed by `(previous_prefix_value * BASE_RADIX + current_digit)`
                // will have a remainder given by `(previous_remainder * BASE_RADIX + current_digit) % TARGET_DIVISOR`.
                const newCalculatedRemainder = (previousRemainder * BASE_RADIX + possibleNextDigit) % TARGET_DIVISOR;

                // Accumulate the counts from the previous state into the current state's new remainder.
                // The modulo operation for this sum will be applied after all transitions for `currentIdx`
                // are processed, ensuring all contributions are summed first.
                dpCounts[currentIdx + 1][newCalculatedRemainder] += dpCounts[currentIdx][previousRemainder];
            }
        }

        // After all possible transitions for `currentIdx` (i.e., all `possibleNextDigit`s
        // and `previousRemainder`s) have been processed and accumulated into `dpCounts[currentIdx + 1]`,
        // apply the modulo operation to every value in the `currentIdx + 1` row.
        // This prevents intermediate sums from growing excessively large before the next iteration,
        // maintaining counts within the integer limits. This structure mirrors the original code.
        for (let remIndex = 0; remIndex < TARGET_DIVISOR; remIndex++) {
            dpCounts[currentIdx + 1][remIndex] %= PRIME_MODULUS;
        }
    }

    // --- Final Result Output ---
    // The final answer is the count stored in `dpCounts[totalLength][FINAL_REMAINDER_GOAL]`.
    // This represents the total number of ways to replace wildcards in the entire sequence
    // such that the resulting number leaves `FINAL_REMAINDER_GOAL` when divided by `TARGET_DIVISOR`.
    const resultCount = dpCounts[totalLength][FINAL_REMAINDER_GOAL];
    console.log(resultCount);
};

// --- Execution Block ---
// Read the input data from standard input (usually for competitive programming platforms).
// Then, call the main processing function with the read data.
processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));