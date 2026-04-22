"use strict";

// This program processes numerical data from standard input to compute a specific result.
// It reads configuration parameters (N and K) and a list of integers,
// then locates the smallest value in the list and applies a formula involving its index.

/**
 * Reads raw input from a specified file path, processes it into an array of lines.
 * Ensures that the input has at least two significant lines for configuration and data.
 * @param {string} sourceFilePath - The path to the input source (e.g., '/dev/stdin').
 * @returns {string[]} An array where each element is a trimmed line of input.
 */
const retrieveAndProcessInputLines = (sourceFilePath) => {
    // Utilize Node.js file system module to synchronously read the file.
    const fileContents = require("fs").readFileSync(sourceFilePath, "utf8");

    // Clean up the raw content: trim leading/trailing whitespace, then split by newline.
    // Filter out any lines that become empty after trimming, ensuring valid data lines.
    const significantLines = fileContents
        .trim()
        .split("\n")
        .filter(line => line.length > 0);

    // Basic validation: The problem expects at least two lines (one for settings, one for data).
    if (significantLines.length < 2) {
        console.error("Fatal Error: Insufficient input provided. Expected at least two non-empty lines.");
        process.exit(1); // Terminate execution with an error code.
    }

    return significantLines;
};

// --- Configuration Constants for Input Parsing ---
const CONFIGURATION_LINE_INDEX = 0; // The first line in the input array.
const NUMERIC_DATA_LINE_INDEX = 1;  // The second line in the input array.
const N_PARAMETER_POSITION = 0;     // N is the first token on the configuration line.
const K_PARAMETER_POSITION = 1;     // K is the second token on the configuration line.
const TOKEN_DELIMITER = " ";        // Space character used to separate values on a line.

/**
 * Locates the smallest numerical value within an array and returns an object
 * containing both the value and its first occurrence's index.
 * Handles cases where the input array might be empty or invalid.
 * @param {number[]} arrayOfNumbers - An array of numerical values to search through.
 * @returns {{minimumValue: number, firstIndex: number}} An object with the found minimum and its index.
 */
const findMinimumElementWithItsIndex = (arrayOfNumbers) => {
    // Validate input array: must be non-null and contain at least one element.
    if (!Array.isArray(arrayOfNumbers) || arrayOfNumbers.length === 0) {
        console.error("Error: Attempted to find minimum in an empty or invalid array.");
        // Return a default or sentinel value indicating failure to find.
        return { minimumValue: Infinity, firstIndex: -1 };
    }

    let currentSmallestValue = arrayOfNumbers[0];
    let currentSmallestIndex = 0;

    // Iterate through the array starting from the second element.
    for (let i = 1; i < arrayOfNumbers.length; i++) {
        const itemUnderConsideration = arrayOfNumbers[i];
        // If the current item is strictly smaller, update the minimum and its index.
        if (itemUnderConsideration < currentSmallestValue) {
            currentSmallestValue = itemUnderConsideration;
            currentSmallestIndex = i;
        }
    }

    return { minimumValue: currentSmallestValue, firstIndex: currentSmallestIndex };
};

/**
 * Performs the main calculation based on the total count (N), segment size (K),
 * and the zero-based index of the minimum element found in the data list.
 * Includes robust validation for N and K to prevent mathematical errors.
 * @param {number} totalCountN - The total number of elements as specified by N.
 * @param {number} segmentSizeK - The segment size parameter as specified by K.
 * @param {number} minElementPosition - The 0-based index of the minimum element in the list.
 * @returns {number} The final computed numerical result.
 * @throws {Error} If critical input parameters (N, K) are invalid or lead to undefined calculations.
 */
