"use strict"; /* Activate strict parsing and execution rules for the current script. */

/**
 * Determines and returns the largest proper divisor (factor) of a given positive integer.
 * A proper divisor is a divisor of a number, other than the number itself.
 *
 * @param {number} targetNumber The positive integer for which to find the largest factor.
 * @returns {number} The largest factor of the 'targetNumber' found, defaulting to 1 if no other factor is present.
 */
function findLargestFactor(targetNumber) {
    let currentLargestFactor = 1; // Initialize the variable to hold the largest factor identified so far.

    // Calculate the midpoint of the target number; we only need to check for factors up to this point.
    // Factors beyond the midpoint would have a corresponding smaller factor already found.
    const midpointValue = Number.parseInt(targetNumber) / 2;

    // Loop through potential divisors starting from 2 up to, but not including, the midpoint.
    for (let iterationIndex = 2; iterationIndex < midpointValue; iterationIndex++) {
        // If the current 'iterationIndex' divides 'targetNumber' evenly
        // AND 'iterationIndex' is greater than the 'currentLargestFactor' we've found,
        if ((targetNumber % iterationIndex === 0) && (iterationIndex > currentLargestFactor)) {
            currentLargestFactor = iterationIndex; // Update our record for the largest factor.
        }
    }

    return currentLargestFactor; // Return the final largest factor discovered.
}

/**
 * This primary function orchestrates the application's execution flow.
 * It reads input, processes it, performs calculations, and outputs results.
 *
 * @param {string} rawInputContent The complete raw string content read from the standard input source.
 */
function initiateProcessing(rawInputContent) {
    // Parse the first line of the raw input content into an integer, discarding any subsequent lines.
    let primaryNumericValue = Number.parseInt(rawInputContent.split('\n')[0]);

    console.log(primaryNumericValue); // Output the primary numeric value that was successfully parsed.

    // Compute the largest factor for the 'primaryNumericValue' using our dedicated function.
    let calculatedFactor = findLargestFactor(primaryNumericValue);

    // Perform a specific arithmetic operation involving the calculated factor and the primary numeric value,
    // then display the final computed result to the console.
    console.log(calculatedFactor - 1 + primaryNumericValue / calculatedFactor - 1);
}

// Begin the program execution by calling the main processing function.
// It reads all data from the standard input stream ('/dev/stdin') using UTF-8 encoding
// and passes it as a string to 'initiateProcessing'.
initiateProcessing(require('node:fs').readFileSync('/dev/stdin', 'utf8'));