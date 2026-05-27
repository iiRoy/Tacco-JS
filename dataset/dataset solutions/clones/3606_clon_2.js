'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Computes the total number of divisors for a given positive integer.
 *
 * @param {number} targetNumber - The integer for which to count divisors.
 * @returns {number} The count of divisors.
 */
const calculateDivisorCount = (targetNumber) => {
    let divisorTally = 0; // Initialize a counter for divisors
    // Iterate from 0 up to the target number (inclusive)
    for (let iteratorIndex = 0; iteratorIndex <= targetNumber; iteratorIndex++) {
        // Check if the current index perfectly divides the target number
        if (targetNumber % iteratorIndex === 0) {
            divisorTally++; // Increment the divisor count
        }
    }
    return divisorTally; // Return the final count
};

/**
 * Main processing function that reads input, performs calculations, and outputs the result.
 * It counts numbers up to a given maximum value that are odd and have exactly 8 divisors.
 *
 * @param {string} rawInputData - The raw input string, expected to be a number.
 */
const executeProcessing = (rawInputData) => {
    // Convert the input string to a numerical maximum value
    const maximumValue = Number(rawInputData);
    let finalTally = 0; // Initialize a counter for numbers meeting the criteria

    // Loop through numbers from 0 up to the maximum value
    for (let currentIterationValue = 0; currentIterationValue <= maximumValue; currentIterationValue++) {
        // Skip even numbers; we are only interested in odd ones
        if (currentIterationValue % 2 === 0) {
            continue; // Move to the next iteration
        }

        // If the current odd number has exactly 8 divisors, increment the final tally
        if (calculateDivisorCount(currentIterationValue) === 8) {
            finalTally++;
        }
    }
    // Output the final count to the console
    console.log(finalTally);
};

// This section handles standard input/output and should not be modified.
// It reads the entire content from standard input and passes it to the main processing function.
executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
