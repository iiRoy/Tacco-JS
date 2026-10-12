"use strict";

// Constant declarations for array indices to improve readability.
const FIRST_VAL_IDX = 0; // Represents the index for the first numerical component.
const SECOND_VAL_IDX = 1; // Represents the index for the second numerical component.
const K_VAL_IDX = 3; // Represents the index for the line containing the 'K' value.

// A large numerical threshold used for comparison.
const MAX_DIFF_THRESHOLD = Math.pow(10, 18);

/**
 * Main function to process the input data.
 * It calculates a difference, checks against a limit, and applies a conditional sign change.
 *
 * @param {string} inputString - The raw string input, typically from standard input.
 */
const processInputData = (inputString) => {
    // Trim whitespace from the input and split it into an array of lines.
    const lineSegments = inputString.trim().split("\n");

    // Parse the first two values as integers and compute their difference.
    const differenceResult = parseInt(lineSegments[FIRST_VAL_IDX], 10) - parseInt(lineSegments[SECOND_VAL_IDX], 10);

    // Retrieve the string from the K_VAL_IDX position.
    const kCharString = lineSegments[K_VAL_IDX];

    // Extract the last character of the K string and convert it to an integer.
    const lastKDigit = parseInt(kCharString.charAt(kCharString.length - 1), 10);

    // Check if the absolute value of the difference exceeds the defined threshold.
    if (Math.abs(differenceResult) > MAX_DIFF_THRESHOLD) {
        // If it exceeds, output "Unfair".
        console.log("Unfair");
    } else {
        // Otherwise, determine the output based on the parity of lastKDigit and the differenceResult.
        // If lastKDigit is even or differenceResult is zero, output differenceResult.
        // If lastKDigit is odd and differenceResult is not zero, output the negative of differenceResult.
        console.log(lastKDigit % 2 === 0 || differenceResult === 0 ? differenceResult : -differenceResult);
    }
};

// Read the entire content from standard input, decode as UTF-8, trim whitespace, and pass to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
