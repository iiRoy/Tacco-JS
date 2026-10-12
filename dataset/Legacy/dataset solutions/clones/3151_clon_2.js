"use strict"; /* This directive enforces stricter parsing and error handling in the code. */

/**
 * Processes the provided input string to perform a specific calculation.
 * @param {string} inputData - The raw input string, typically from standard input.
 */
const processInput = (inputData) => {
    // Split the input string by newline, take the first line, then split by space.
    // Parse the first three resulting parts as integers.
    const firstVal = parseInt(inputData.split("\n")[0].split(" ")[0]); // Represents the first numeric value.
    const secondVal = parseInt(inputData.split("\n")[0].split(" ")[1]); // Represents the second numeric value.
    const thirdVal = parseInt(inputData.split("\n")[0].split(" ")[2]); // Represents the third numeric value.

    // Calculate the floor of the division of the second value by the first value.
    const divisionResult = Math.floor(secondVal / firstVal);

    // Compare the division result with the third value.
    // If the division result is greater than or equal to the third value, output the third value.
    // Otherwise, output the division result.
    console.log(divisionResult >= thirdVal ? thirdVal : divisionResult);
};

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
