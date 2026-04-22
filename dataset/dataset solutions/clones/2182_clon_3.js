// This module provides functionality to count special numbers based on specific criteria.
// It processes input to define an upper limit and a required count of non-zero digits.

/**
 * Serves as the primary entry point, handling raw input, parsing it, and
 * orchestrating the calculation of special numbers. It also manages output.
 * @param {string} rawInputData - The raw string input, expected to contain two numbers separated by a newline.
 */
function processInputAndCompute(rawInputData) {
    // Type III: Robust input validation as a guard clause.
    if (typeof rawInputData !== 'string' || rawInputData === null || rawInputData.trim() === '') {
        console.error("Error: Provided input data is either missing, not a string, or empty.");
        return; // Terminate execution for invalid input.
    }

    // Type II: Renamed variables for clarity and using `const`.
    // Splits the input string into individual lines after trimming leading/trailing whitespace.
    const inputLines = rawInputData.trim().split("\n");

    // Type III: Validation to ensure sufficient input lines are present.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two numbers (limit value and digit count).");
        return;
    }

    // Type II: Parsing input lines into integers using `parseInt` with explicit radix.
    // `trim()` is applied to each line to handle potential extra whitespace.
    const upperLimitValue = parseInt(inputLines[0].trim(), 10);
    const requiredNonZeroDigits = parseInt(inputLines[1].trim(), 10);

    // Type III: Comprehensive validation of the parsed numerical values.
    if (isNaN(upperLimitValue) || isNaN(requiredNonZeroDigits) || upperLimitValue < 0 || requiredNonZeroDigits < 0) {
        console.error("Error: One or both parsed input values are not valid non-negative numbers.");
        return;
    }

    // Type II: Calling the main calculation function with renamed arguments.
    const finalCalculatedCount = determineSpecialNumberCount(upperLimitValue, requiredNonZeroDigits);
    console.log(finalCalculatedCount);
}

/**
 * Core function to calculate the total count of special numbers up to a given upper limit.
 * A special number is generated from a binary pattern where '1's are replaced by non-zero digits (1-9),
 * and the count of these replaced digits must match `requiredNonZeroDigits`.
 * @param {number} limitA - The inclusive upper bound for the special numbers to be counted.
 * @param {number} countB - The exact number of non-zero digits that must be present in the special numbers.
 * @returns {number} The cumulative count of all special numbers that satisfy the criteria.
 */
function determineSpecialNumberCount(limitA, countB) {
    // Type II: Renamed variable for better context.
    const limitAStringLength = String(limitA).length;
    let accumulatedTotal = 0; // Type II: Using `let` for a mutable counter.

    // Type III: Dynamically adjusts the upper bound for generating binary masks.
    // This ensures that all relevant patterns whose length is up to `limitAStringLength` can be checked.
    // `+2` provides a small buffer, covering patterns slightly longer than `limitA` for early exit.
    const maxMaskConsideration = 1 << (limitAStringLength + 2);

    // Type II: Renamed loop variable and adjusted loop range (starts from 0 to include '0' mask).
    for (let currentMaskValue = 0; currentMaskValue < maxMaskConsideration; currentMaskValue++) {
        // Type II: Renamed variable. Converts the integer mask to its binary string representation.
        const binaryPatternString = currentMaskValue.toString(2);

        // Type III: Introduced an intermediate variable for pattern length clarity.
        const currentPatternLen = binaryPatternString.length;

        // Type II: Renamed and rephrased condition for early loop termination.
        if (currentPatternLen > limitAStringLength) {
            break; // If the pattern is already longer than `limitA`, no further masks will work.
        }

        // Type III: Uses a more direct and robust regex approach to count '1's in the binary string.
        // Handles cases where no '1's are present by defaulting to an empty array.
        const actualNonZeroDigits = (binaryPatternString.match(/1/g) || []).length;

        // Type II: Renamed variable. Skips the current iteration if the count of '1's doesn't match `countB`.
        if (actualNonZeroDigits !== countB) {
            continue;
        }

        // Branch 1: The current binary pattern is shorter than the `limitA`'s string length.
        if (currentPatternLen < limitAStringLength) {
            // Type II: Renamed variable.
            // Type III: Uses the ES6 exponentiation operator (`**`) for clarity and conciseness.
            // For shorter patterns, all combinations of 9 non-zero digits for each '1' are valid,
            // as the resulting number will always be less than `limitA`.
            accumulatedTotal += 9 ** actualNonZeroDigits;
        }
        // Branch 2: The current binary pattern has the same length as `limitA`.
        else {
            const digitsRequiredForSubstitution = actualNonZeroDigits;
            let countForThisLength = 0; // Counter specific to this length match.

            // Type III: A new, nested recursive helper function to generate all combinations
            // of `digitsRequiredForSubstitution` non-zero digits (1-9). This replaces and fixes
            // the highly problematic and bug-ridden original `j` loop.
            /**
             * Recursively generates sequences of non-zero digits for substitution and validates them.
             * @param {string[]} currentDigits - An array holding the digits generated so far for the current sequence.
             * @param {number} remainingDigits - The number of digits still needed to complete the sequence.
             */
            function generateAndValidateSubstitutions(currentDigits, remainingDigits) {
                // Base case: All required digits for substitution have been generated.
                if (remainingDigits === 0) {
                    const substitutionSequence = currentDigits.join('');
                    let substitutionNumber;

                    // Handle the special case where no non-zero digits are required (i.e., `countB` was 0).
                    if (substitutionSequence.length === 0) {
                        // If `countB` is 0, the binary pattern must be all '0's, implying the number 0.
                        substitutionNumber = 0;
                    } else {
                        substitutionNumber = parseInt(substitutionSequence, 10);
                        // Type III: Added validation for generated numbers to prevent NaN issues.
                        if (isNaN(substitutionNumber)) {
                            console.warn("Warning: Generated substitution sequence resulted in NaN, skipping.");
                            return;
                        }
                    }

                    // Type II: Calls the renamed digit substitution function.
                    const candidateNumber = constructNumberFromPattern(binaryPatternString, substitutionNumber);

                    // Type III: Checks for error indication from `constructNumberFromPattern`.
                    if (candidateNumber === -1) {
                        // This indicates a structural mismatch (e.g., more '1's in pattern than digits provided).
                        // This path should ideally not be hit with correct logic flow.
                        return;
                    }

                    // If the formed number is within the `limitA`, increment the counter for this length.
                    if (candidateNumber <= limitA) {
                        countForThisLength++;
                    }
                    return;
                }

                // Recursive step: Iterate through non-zero digits (1-9) for the current position.
                for (let digitChoice = 1; digitChoice <= 9; digitChoice++) {
                    currentDigits.push(digitChoice);
                    generateAndValidateSubstitutions(currentDigits, remainingDigits - 1);
                    currentDigits.pop(); // Backtrack to explore other digit choices.
                }
            }

            // Initiate the recursive generation of digit sequences.
            generateAndValidateSubstitutions([], digitsRequiredForSubstitution);
            accumulatedTotal += countForThisLength;
        }
    }
    return accumulatedTotal;
}

