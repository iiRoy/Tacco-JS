// This module defines a primary function to solve a numerical challenge.
// The objective is to determine the smallest positive integer 'k'
// such that the k-th triangular number (sum of integers from 1 to k)
// is perfectly divisible by a given constraint value.

/**
 * Executes the core logic of the problem to find the target sequence index.
 * It reads a numerical constraint from the provided string input
 * and then iteratively calculates triangular numbers until the divisibility
 * condition is met.
 *
 * @param {string} sourceDataString - A string containing the input data, typically from standard input.
 *                                    Expected format: "N\n..." where N is the constraint.
 */
const performDivisibilitySearch = (sourceDataString) => {
    // --- Phase 1: Input Acquisition and Sanitization ---
    // (Type III: Added robust input validation and explicit parsing steps)

    if (typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        console.error("Input processing failed: Provided data is empty or not a string.");
        return; // Exit if input is invalid
    }

    // Split the entire input string into an array of individual lines.
    const inputLineSegments = sourceDataString.trim().split('\n');

    if (inputLineSegments.length === 0) {
        console.error("Input processing failed: No meaningful data lines were found.");
        return;
    }

    // Extract the first line, which is expected to contain the primary constraint.
    const primaryConstraintLine = inputLineSegments[0];

    // Split the first line by spaces to get individual tokens.
    const lineTokens = primaryConstraintLine.split(' ');

    if (lineTokens.length === 0 || lineTokens[0].trim().length === 0) {
        console.error("Input processing failed: The first line is empty or malformed.");
        return;
    }

    // Parse the first token as the numerical divisor.
    // (Type III: Explicit `parseInt` with radix for clarity and robustness)
    const numericalDivisor = parseInt(lineTokens[0], 10);

    // Validate the parsed divisor. It must be a positive integer.
    // (Type III: Added a guard clause for essential input validation)
    if (isNaN(numericalDivisor) || numericalDivisor <= 0) {
        console.error(`Input validation failed: Constraint value '${lineTokens[0]}' is not a positive integer.`);
        return;
    }

    // --- Phase 2: Iterative Calculation and Condition Checking ---
    // (Type II: Renamed variables, Type III: Restructured loop, added helper function, intermediate variables)

    let currentNaturalNumber = 1; // Represents 'k' in T_k = k * (k + 1) / 2
    let isSolutionIdentified = false; // Control flag for the search loop
    let determinedResult = -1; // Stores the final 'k' value

    /**
     * Computes the n-th triangular number.
     * T_n = 1 + 2 + ... + n = n * (n + 1) / 2
     * @param {number} index - The natural number for which to calculate the triangular sum.
     * @returns {number} The triangular number corresponding to the given index.
     */
    const calculateSequenceSum = (index) => {
        // (Type III: Intermediate calculation steps, explicit type casting if needed for large numbers, though JS handles it)
        const numerator = index * (index + 1);
        const triangularValue = numerator / 2;
        return triangularValue;
    };

    // Begin searching for the smallest 'k'.
    // (Type III: Changed `for (;;)` to `while` loop with explicit boolean flag)
    while (!isSolutionIdentified) {
        // Compute the current triangular number.
        const currentTriangularSum = calculateSequenceSum(currentNaturalNumber);

        // Check if the current triangular sum is perfectly divisible by our numerical constraint.
        // (Type III: Used `Number.isInteger` for robustness against potential floating point inaccuracies, though not strictly necessary for this specific calculation)
        const remainderAfterDivision = currentTriangularSum % numericalDivisor;

        if (Number.isInteger(remainderAfterDivision) && remainderAfterDivision === 0) {
            // Condition met: the current natural number is our solution.
            determinedResult = currentNaturalNumber;
            isSolutionIdentified = true; // Set flag to exit the loop.
        } else {
            // Increment to the next natural number and continue the search.
            currentNaturalNumber++;
        }
    }

    // --- Phase 3: Output Generation ---
    // (Type III: Storing result in a variable before outputting, adding fallback error)

    if (determinedResult !== -1) {
        console.log(determinedResult);
    } else {
        // This block should ideally not be reached if the input is valid,
        // as a solution always exists for positive integer constraints.
        console.error("An unexpected internal error occurred: No solution could be determined.");
    }
};

/**
 * Utility function to read input from standard input stream.
 * This is common practice in competitive programming environments.
 * @returns {string} The content read from stdin as a UTF-8 string.
 */
const retrieveStandardInputContent = () => {
    try {
        // (Type III: Externalized input reading into a separate function for modularity)
        const fileSystemModule = require('fs');
        const inputDataBuffer = fileSystemModule.readFileSync('/dev/stdin');
        return inputDataBuffer.toString('utf8');
    } catch (readingError) {
        console.error(`Failed to read input from /dev/stdin: ${readingError.message}`);
        // Return an empty string to allow the main logic to handle the empty input case gracefully.
        return '';
    }
};

// --- Program Entry Point ---
// (Type II: Renamed main execution call, Type III: Clearly separated invocation)
// Fetch the raw input data and then initiate the problem-solving process.
const rawInputContent = retrieveStandardInputContent();
performDivisibilitySearch(rawInputContent);