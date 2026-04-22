'use strict'; // Enforcing strict mode for better code quality.

/**
 * @file This script calculates the minimum value of (factor1 - 2 + factor2)
 *       for a given positive integer, where factor1 and factor2 are
 *       a pair of divisors of the integer.
 * @author Code Clone Generator
 * @version 1.0.1
 */

/**
 * Processes the raw input lines, extracts the primary number,
 * and computes the specialized minimum sum based on its divisors.
 *
 * @param {string[]} rawInputLines - An array of strings, where the first element
 *                                 is expected to be the integer to process.
 * @returns {number | null} The computed minimum sum, or null if input is invalid.
 */
const processInputAndCompute = (rawInputLines) => {
    // Attempt to parse the first line of input into an integer.
    // Using base 10 explicitly for clarity and robustness.
    const principalNumericalValue = Number.parseInt(rawInputLines[0], 10);

    // --- Input Validation and Edge Case Handling ---
    // Check if the parsed value is a valid positive integer.
    if (isNaN(principalNumericalValue) || principalNumericalValue <= 0) {
        // Output an error message for invalid input.
        console.error("Error: Invalid or non-positive integer provided as input.");
        return null; // Indicate failure by returning null.
    }

    // Special handling for the number 1, as its only divisor pair is (1, 1).
    // This also helps optimize a very small edge case.
    if (principalNumericalValue === 1) {
        // For n=1, the only divisor pair is (1,1). The formula evaluates to: 1 - 2 + 1 = 0.
        return 0;
    }

    // Initialize a variable to store the smallest sum found so far.
    // Start with an extremely large number to ensure any valid sum will be smaller.
    let lowestCalculatedSum = 999999999999999999; // A new, even larger initial maximum value.

    // Calculate the integer part of the square root of the principal number.
    // This value determines the upper limit for checking divisors efficiently.
    // Using Math.pow(x, 0.5) is an alternative to Math.sqrt(x).
    const iterationBoundary = Math.trunc(Math.pow(principalNumericalValue, 0.5));

    // Iterate through potential divisors starting from 1 up to the calculated boundary.
    // The loop condition `currentDivisorCandidate * currentDivisorCandidate <= principalNumericalValue`
    // is a common and often preferred alternative to `currentDivisorCandidate <= Math.sqrt(...)`
    // for avoiding floating-point precision issues in loop bounds, though not strictly necessary here.
    for (let currentDivisorCandidate = 1; currentDivisorCandidate <= iterationBoundary; ++currentDivisorCandidate) {
        // Check if `currentDivisorCandidate` perfectly divides the `principalNumericalValue`.
        // The modulo operator returns the remainder of the division.
        if ((principalNumericalValue % currentDivisorCandidate) === 0) {
            // If it is a divisor, calculate its complementary divisor.
            // For any divisor 'a' of 'N', 'N/a' is also a divisor.
            const pairedDivisor = principalNumericalValue / currentDivisorCandidate;

            // Calculate the sum according to the problem's specific formula: (divisor1 - 2 + divisor2).
            const currentFormulaEvaluation = currentDivisorCandidate - 2 + pairedDivisor;

            // --- Update Minimum Logic ---
            // Compare the newly calculated sum with the current minimum.
            // If the new sum is smaller, update `lowestCalculatedSum`.
            if (currentFormulaEvaluation < lowestCalculatedSum) {
                lowestCalculatedSum = currentFormulaEvaluation;
            }
        }
    }

    // Return the smallest sum identified during the iteration.
    return lowestCalculatedSum;
};

// --- Program Entry Point and Execution Flow ---
// An Immediately Invoked Function Expression (IIFE) is used to encapsulate
// the main execution logic, preventing global variable pollution and
// ensuring the code runs as soon as it's defined.
(function programExecutionModule() {
    // Use a try-catch block for robust error handling during file operations
    // and the main computation process.
    try {
        // Read content from standard input synchronously.
        // Specify UTF-8 encoding for proper text interpretation, essential for various environments.
        const fileDataContent = require("fs").readFileSync("/dev/stdin", { encoding: "utf8" });

        // Split the entire content by newline characters to get individual lines.
        // This creates an array where each element is a line from the input.
        const parsedInputLines = fileDataContent.split('\n');

        // Call the core processing function with the obtained input.
        const computationResult = processInputAndCompute(parsedInputLines);

        // Check if the computation returned a valid result (not null, indicating no input error).
        if (computationResult !== null) {
            // Output the final computed result to standard output.
            // Convert the numerical result to a string and explicitly append a newline character,
            // which is standard for console output formatting.
            process.stdout.write(String(computationResult) + '\n');
        } else {
            // If `processInputAndCompute` returned null, an error message
            // would have already been printed to console.error.
            // Terminate the process with a non-zero exit code (conventionally 1)
            // to signal that the program ended in an error state.
            process.exit(1);
        }
    } catch (operationalError) {
        // Catch any unexpected errors that occur during file I/O or other operations
        // within this execution block.
        console.error("An unhandled exception occurred during program execution:", operationalError.message);
        // Optionally, for debugging, one might print the stack trace:
        // console.error(operationalError.stack);
        process.exit(1); // Terminate the process with a non-zero exit code indicating failure.
    }
})();