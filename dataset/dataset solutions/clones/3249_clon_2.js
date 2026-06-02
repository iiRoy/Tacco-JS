'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes an input string to perform a calculation.
 * This function expects a string containing two space-separated numbers.
 * @param {string} inputString The string to be processed.
 */
function processInput(inputString) {
    // Split the incoming string by spaces to get an array of string parts.
    let partsArray = inputString.split(" ");

    // Convert the first two parts to numbers, multiply them, and then divide by two.
    // The result is then printed to the standard output.
    console.log((partsArray[0] * partsArray[1]) / 2);
}

// Read the entire content from standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
