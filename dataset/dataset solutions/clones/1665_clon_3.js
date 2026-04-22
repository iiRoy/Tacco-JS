"use strict" // Enforcing strict mode for cleaner code practices.

/**
 * Executes a divisibility check operation on a range of numbers.
 * This function parses input, validates parameters, and counts
 * how many integers within a specified range [L, R] are perfectly
 * divisible by a given divisor 'd'.
 *
 * @param {string} rawInputPayload - The raw string input, typically from stdin.
 *                                   Expected format: "L R d" on a single line.
 */
function processDivisibilityCheck(rawInputPayload) {
    // --- Input Validation and Pre-processing (Type III: Added guard clauses) ---
    // Basic check for valid input type and presence.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.length === 0) {
        // In a production environment, this might throw an error or log extensively.
        // For competitive programming, invalid input is often not a primary concern
        // but this adds robustness.
        console.error("Error: Received an invalid or empty input payload.");
        return; // Exit early if input is fundamentally flawed.
    }

    // Extract the first relevant line from the input string.
    // The .trim() ensures leading/trailing whitespace around the line is removed.
    const effectiveInputLine = rawInputPayload.trim().split('\n')[0];

    // Split the line into individual string components based on spaces.
    const numericStringComponents = effectiveInputLine.split(' ');

    // Ensure that exactly three numerical components were provided.
    if (numericStringComponents.length !== 3) {
        console.error("Error: Input line must contain exactly three space-separated numbers (L R d).");
        return;
    }

    // --- Parsing Numerical Values (Type III: Rewritten parsing, helper variables) ---
    // Convert string components into integer numbers. Using parseInt for explicit base 10.
    const parsedIntegerValues = numericStringComponents.map(componentStr => parseInt(componentStr, 10));

    // Destructure the parsed values into more descriptive variable names.
    let [startValue, endValue, divisorOperand] = parsedIntegerValues;

    // --- Further Parameter Validation and Normalization (Type III: Added guard clauses, updates) ---

    // Handle cases where the divisor is zero. Division by zero is undefined,
    // and typically no number is considered "divisible" by zero in this context.
    if (divisorOperand === 0) {
        console.warn("Warning: Divisor value is zero. No numbers will be counted as divisible.");
        console.log(0); // Output 0 as no numbers can be divided by zero.
        return;
    }

    // Ensure the start value is not greater than the end value.
    // If they are swapped, correct their order to maintain loop integrity.
    if (startValue > endValue) {
        // Classic swap using a temporary variable (Type III: Updated logic).
        const temporaryBoundaryValue = startValue;
        startValue = endValue;
        endValue = temporaryBoundaryValue;
        // Alternatively, [startValue, endValue] = [endValue, startValue];
    }

    // Initialize a counter for the numbers that meet the divisibility criterion.
    let validDivisibleCount = 0; // Renamed from 'ans'

    // --- Iteration and Divisibility Check (Type III: Rewritten loop, intermediate steps) ---
    // Use a while loop instead of a for loop for structural variation.
    let currentIterationValue = startValue; // Renamed from 'i'

    while (currentIterationValue <= endValue) {
        // Calculate the remainder when the current number is divided by the divisor.
        const remainderResult = currentIterationValue % divisorOperand;

        // Check if the remainder is zero, indicating perfect divisibility.
        if (remainderResult === 0) {
            // Increment the counter using an alternative assignment syntax.
            validDivisibleCount = validDivisibleCount + 1; // Rewritten from 'ans++'
        }

        // Move to the next integer in the sequence for the next iteration.
        currentIterationValue = currentIterationValue + 1; // Rewritten from 'i++'
    }

    // --- Output Result ---
    // Display the final count of divisible numbers to standard output.
    console.log(validDivisibleCount);
}

// --- Main Execution Block (Type II: Renamed function call) ---
// Read all input from standard input, typically a file or piped stream.
const standardInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the primary processing function with the collected input.
processDivisibilityCheck(standardInputData);