"use strict"; // Enforce strict mode for cleaner code and better error handling

/**
 * This function serves as the primary entry point for processing input data.
 * It calculates a specific value based on the first character of the input string.
 *
 * @param {string} dataString - The raw input string, typically read from standard input.
 */
const processInput = (dataString) => {
    // First, remove any leading or trailing whitespace from the provided string.
    const trimmedData = dataString.trim();

    // Extract the very first character of the cleaned string and convert it into an integer.
    // This assumes the first character is a valid digit.
    const initialValue = parseInt(trimmedData[0]);

    // Calculate the 'large' component by dividing the initial value by 500.
    // In JavaScript, the '/' operator performs floating-point division.
    const largeUnits = initialValue / 500;

    // Calculate the 'tiny' component. This involves subtracting the product of 'largeUnits'
    // and 500 from the 'initialValue', and then dividing the result by 5.
    // This calculation also uses floating-point division.
    const tinyUnits = (initialValue - largeUnits * 500) / 5;

    // Finally, compute the total result by multiplying 'largeUnits' by 1000 and 'tinyUnits' by 5,
    // then summing these two products. The result is then printed to the console.
    console.log(largeUnits * 1000 + tinyUnits * 5);
};

// The program starts by reading the entire content of standard input as a UTF-8 string.
// This content is then passed to the 'processInput' function for further handling.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
