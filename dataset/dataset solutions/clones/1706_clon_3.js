"use strict"; // Enforces strict parsing and error handling in the script.

// --- Core System Utilities ---
// Alias for the Node.js 'fs' (file system) module to enhance readability and allow for potential future mockups.
const systemFileHandler = require("fs");

// Reads the entire content from standard input (typically /dev/stdin on Unix-like systems)
// as a UTF-8 encoded string. This forms the raw data source for subsequent parsing.
const rawProgramInput = systemFileHandler.readFileSync("/dev/stdin", "utf8");

// Splits the raw input string into an array of individual tokens.
// It uses a regular expression `/\s+/` to split by any sequence of one or more whitespace characters
// (spaces, tabs, newlines, etc.). The `.filter(Boolean)` step ensures that any empty strings
// resulting from multiple delimiters are removed, yielding a clean array of actual data tokens.
const programInputTokens = rawProgramInput.split(/\s+/).filter(Boolean);

// A pointer to keep track of the current token being processed within the `programInputTokens` array.
let inputTokenPointer = 0;

/**
 * Retrieves and parses the next available token from the input buffer as an integer.
 * This function also increments the internal pointer to prepare for the next read operation.
 * Robustness is enhanced with a check for buffer overflow.
 * @returns {number} The integer value of the next token.
 * @throws {Error} If an attempt is made to read beyond the end of the input token buffer.
 */
function retrieveNextIntegerToken() {
    // Guard against reading beyond the allocated input.
    if (inputTokenPointer >= programInputTokens.length) {
        // This error signifies an unexpected end of input, crucial for debugging.
        throw new Error("End of input stream reached prematurely. No more tokens available.");
    }
    // Fetch the token and advance the pointer. The unary '+' operator efficiently converts
    // the string token to a number.
    const currentToken = programInputTokens[inputTokenPointer++];
    return +currentToken;
}

// --- Main Application Logic ---

/**
 * Orchestrates the primary computational task of the program.
 * This function calculates a specific combinatorial value, often seen in tree-related problems
 * where it represents a sum of paths or connections, adjusted by edge contributions.
 * @returns {number} The final computed numerical result.
 */
function performCoreComputation() {
    // Obtain the initial parameter, typically representing the total number of elements or nodes (N).
    const numberOfElements = retrieveNextIntegerToken();

    // Implement a guard clause for invalid or trivial input.
    // If N is non-positive, there are no elements to process, so the result is 0.
    if (numberOfElements <= 0) {
        return 0; // No elements, no paths/combinations to count.
    }

    // Calculate the initial base value. This formula `N * (N+1) * (N+2) / 6`
    // is a known combinatorial identity, equivalent to the sum of k*(k+1)/2 for k from 1 to N,
    // or C(N+2, 3) (combinations of N+2 items taken 3 at a time).
    // It often serves as a total count from which specific deductions are made based on problem constraints.
    // Introduce an intermediate variable for clarity in calculation.
    const initialCombinatorialSumNumerator = numberOfElements * (numberOfElements + 1) * (numberOfElements + 2);
    let finalAggregatedResult = initialCombinatorialSumNumerator / 6;

    // A loop to process subsequent input, typically representing edges or relationships between elements.
    // For a tree with N nodes, there are N-1 edges.
    for (let edgeProcessingIndex = 0; edgeProcessingIndex < numberOfElements - 1; edgeProcessingIndex++) {
        // Read the two identifiers (e.g., node indices) associated with the current edge.
        let firstElementId = retrieveNextIntegerToken();
        let secondElementId = retrieveNextIntegerToken();

        // Standardize the order of identifiers: ensure 'firstElementId' is always the smaller.
        // This consistency is crucial for the correctness of the subtraction formula.
        if (firstElementId > secondElementId) {
            // Using modern JavaScript destructuring assignment for a concise and readable swap.
            [firstElementId, secondElementId] = [secondElementId, firstElementId];
        }

        // Apply the deduction for the current edge.
        // The term `firstElementId * (numberOfElements - secondElementId + 1)`
        // is a common formula in tree path counting problems. It represents the number of paths
        // that are "cut" or "excluded" by the existence of this specific edge (firstElementId, secondElementId).
        // Conceptually, it multiplies the size of the component containing the smaller ID
        // by the size of the component containing the larger ID, assuming a specific partitioning.
        finalAggregatedResult -= firstElementId * (numberOfElements - secondElementId + 1);
    }

    // Return the final calculated value after all adjustments.
    return finalAggregatedResult;
}

// --- Program Entry Point ---

// Invoke the core computation logic.
const computedOutcome = performCoreComputation();

// Output the final result to the standard output.
// Explicitly converting to String ensures consistent output formatting,
// though for a number, `console.log` would usually handle it correctly.
console.log(String(computedOutcome));