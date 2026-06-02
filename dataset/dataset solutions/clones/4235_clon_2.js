'use strict'; // Enforce strict mode for better error handling and cleaner code.

/**
 * Processes the raw input string to calculate and display a specific value.
 * This function parses numerical arguments from the input and applies a conditional formula.
 *
 * @param {string} rawData - The complete input string, expected to contain space-separated numbers on the first line.
 */
const processInput = (rawData) => {
    // Extract the first line of the input and split it into individual string arguments.
    const parsedArguments = rawData.split('\n')[0].split(' ');

    // Convert the string arguments to integers using base 10.
    // These represent the primary numerical values for the calculation.
    const valA = parseInt(parsedArguments[0], 10); // The first numerical parameter.
    const valB = parseInt(parsedArguments[1], 10); // The second numerical parameter.
    const valC = parseInt(parsedArguments[2], 10); // The third numerical parameter.

    // Evaluate a specific condition based on the relationship between the parsed values.
    // The condition checks if 'valB plus valC times two' is less than 'valA'.
    if (valB + valC * 2 < valA) {
        // If the condition is met, perform a complex calculation and output its floor value.
        // The calculation involves subtracting a derived value from valA,
        // then dividing by another derived value, and finally adding one before flooring.
        console.log(Math.floor((valA - (valB + valC * 2)) / (valB + valC) + 1));
    } else {
        // If the condition is not met, simply output the integer zero.
        console.log(0);
    }
};

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded text.
// Then, pass this content to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
