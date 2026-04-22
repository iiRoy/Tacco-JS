/**
 * Processes raw input string to determine the greatest common divisor (GCD)
 * of differences between a set of numbers, including a designated target value.
 * This function implements an iterative variant of the Euclidean algorithm,
 * specifically designed to find the GCD of all adjacent differences in a sorted
 * collection of numbers.
 *
 * @param {string} rawInputString - The multi-line input string containing numerical data.
 *   Expected format:
 *   Line 1: "initial_count target_value" (e.g., "3 100")
 *   Line 2: "num1 num2 ... numN" (e.g., "10 20 30")
 *   The 'initial_count' is often present but typically not directly used in this type of problem.
 *   The 'target_value' will be added to the collection of numbers.
 * @returns {void} Outputs the calculated greatest common difference to the console.
 */
function calculateCommonDifference(rawInputString) {
    // --- Input Validation and Initial Parsing ---

    // Ensure the provided input is a valid non-empty string.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Error: The provided input string is empty or invalid. Please provide valid numerical data.");
        return; // Exit if input is not usable.
    }

    // Split the entire input string into an array of lines.
    const inputLines = rawInputString.trim().split('\n');

    // Verify that we have at least two lines of data as expected.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines for data processing.");
        return;
    }

    // Parse the first line to extract the target value.
    // We convert tokens to numbers directly using `Number` constructor.
    const firstLineTokens = inputLines[0].split(' ').map(Number);

    // The first token (N, or initial_count) is often present but not used in this specific algorithm.
    // const initialNumberCount = firstLineTokens[0]; // Keeping this commented to show it's recognized but not utilized.

    // The second token is the 'X' value, which is our reference point.
    const referenceValue = firstLineTokens[1];

    // Parse the second line containing the primary list of numbers.
    let numericalCollection = inputLines[1].split(' ').map(Number);

    // --- Data Preparation ---

    // Incorporate the 'referenceValue' into our main collection of numbers.
    numericalCollection.push(referenceValue);

    // Filter out any entries that failed to parse into valid numbers (e.g., NaN).
    // This adds robustness against malformed input.
    numericalCollection = numericalCollection.filter(val => !isNaN(val));

    // If after parsing and filtering, we have fewer than two numbers,
    // we cannot calculate a meaningful difference or GCD.
    if (numericalCollection.length < 2) {
        if (numericalCollection.length === 1) {
            // If only one number exists, the "difference" with itself is 0 in this context.
            console.log(0);
        } else {
            console.error("Error: No valid numbers found for difference calculation after processing input.");
        }
        return;
    }

    // Sort the entire collection of numbers in ascending order.
    // This is crucial for calculating adjacent differences.
    numericalCollection.sort((numA, numB) => numA - numB);

    // --- Special Case: Two Numbers ---

    // If, after sorting and adding the reference value, there are only two numbers,
    // their absolute difference is the GCD. This is an optimization.
    if (numericalCollection.length === 2) {
        console.log(Math.abs(numericalCollection[1] - numericalCollection[0]));
        return;
    }

    // --- Initial Difference Calculation ---

    // Calculate the differences between all adjacent elements in the sorted collection.
    let currentDifferences = [];
    for (let currentIdx = 1; currentIdx < numericalCollection.length; currentIdx++) {
        currentDifferences.push(numericalCollection[currentIdx] - numericalCollection[currentIdx - 1]);
    }

    // Remove duplicate differences and ensure they are sorted.
    // Using a Set is an efficient way to get unique elements.
    // Filtering out non-positive differences ensures we work only with meaningful positive gaps.
    currentDifferences = [...new Set(currentDifferences.filter(d => d > 0))].sort((a, b) => a - b);

    // If after the initial pass, only one unique positive difference exists, that is our GCD.
    if (currentDifferences.length === 1) {
        console.log(currentDifferences[0]);
        return;
    }

    // --- Iterative GCD Reduction (Euclidean Algorithm variant) ---

    // Continuously calculate differences between adjacent unique differences
    // until only one unique positive difference (the GCD) remains.
    while (currentDifferences.length > 1) {
        let nextIterationDifferences = [];

        // It's good practice to re-sort here, although `currentDifferences` should already be sorted
        // from the previous `Set` and `sort` operation. This adds robustness.
        currentDifferences.sort((valA, valB) => valA - valB);

        // Calculate new adjacent differences from the current set of differences.
        for (let diffIdx = 1; diffIdx < currentDifferences.length; diffIdx++) {
            nextIterationDifferences.push(currentDifferences[diffIdx] - currentDifferences[diffIdx - 1]);
        }

        // Filter out any zero or negative differences that might arise (e.g., from identical values)
        // and then get unique elements, sorting them for the next iteration.
        currentDifferences = [...new Set(nextIterationDifferences.filter(d => d > 0))].sort((a, b) => a - b);

        // Additional safeguard: If at any point the array of differences becomes empty,
        // it means all previous differences were either zero or negative, implying
        // the GCD is 0 (all numbers were identical). This case should ideally be
        // caught by earlier length checks, but serves as a robust fallback.
        if (currentDifferences.length === 0) {
            console.log(0);
            return;
        }
    }

    // --- Final Output ---

    // After the loop, `currentDifferences` should contain exactly one element, which is the GCD.
    if (currentDifferences.length === 1) {
        console.log(currentDifferences[0]);
    } else {
        // This scenario indicates an unexpected state in the algorithm.
        // It should ideally always converge to a single positive GCD or 0.
        console.error("An unexpected error occurred: GCD calculation did not converge to a single value.");
        // As a last resort, if for some reason multiple values remain, output the first one.
        console.log(currentDifferences[0] || 0); // Default to 0 if array is unexpectedly empty
    }
}

// --- Execution Environment Wrapper ---

// This immediately-invoked function expression (IIFE) handles the execution
// based on the environment (e.g., Node.js for competitive programming).
(function() {
    // Check if running in a Node.js environment by looking for `require` and `process` globals.
    if (typeof require !== 'undefined' && typeof process !== 'undefined' && typeof process.env !== 'undefined') {
        // In Node.js, standard input is typically read from '/dev/stdin'.
        const fileSystem = require('fs');
        try {
            const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
            calculateCommonDifference(inputData);
        } catch (error) {
            console.error("Failed to read input from /dev/stdin:", error.message);
        }
    } else {
        // If not in a recognized Node.js environment, log an error.
        // The original problem context implies Node.js execution.
        console.error("Unsupported execution environment. This script is designed to run in Node.js, reading from /dev/stdin.");
    }
})();