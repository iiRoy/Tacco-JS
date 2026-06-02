'use strict'; // Enforce strict mode for better code quality and error handling

/**
 * Processes the given input string to determine a balance status.
 * The input is expected to contain four numbers separated by newlines or spaces.
 *
 * @param {string} rawData The raw input string containing numbers.
 */
function processInput(rawData) {

    // Split the input string by newlines or spaces, then convert each resulting part to an integer.
    // The `~~` operator is a concise way to convert a value to an integer (equivalent to Math.floor for positive numbers, Math.ceil for negative).
    rawData = rawData.split(/\n|\s/).map(val => ~~val);

    // Calculate the difference between the sum of the first two numbers and the sum of the last two numbers.
    const totalDifference = rawData[0] + rawData[1] - (rawData[2] + rawData[3]);

    let resultString = 'Balanced'; // Initialize the output string to 'Balanced' by default.

    // Check the calculated difference to determine if it's 'Left', 'Right', or 'Balanced'.
    if (totalDifference > 0) {
        resultString = 'Left'; // If the difference is positive, the 'left' side is heavier.
    } else if (totalDifference < 0) {
        resultString = 'Right'; // If the difference is negative, the 'right' side is heavier.
    }
    // Output the final determined balance status to the console.
    console.log(resultString);

}

// Read the input from standard input using Node.js's file system module,
// then call the main processing function with the read data.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
