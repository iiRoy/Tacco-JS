"use strict";

/**
 * A utility module to handle standard input operations.
 * This function reads data from /dev/stdin.
 * @returns {string} The content read from standard input.
 */
const obtainStandardInput = () => {
    try {
        // Attempt to synchronously read the entire content of standard input
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (inputError) {
        // Log any errors that occur during file reading
        console.error("Input acquisition error: Unable to retrieve data from standard input.", inputError.message);
        // Return an empty string to prevent downstream processing from failing
        return "";
    }
};

/**
 * Executes the primary computation based on the provided raw input string.
 * This function identifies the largest number 'X' (where X >= 2) within a given limit 'L'
 * such that X can be expressed as Y^(2^k) for some integer Y > 1 and k >= 1.
 * @param {string} rawInputString - The raw string data received from the input source.
 */
const performComputation = (rawInputString) => {
    // Normalize input: ensure it's a string, then remove whitespace and split into lines.
    const normalizedInputLines = String(rawInputString).trim().split("\n");

    // Extract the numerical limit from the first part of the first line.
    // Using `Number()` for type conversion, which is robust for various number formats.
    const limitLineComponents = normalizedInputLines[0].split(" ");
    const computationUpperLimit = Number(limitLineComponents[0]);

    // Initialize the ultimate result. Default to 1 as per problem constraints.
    let finalComputedValue = 1;

    // --- Input Validation and Early Exit (Type III Addition) ---
    // If the extracted limit is not a valid number or is less than 2,
    // the loops won't execute meaningfully, so we output the default.
    if (isNaN(computationUpperLimit) || computationUpperLimit < 2) {
        console.log(finalComputedValue);
        return; // Terminate execution early
    }

    // Outer iteration: 'currentCandidate' represents the number 'i' from the original problem.
    // It ranges from 2 up to the computationUpperLimit.
    for (let currentCandidate = 2; currentCandidate <= computationUpperLimit; currentCandidate++) {

        // Inner iteration: 'baseValue' represents the number 'j' from the original problem.
        // It ranges from 1 up to the currentCandidate.
        for (let baseValue = 1; baseValue <= currentCandidate; baseValue++) {

            // --- Optimized Skip Condition (Type III Update) ---
            // If the baseValue is 1, repeatedly squaring it will always result in 1.
            // Thus, it can never form a `currentCandidate` greater than 1.
            // We can skip this iteration entirely to improve efficiency.
            if (baseValue === 1) {
                continue; // Move to the next baseValue
            }

            let temporaryWorkingValue = baseValue; // Start with the baseValue for squaring operations
            let squaringOperationCount = 0;       // Tracks how many times squaring occurred

            // --- Squaring Loop (Type III Rewrite: Math.pow to multiplication) ---
            // Repeatedly square `temporaryWorkingValue` as long as it's less than `currentCandidate`.
            while (temporaryWorkingValue < currentCandidate) {
                temporaryWorkingValue = temporaryWorkingValue * temporaryWorkingValue; // Equivalent to Math.pow(temp, 2)
                squaringOperationCount++; // Increment the counter for each squaring operation
            }

            // --- Conditional Result Update (Type III Addition: Intermediate Variable) ---
            // Check if the `currentCandidate` was successfully reached by squaring
            // and if at least one squaring operation actually took place (squaringOperationCount > 0).
            const isTargetReachedBySquaring = (temporaryWorkingValue === currentCandidate) && (squaringOperationCount > 0);

            if (isTargetReachedBySquaring) {
                // If the conditions are met, update the final result with this candidate.
                // Since we iterate upwards, finalComputedValue will hold the largest such number.
                finalComputedValue = currentCandidate;
            }
        }
    }

    // Display the final determined value to standard output.
    console.log(finalComputedValue);
};

// Initiate the entire process by first obtaining input and then running the computation.
performComputation(obtainStandardInput());