/**
 * Constructs a numerical value by substituting digits from a replacement sequence
 * into the '1' positions of a given binary pattern. The substitution happens from right to left.
 * @param {string} pattern - The binary string pattern (e.g., "101", "0", "110").
 * @param {number} replacements - A number whose individual digits (read from right to left)
 *                                will be used to replace the '1's in the `pattern`.
 *                                A value of 0 implies no '1's to replace, resulting in 0 if pattern is "0".
 * @returns {number} The integer formed after substitution, or -1 if there's a mismatch
 *                   between the number of '1's in the pattern and available replacement digits.
 */
function constructNumberFromPattern(pattern, replacements) {
    // Type II: Renamed variables and using `const` for immutability.
    // Reverses the pattern and replacement digits for right-to-left processing, matching original logic.
    const reversedPatternChars = String(pattern).split("").reverse();
    const reversedReplacementDigits = String(replacements).split("").reverse();

    const resultDigits = []; // Type II: Renamed array to store constructed digits.
    let replacementIndex = 0; // Type II: Renamed index for tracking replacement digit usage.

    // Type II: Renamed loop variable. Iterates through the reversed binary pattern.
    for (let pos = 0; pos < reversedPatternChars.length; pos++) {
        if (reversedPatternChars[pos] === '1') {
            // Type III: Critical validation to ensure there are enough replacement digits for '1's in the pattern.
            if (replacementIndex >= reversedReplacementDigits.length) {
                // This indicates an inconsistent state (e.g., pattern has more '1's than `replacements` has digits).
                return -1; // Return an error sentinel value.
            }
            resultDigits.push(reversedReplacementDigits[replacementIndex]);
            replacementIndex++;
        } else {
            // Type III: Explicitly pushes '0' for clarity, consistent with original behavior for '0's in mask.
            resultDigits.push('0');
        }
    }

    // Type III: Added validation for the final string, though `pattern` from `toString(2)` usually prevents emptiness.
    const finalNumberString = resultDigits.reverse().join("");
    if (!finalNumberString) {
        // If somehow an empty string is formed (unlikely with valid patterns), return 0.
        return 0;
    }
    // Type II: Uses `parseInt` for explicit conversion to integer.
    return parseInt(finalNumberString, 10);
}

// Type III: An immediately-invoked function expression (IIFE) to encapsulate the main execution logic.
// This prevents global variable pollution and ensures the script runs automatically upon loading.
(function executeMain() {
    // Adheres to the original input method, reading from standard input.
    try {
        const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
        processInputAndCompute(inputData);
    } catch (error) {
        // Type III: Enhanced error handling for input reading or processing failures.
        console.error("An unexpected error occurred during input file reading or processing:", error.message);
    }
})();