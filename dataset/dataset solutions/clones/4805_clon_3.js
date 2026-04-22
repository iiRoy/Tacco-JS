'use strict';

/**
 * A utility function responsible for parsing a string line containing space-separated numbers
 * into an array of numeric values. It handles conversion to Number type.
 * @param {string} lineContent - The input string line to be parsed.
 * @returns {Array<number>} An array where each element is a number parsed from the input string.
 */
function extractNumericValues(lineContent) {
    return lineContent.split(' ').map(strVal => {
        const parsedNum = Number(strVal);
        // A simple validation: if parsedNum is NaN, return 0 or throw error,
        // for this clone, we assume valid input as per original.
        return parsedNum;
    });
}

/**
 * Computes the aggregate sum of all numeric elements within a given array.
 * This function serves as a helper to calculate total durations.
 * @param {Array<number>} numericDataset - The array of numbers whose sum is to be calculated.
 * @returns {number} The total sum of the elements in the array.
 */
function sumAllElements(numericDataset) {
    let cumulativeSum = 0;
    // Using a traditional for loop for a slightly different look than reduce or for...of
    for (let i = 0; i < numericDataset.length; i++) {
        cumulativeSum += numericDataset[i];
    }
    return cumulativeSum;
}

/**
 * The primary function that orchestrates the processing of raw input data.
 * It parses initial configurations and then applies a series of modifications,
 * calculating and returning the adjusted total duration for each modification scenario.
 * @param {string} rawInputString - The entire input content received as a single string.
 * @returns {Array<string>} An array of strings, where each string represents a calculated
 *                          adjusted total duration for a corresponding modification.
 */
function orchestrateDataProcessing(rawInputString) {
    const contentLines = rawInputString.trim().split('\n');

    // Type III: Add a robust check for minimum required input lines.
    // This adds a new fragment (validation logic).
    if (contentLines.length < 4) {
        console.error("Error: Input data is incomplete. Expected at least 4 lines (N, T, M, and at least one PX entry).");
        return []; // Return an empty array indicating no valid output could be generated.
    }

    // Renaming identifiers for Type II changes.
    const initialItemCount = Number(contentLines[0]); // Corresponds to N
    const baseDurationMeasurements = extractNumericValues(contentLines[1]); // Corresponds to T
    const modificationOperationCount = Number(contentLines[2]); // Corresponds to M

    // Type III: Using slice to extract modification instructions,
    // which is functionally similar to original's splice but keeps `contentLines` intact.
    const modificationRequests = contentLines.slice(3, 3 + modificationOperationCount); // Corresponds to PX

    // Calculate the initial total duration using a helper function.
    const totalOriginalDuration = sumAllElements(baseDurationMeasurements); // Corresponds to defaltTime

    const computedAdjustedDurations = []; // Array to store results, instead of direct console.log

    // Iterate through each modification request.
    for (const currentModRequestString of modificationRequests) {
        // Renaming and using destructuring for clarity.
        const [targetPositionOneIndexed, newDurationValue] = extractNumericValues(currentModRequestString);

        // Type III: Add a guard clause for out-of-bounds indices.
        // This is a new fragment (validation and error handling).
        if (targetPositionOneIndexed < 1 || targetPositionOneIndexed > initialItemCount) {
            console.warn(`Warning: Skipping modification for invalid position ${targetPositionOneIndexed}. Position is out of expected range (1 to ${initialItemCount}).`);
            continue; // Skip this iteration and proceed to the next modification.
        }

        const zeroBasedIndex = targetPositionOneIndexed - 1; // Adjust to 0-based array index.

        // Retrieve the original duration value at the specified position.
        const durationValueToReplace = baseDurationMeasurements[zeroBasedIndex];

        // Type III: Rewrite the calculation for adjusted time.
        // The original logic was `defaltTime - (T[p-1] - x)`.
        // This is mathematically equivalent to `(defaltTime - T[p-1]) + x`.
        // This version makes it explicit: subtract the old value, then add the new value.
        const currentScenarioTotalDuration = (totalOriginalDuration - durationValueToReplace) + newDurationValue;

        // Store the result as a string.
        computedAdjustedDurations.push(String(currentScenarioTotalDuration));
    }

    return computedAdjustedDurations;
}

// --- Execution Entry Point ---
// Reorganized and renamed the file system access part for Type II changes.
const fileIOModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const textEncoding = 'utf8';

try {
    const entireInputContent = fileIOModule.readFileSync(standardInputFilePath, textEncoding);
    const finalResults = orchestrateDataProcessing(entireInputContent);

    // Type III: Print all results at once after computation, instead of inside the loop.
    // This changes the output mechanism from immediate logging to batch logging.
    finalResults.forEach(outputLine => console.log(outputLine));
} catch (error) {
    // Type III: Added basic error handling for file reading.
    console.error(`An error occurred during input processing: ${error.message}`);
}