const executeCoreComputation = (totalCountN, segmentSizeK, minElementPosition) => {
    // Parameter validation: Ensure N and K are positive integers.
    if (!Number.isInteger(totalCountN) || totalCountN <= 0) {
        throw new Error(`Invalid parameter 'totalCountN' (${totalCountN}). Must be a positive integer.`);
    }
    if (!Number.isInteger(segmentSizeK) || segmentSizeK <= 0) {
        throw new Error(`Invalid parameter 'segmentSizeK' (${segmentSizeK}). Must be a positive integer.`);
    }

    // Additional validation for the index.
    if (minElementPosition < 0) {
        throw new Error("Cannot perform computation: Minimum element position is invalid (negative).");
    }

    // Define helper for ceiling division to enhance readability and handle potential edge cases.
    const calculateCeilingQuotient = (numerator, denominator) => {
        if (denominator === 0) {
            // Division by zero is a critical error in this context as it implies an invalid K.
            throw new Error(`Division by zero detected: Denominator is 0 for numerator ${numerator}. Check K parameter.`);
        }
        return Math.ceil(numerator / denominator);
    };

    // Intermediate variables for the divisors to improve clarity and maintainability.
    const divisorFirstTerm = segmentSizeK - 1;
    const divisorSecondTerm = totalCountN - segmentSizeK - 1;

    // Check for potential division by zero before calling the helper.
    // This often happens if K=1 (first divisor is 0) or K=N-1 (second divisor is 0).
    // The problem context for such a formula usually implies 1 < K < N-1.
    if (divisorFirstTerm <= 0 || divisorSecondTerm <= 0) {
        console.warn(`Warning: Computed divisors are non-positive (K-1=${divisorFirstTerm}, N-K-1=${divisorSecondTerm}). This may lead to division by zero or negative divisors.`);
        // The helper will throw if it's exactly zero. If negative, Math.ceil still works but result might be unexpected.
    }

    // Calculate the two main terms of the formula.
    const firstCalculatedTerm = calculateCeilingQuotient(minElementPosition, divisorFirstTerm);
    const secondCalculatedTerm = calculateCeilingQuotient(minElementPosition, divisorSecondTerm);

    // Sum the terms to get the final result.
    const finalResult = firstCalculatedTerm + secondCalculatedTerm;

    return finalResult;
};

// --- Main Program Execution Block (Immediately Invoked Function Expression) ---
(function mainApplicationEntryPoint() {
    // 1. Fetch and preprocess all lines from standard input.
    const processedInputLines = retrieveAndProcessInputLines("/dev/stdin");

    // 2. Parse configuration parameters (N and K) from the first line.
    const configLineContent = processedInputLines[CONFIGURATION_LINE_INDEX];
    const configTokens = configLineContent.split(TOKEN_DELIMITER);

    // Validate that N and K tokens are present.
    if (configTokens.length < 2) {
        console.error("Fatal Error: Configuration line is malformed. Expected two space-separated integers (N K).");
        process.exit(1);
    }

    // Extract N and K as strings and then convert to integers, with validation.
    const nString = configTokens[N_PARAMETER_POSITION];
    const kString = configTokens[K_PARAMETER_POSITION];

    const parsedN = parseInt(nString, 10);
    const parsedK = parseInt(kString, 10);

    // Ensure N and K are valid positive integers.
    if (isNaN(parsedN) || !Number.isInteger(parsedN) || parsedN <= 0) {
        console.error(`Fatal Error: Invalid value for N: '${nString}'. N must be a positive integer.`);
        process.exit(1);
    }
    if (isNaN(parsedK) || !Number.isInteger(parsedK) || parsedK <= 0) {
        console.error(`Fatal Error: Invalid value for K: '${kString}'. K must be a positive integer.`);
        process.exit(1);
    }

    // 3. Parse the list of numbers from the second line.
    const dataLineContent = processedInputLines[NUMERIC_DATA_LINE_INDEX];
    const rawNumberStrings = dataLineContent.split(TOKEN_DELIMITER);

    // Convert each string to an integer, filtering out any non-numeric or empty string results.
    const numericValuesList = rawNumberStrings
        .map(str => parseInt(str.trim(), 10))
        .filter(num => !isNaN(num)); // Remove any NaN entries resulting from failed parsing.

    // Validate that the number of elements in the list matches the specified N.
    if (numericValuesList.length !== parsedN) {
        console.error(`Fatal Error: Mismatch between specified N (${parsedN}) and actual data list length (${numericValuesList.length}).`);
        process.exit(1);
    }

    // 4. Find the minimum element's index in the list.
    const minElementDetails = findMinimumElementWithItsIndex(numericValuesList);

    // Handle case where no minimum was found (e.g., list was empty despite validation).
    if (minElementDetails.firstIndex === -1) {
        console.error("Fatal Error: Could not determine the minimum element's position in the provided list.");
        process.exit(1);
    }

    // 5. Execute the main computation and output the result.
    try {
        const finalCalculatedOutput = executeCoreComputation(parsedN, parsedK, minElementDetails.firstIndex);
        console.log(finalCalculatedOutput);
    } catch (calculationError) {
        console.error(`Fatal Error during computation: ${calculationError.message}`);
        process.exit(1);
    }

})(); // End of main application entry point.