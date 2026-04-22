/**
 * @file This module contains utilities for number theory operations and a main processing function.
 * @author CloneBot
 * @version 1.0.1
 */

/**
 * Determines the total count of positive divisors for a given integer.
 * This optimized method checks divisors up to the square root of the target value.
 *
 * @param {number} targetValue The integer for which to count positive divisors.
 * @returns {number} The number of positive divisors. Returns 0 if the input is non-positive.
 */
const computeDivisorQuantity = (targetValue) => {
    // Basic validation: non-positive integers have no positive divisors in this context.
    if (targetValue <= 0) {
        return 0;
    }

    let factorCounter = 0; // Initialize a counter for the divisors found.
    const searchLimit = Math.sqrt(targetValue); // Calculate the square root for optimization.

    // Iterate from 1 up to the square root of the target value.
    for (let currentDivisorCandidate = 1; currentDivisorCandidate <= searchLimit; currentDivisorCandidate++) {
        // Check if the current candidate perfectly divides the target value.
        if (targetValue % currentDivisorCandidate === 0) {
            // If the candidate is the square root of the target value (e.g., for N=9, i=3),
            // it's a single divisor.
            if (currentDivisorCandidate * currentDivisorCandidate === targetValue) {
                factorCounter++;
            } else {
                // Otherwise, both currentDivisorCandidate and targetValue / currentDivisorCandidate are divisors.
                // For example, if N=12, i=2. Then 2 and 6 are divisors.
                factorCounter += 2;
            }
        }
    }

    // Return the final count of divisors.
    return factorCounter;
};

/**
 * Processes a string input, parses it as a number, and then counts how many
 * odd numbers up to that limit have exactly eight positive divisors.
 * The final tally is printed to the console.
 *
 * @param {string} rawDataString The raw input string, expected to be a number.
 */
const executeProcessingLogic = (rawDataString) => {
    // Trim whitespace and convert the input string to an integer.
    const parsedUpperLimit = Number(rawDataString.trim());

    // Input validation: ensure the parsed value is a valid positive number.
    if (isNaN(parsedUpperLimit) || parsedUpperLimit < 1) {
        // For competitive programming, often just exit or print 0 for invalid input.
        console.log(0);
        return;
    }

    let eightDivisorCount = 0; // Counter for numbers with exactly 8 divisors.

    // Iterate through odd numbers from 1 up to the parsed upper limit.
    // This optimization directly skips even numbers.
    for (let currentNumber = 1; currentNumber <= parsedUpperLimit; currentNumber += 2) {
        // Calculate the number of divisors for the current odd number.
        const numberOfFactors = computeDivisorQuantity(currentNumber);

        // If the current number has exactly 8 divisors, increment the main counter.
        if (numberOfFactors === 8) {
            eightDivisorCount++;
        }
    }

    // Output the final count to the standard output.
    console.log(eightDivisorCount);
};

// --- Standard Input/Output Handling ---
// This section is responsible for reading input from stdin and invoking the main logic.
// It should typically not be modified in competitive programming contexts.
executeProcessingLogic(require("fs").readFileSync("/dev/stdin", "utf8"));