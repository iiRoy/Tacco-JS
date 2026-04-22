"use strict";

// Import the Node.js file system module for reading input.
const fileSystemUtility = require("fs");

// Read the raw input data from standard input ('/dev/stdin').
// The input is expected to be UTF-8 encoded text.
const rawInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

// Process the raw input:
// 1. Trim any leading or trailing whitespace.
// 2. Split the content into an array of tokens using one or more whitespace characters as delimiters.
let inputTokenBuffer = rawInputContent.trim().split(/\s+/);

// Initialize a pointer to keep track of the current token being processed from the buffer.
let currentTokenPointer = 0;

/**
 * Retrieves the next available token from the input buffer.
 *
 * @param {boolean} shouldReturnAsString - If true, the token is returned as a string.
 *                                         Otherwise, it attempts to convert the token to a number.
 * @returns {string|number} The next token, either as a string or a number.
 */
function retrieveNextToken(shouldReturnAsString) {
    const tokenValue = inputTokenBuffer[currentTokenPointer];
    currentTokenPointer++; // Advance the pointer to the next token
    return shouldReturnAsString ? tokenValue : Number(tokenValue); // Explicit type conversion
}

/**
 * Fetches a specified number of tokens from the input buffer,
 * optionally parsing them all as numeric values.
 *
 * @param {number} numberOfElementsToFetch - The count of tokens to retrieve.
 * @param {boolean} asStrings - If true, tokens are returned as strings.
 *                              If false, tokens are converted to numbers.
 * @returns {Array<string|number>} An array containing the fetched tokens.
 */
function fetchNumericSequence(numberOfElementsToFetch, asStrings) {
    const startIndex = currentTokenPointer;
    const endIndex = currentTokenPointer + numberOfElementsToFetch;
    currentTokenPointer = endIndex; // Update the global pointer for subsequent reads

    const sequenceSlice = inputTokenBuffer.slice(startIndex, endIndex);

    // If numeric conversion is required, map each sliced element to a Number.
    if (!asStrings) {
        return sequenceSlice.map(valueItem => Number(valueItem));
    }
    return sequenceSlice;
}

// Execute the main computational logic of the program.
const programOutput = executeCoreLogic();

// Check if the core logic returned a valid result (not undefined or null)
// and print it to the console if so.
if (programOutput !== undefined && programOutput !== null) {
    console.log(programOutput);
}

/**
 * This is the primary function containing the application's core business logic.
 * It reads a specific set of input values and performs calculations to determine a final score.
 *
 * @returns {number} The computed final score based on the input rules.
 */
function executeCoreLogic() {
    // Retrieve a sequence of 7 numeric values from the input stream.
    const collectedInputValues = fetchNumericSequence(7);

    // --- Type III: Add a guard clause for input validation ---
    if (collectedInputValues.length < 7) {
        console.error("Error: Insufficient input values provided. Expected 7 numeric tokens.");
        // In a real application, one might throw an error or handle this more robustly.
        return 0; // Return a default or error value.
    }

    // Assign specific input values to more descriptive variables for better readability.
    // This clarifies the role of each element in the calculation.
    const initialScoreBase = collectedInputValues[1];
    const categoryA_Count = collectedInputValues[0];
    const categoryB_Count = collectedValues[3];
    const categoryC_Count = collectedValues[4];

    // Calculate the 'even' portions of category counts.
    // Math.floor(x / 2) * 2 effectively gives x - (x % 2),
    // which is the largest even number less than or equal to x.
    const evenPortion_A = Math.floor(categoryA_Count / 2) * 2;
    const evenPortion_B = Math.floor(categoryB_Count / 2) * 2;
    const evenPortion_C = Math.floor(categoryC_Count / 2) * 2;

    // Initialize the running total for the final score.
    // It starts with the base value plus the sum of all 'even' portions.
    let totalComputedScore = initialScoreBase + evenPortion_A + evenPortion_B + evenPortion_C;

    // Determine the sum of odd remainders for categories A, B, and C.
    // This value will be between 0 and 3.
    const sumOfOddRemainders = (categoryA_Count % 2) + (categoryB_Count % 2) + (categoryC_Count % 2);

    // Apply conditional adjustments to the score based on the 'sumOfOddRemainders'.
    switch (sumOfOddRemainders) {
        case 3:
            // If all three categories (A, B, C) have an odd count,
            // add 3 to the total score.
            totalComputedScore += 3;
            break;
        case 2:
            // If exactly two categories have an odd count:
            // Additionally check if all three original category counts (A, B, C) are non-zero.
            // This is a specific condition from the original logic.
            if (categoryA_Count !== 0 && categoryB_Count !== 0 && categoryC_Count !== 0) {
                totalComputedScore += 1;
            }
            break;
        // Cases for 0 or 1 odd remainders do not result in additional score adjustments
        // within this switch statement, so no 'default' or explicit 'case 0' / 'case 1' is needed.
    }

    // Return the final calculated score.
    return totalComputedScore;
}