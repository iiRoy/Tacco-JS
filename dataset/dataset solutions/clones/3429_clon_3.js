"use strict";

// Entry point for processing the problem's input
const calculateSpecialNumberCount = (rawInputContent) => {
    // Phase 1: Input ingestion and preliminary validation
    // Introduce an early exit for non-existent or empty input data.
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
        console.log(0);
        return;
    }

    // Extract and convert the primary numerical constraint.
    // Utilize Number() for type conversion, a common alternative to parseInt().
    const upperLimitValue = Number(rawInputContent.trim().split('\n')[0]);

    // Further validation: Ensure the parsed value is a positive integer.
    // Handles cases where input might be non-numeric or zero/negative.
    if (isNaN(upperLimitValue) || upperLimitValue <= 0 || !Number.isInteger(upperLimitValue)) {
        console.log(0);
        return;
    }

    // Initialize a mutable object to hold the total count of qualifying numbers.
    // This allows the recursive function to modify a shared state by reference.
    const tallyResult = {
        totalQualifiedNumbers: 0
    };

    // Define the set of digits allowed in the construction of numbers.
    // Represented as strings for easier concatenation.
    const allowedNumericalComponents = new Set(['3', '5', '7']);

    // Define the specific digits that *must* be present in a qualified number.
    // Kept as an array for convenient iteration and comparison.
    const mandatoryDigits = ['3', '5', '7'];

    /**
     * Recursively generates numbers composed solely of '3', '5', '7'
     * and counts those that meet the criteria (<= upperLimitValue and contain all mandatory digits).
     * This function replaces the original iterative generation and filtering loops with a Depth-First Search pattern.
     * @param {number} currentBuiltNumber The number constructed so far in the current recursive branch.
     */
    const generateAndValidateCandidates = (currentBuiltNumber) => {
        // Pruning condition 1: If the current number already exceeds the specified upper limit
        // (and it's not the initial, conceptual '0' state), stop this branch of recursion.
        // Any further extensions of this number will also exceed the limit.
        if (currentBuiltNumber > upperLimitValue && currentBuiltNumber !== 0) {
            return;
        }

        // Check for qualification only if the current value is a valid, non-zero number.
        // The initial call with 0 is just a starting point for building numbers.
        if (currentBuiltNumber > 0) {
            const currentNumString = String(currentBuiltNumber);

            // Determine if the current number contains all mandatory digits ('3', '5', '7').
            // This approach uses a Set for efficient tracking of present mandatory digits,
            // replacing multiple `indexOf` calls with a more dynamic structure.
            const presentMandatoryDigits = new Set();
            for (const charDigit of currentNumString) {
                // Only add digits that are part of our mandatory set to the tracking set.
                if (mandatoryDigits.includes(charDigit)) {
                    presentMandatoryDigits.add(charDigit);
                }
            }

            // If all mandatory digits (3, 5, 7) are found within the number,
            // and the number itself does not exceed the upper limit, increment the total count.
            if (presentMandatoryDigits.size === mandatoryDigits.length && currentBuiltNumber <= upperLimitValue) {
                tallyResult.totalQualifiedNumbers++;
            }
        }

        // Recursive step: Extend the current number by appending each allowed digit.
        // This simulates building numbers digit by digit.
        for (const digitChar of allowedNumericalComponents) {
            // Calculate the next potential number by appending the current allowed digit.
            const nextCandidateNumber = currentBuiltNumber * 10 + Number(digitChar);

            // Pruning condition 2 (Added heuristic for efficiency):
            // If the next candidate number's string representation is already significantly longer
            // than the upper limit's string representation, it's highly likely to exceed the limit.
            // This prevents generating excessively large numbers that will be pruned anyway,
            // reducing unnecessary recursion depth. For example, if upperLimitValue is 100 (3 digits),
            // and `nextCandidateNumber` becomes 7773 (4 digits), we might continue, but if it becomes 77735 (5 digits),
            // we can prune early. The `+1` allows for numbers slightly longer than the upper limit (e.g., 333 for N=99).
            const nextCandidateStringLength = String(nextCandidateNumber).length;
            const upperLimitStringLength = String(upperLimitValue).length;
            if (nextCandidateStringLength > upperLimitStringLength + 1) {
                continue; // Skip this branch if it's already too long to be relevant.
            }

            // Recursively call the function for the newly formed number.
            generateAndValidateCandidates(nextCandidateNumber);
        }
    };

    // Initiate the number generation process starting from a conceptual 'empty' number (represented by 0).
    // This seed value allows the recursive function to build its first set of single-digit numbers (3, 5, 7).
    generateAndValidateCandidates(0);

    // Output the final computed count of numbers meeting all criteria.
    console.log(tallyResult.totalQualifiedNumbers);
};

// Standard boilerplate for reading input in a competitive programming environment.
// Reads the entire standard input as a UTF-8 string and passes it to the main processing function.
calculateSpecialNumberCount(require('fs').readFileSync('/dev/stdin', 'utf8'));