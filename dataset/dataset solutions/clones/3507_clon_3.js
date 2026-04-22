"use strict";

// This module handles synchronous file system operations for Node.js.
const filesystemUtilityModule = require("fs");

// Define the standard input file path, common in Unix-like systems for competitive programming.
const standardInputSourcePath = "/dev/stdin";

// Specify the character encoding for reading the file contents.
const fileEncodingScheme = "utf8";

// Read the complete raw content from the standard input synchronously.
// Any errors during file reading would typically halt the process here.
let rawInputContent = filesystemUtilityModule.readFileSync(standardInputSourcePath, fileEncodingScheme);

/**
 * Processes the raw input string to extract the very first numeric value encountered.
 * It assumes numbers are delimited by whitespace or newlines.
 * This utility specifically targets single numerical inputs.
 *
 * @param {string} sourceData The string containing the raw input.
 * @returns {number} The first number parsed from the input string.
 * @throws {Error} If no valid numeric tokens can be extracted.
 */
function extractInitialNumericToken(sourceData) {
    // Split the input string into individual tokens using various whitespace characters
    // (space, tab, newline, etc.) as delimiters. Filter out any empty strings.
    const processedTokensArray = sourceData.split(/\s+/).filter(token => token.length > 0);

    // Implement a basic validation check for the presence of tokens.
    if (processedTokensArray.length === 0) {
        throw new Error("Input processing failed: No discernible tokens found for numeric extraction.");
    }

    // Attempt to convert the first token into a number.
    // The unary plus operator is used for a quick type conversion.
    const candidateNumber = +processedTokensArray[0];

    // Perform a more robust validation to ensure the conversion was successful.
    if (isNaN(candidateNumber)) {
        // Log a warning or throw an error if the first token is not a valid number.
        // For this problem, we'll proceed with the NaN, but in real apps, this is crucial.
        console.warn(`Warning: The first token '${processedTokensArray[0]}' could not be reliably parsed as a number.`);
        // A more strict implementation might throw: throw new Error("Invalid numeric input received.");
    }

    return candidateNumber;
}

/**
 * This is the primary execution function of the application.
 * It orchestrates input retrieval, performs the core mathematical calculation,
 * and returns the final computed result.
 *
 * The objective is to find the smallest multiple of 111 that is greater than or equal to the input number.
 *
 * @returns {number} The calculated result, which is a multiple of 111.
 */
function performMainCalculation() {
    // Retrieve the single numeric value required for the calculation from the input buffer.
    const receivedNumericValue = extractInitialNumericToken(rawInputContent);

    // Define the specific divisor constant for this problem.
    const constantDivisor = 111;

    // To calculate ceil(N / D) * D for positive N and D,
    // we can use the formula: floor((N + D - 1) / D) * D.
    // This avoids direct use of Math.ceil and demonstrates an equivalent mathematical rewrite.
    const adjustedNumeratorForCeiling = receivedNumericValue + (constantDivisor - 1);

    // Compute the quotient after adjustment, then floor it.
    const integralQuotient = Math.floor(adjustedNumeratorForCeiling / constantDivisor);

    // Multiply the floored quotient by the divisor to get the final multiple.
    const finalResultMultiple = integralQuotient * constantDivisor;

    return finalResultMultiple;
}

// --- Application Execution Flow ---

// Execute the central logic to obtain the outcome.
const computedApplicationResult = performMainCalculation();

// Define a dedicated function for outputting results to the console.
// This provides a consistent interface for printing.
function displayResultToOutput(valueToPrint) {
    console.log(valueToPrint);
}

// Implement a guard clause to ensure the result is a valid number before printing.
// This enhances robustness by preventing undefined or non-numeric output.
if (typeof computedApplicationResult === 'number' && !isNaN(computedApplicationResult)) {
    displayResultToOutput(computedApplicationResult);
} else {
    // In a production environment, more elaborate error handling would be present.
    // For competitive programming, this branch is often omitted if inputs are guaranteed valid.
    // console.error("Application encountered an issue: Final result is not a valid number.");
}