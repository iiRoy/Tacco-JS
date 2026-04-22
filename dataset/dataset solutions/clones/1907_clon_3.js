"use strict";

const STANDARD_INPUT_SOURCE = "/dev/stdin"; // Path to read input from
const fs = require("fs"); // File system module for reading input

/**
 * Reads and processes raw input data into a usable token stream.
 * @param {string} inputPath - The path to the input file.
 * @returns {Array<string>} An array of non-empty string tokens.
 */
function acquireDataTokens(inputPath) {
    // Read the entire file content as a buffer, then convert to UTF-8 string.
    const rawDataBuffer = fs.readFileSync(inputPath);
    const rawContentString = rawDataBuffer.toString('utf8');

    // Split the content by any sequence of whitespace characters (spaces, newlines, tabs)
    // and filter out any empty strings that might result from multiple delimiters.
    const tokens = rawContentString.split(/\s+/).filter(token => token.length > 0);
    return tokens;
}

/**
 * Main logic function to compute the required sum based on input tokens.
 * @param {Array<string>} dataTokens - An array of string tokens representing numbers.
 * @returns {number} The calculated product sum.
 */
function calculateMatchingPairProductSum(dataTokens) {
    // The first token is often a count of following elements, but is not used in the core logic.
    // We parse it and discard it as per the original code's behavior.
    const _initialCountIgnored = parseInt(dataTokens.shift(), 10);

    // Maps to store frequencies of (index + value) and (index - value).
    // Using plain objects for hash maps.
    const sumFrequencyMap = {};
    const differenceFrequencyMap = {};

    // Iterate through the remaining data tokens to populate the frequency maps.
    // The index `idx` here is relative to the `dataTokens` array *after* the shift.
    dataTokens.forEach((tokenValueString, idx) => {
        const numericVal = parseInt(tokenValueString, 10);

        // Basic validation for robustness, though problem constraints usually guarantee valid numbers.
        if (isNaN(numericVal)) {
            // Optionally handle error or skip invalid entries
            // console.warn(`Skipping invalid numeric token: ${tokenValueString}`);
            return;
        }

        // Calculate the sum and difference keys.
        // Explicitly converting to string for object keys is not strictly necessary
        // as numbers are coerced, but it can make intent clearer.
        const currentSumKey = String(idx + numericVal);
        const currentDifferenceKey = String(idx - numericVal);

        // Increment counts in the respective frequency maps.
        // Using the `|| 0` pattern to ensure a default value of 0 for new keys.
        sumFrequencyMap[currentSumKey] = (sumFrequencyMap[currentSumKey] || 0) + 1;
        differenceFrequencyMap[currentDifferenceKey] = (differenceFrequencyMap[currentDifferenceKey] || 0) + 1;
    });

    // Initialize the accumulator for the final result.
    let totalProductAccumulator = 0;

    // Get all unique keys from the sum frequency map.
    const allSumKeys = Object.keys(sumFrequencyMap);

    // Iterate over these keys to find matches in the difference frequency map.
    for (const keyToMatch of allSumKeys) {
        // Check if the current key also exists in the difference frequency map.
        // Using `hasOwnProperty` for safer check against inherited properties.
        if (differenceFrequencyMap.hasOwnProperty(keyToMatch)) {
            const sumCount = sumFrequencyMap[keyToMatch];
            const diffCount = differenceFrequencyMap[keyToMatch];

            // Add the product of counts to the accumulator.
            totalProductAccumulator += (sumCount * diffCount);
        }
    }

    return totalProductAccumulator;
}

// --- Execution Flow ---

// 1. Acquire and parse input tokens.
const inputTokens = acquireDataTokens(STANDARD_INPUT_SOURCE);

// 2. Execute the main calculation logic with the parsed tokens.
const computedResult = calculateMatchingPairProductSum(inputTokens);

// 3. Output the final result.
// The original code had a check for `undefined`, but `calculateMatchingPairProductSum`
// is designed to always return a number, so a direct log is sufficient.
console.log(computedResult);